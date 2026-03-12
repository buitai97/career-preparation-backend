import prisma from "../../config/prisma";
import { generateFeedback, generateInterviewQuestions } from "../ai/ai.service";
import { AIFeedback } from "../ai/ai.type";

const ALLOWED_INTERVIEW_TYPES = ["TECHNICAL", "BEHAVIORAL", "MIXED"] as const;
type InterviewType = (typeof ALLOWED_INTERVIEW_TYPES)[number];

const normalizeInterviewType = (
    interviewType?: string
): InterviewType | undefined => {
    if (!interviewType) return undefined;
    const normalizedType = interviewType.trim().toUpperCase();
    return ALLOWED_INTERVIEW_TYPES.includes(normalizedType as InterviewType)
        ? (normalizedType as InterviewType)
        : undefined;
};

const normalizeSentences = (text: string): string[] => {
    return text
        .split(/[\n.;]+/)
        .map((item) => item.trim())
        .filter(Boolean);
};

const scoreBandSummary = (score: number): string => {
    if (score >= 85) return "Strong performance overall. Your responses were clear and well-structured.";
    if (score >= 70) return "Solid session overall. Your foundation is good with room for sharper storytelling.";
    if (score >= 55) return "Developing performance. Focus on clearer structure and impact statements.";
    return "Early-stage performance. Prioritize STAR structure, specificity, and measurable outcomes.";
};

const buildSessionOverallFeedback = async (sessionId: string) => {
    const session = await prisma.interviewSession.findUnique({
        where: { id: sessionId },
        include: {
            questions: {
                include: {
                    answers: {
                        include: { feedback: true },
                    },
                },
            },
        },
    });

    if (!session) return null;

    const feedbacks = session.questions.flatMap((question) =>
        question.answers
            .map((answer) => answer.feedback)
            .filter((feedback): feedback is NonNullable<typeof feedback> => Boolean(feedback))
    );

    if (!feedbacks.length) return null;

    const strengths = Array.from(
        new Set(
            feedbacks.flatMap((feedback) => normalizeSentences(feedback.strengths))
        )
    ).slice(0, 3);

    const improvements = Array.from(
        new Set(
            feedbacks.flatMap((feedback) => normalizeSentences(feedback.improvements))
        )
    ).slice(0, 3);

    const avgScore = feedbacks.reduce((sum, feedback) => sum + feedback.score, 0) / feedbacks.length;

    return {
        overallScore: avgScore,
        summary: scoreBandSummary(avgScore),
        topStrengths: strengths,
        focusAreas: improvements,
    };
};

export const createSession = async (
    userId: string,
    role: string,
    resumeId?: string,
    interviewType?: string
) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
    });

    if (!user) {
        throw { status: 401, message: "Session expired. Please log in again." };
    }

    const normalizedInterviewType = normalizeInterviewType(interviewType);
    const session = await prisma.interviewSession.create({
        data: {
            userId,
            role,
            resumeId: resumeId || null,
            interviewType: normalizedInterviewType,
        },
        include: {
            questions: true,
        },
    });

    // Generate AI questions
    const questions = await generateInterviewQuestions(
        role,
        normalizedInterviewType || "TECHNICAL"
    );

    const createdQuestions = [];
    for (const question of questions) {
        const createdQuestion = await prisma.interviewQuestion.create({
            data: {
                sessionId: session.id,
                question,
            },
        });
        createdQuestions.push(createdQuestion);
    }
    session.questions = createdQuestions;
    return { session };
};

export const addQuestion = async (
    userId: string,
    sessionId: string,
    question: string
) => {
    const session = await prisma.interviewSession.findFirst({
        where: {
            id: sessionId,
            userId,
        },
    });

    if (!session) {
        throw new Error("Session not found or unauthorized");
    }

    return prisma.interviewQuestion.create({
        data: {
            sessionId,
            question,
        },
    });
};

export const submitAnswer = async (
    userId: string,
    questionId: string,
    answer: string
) => {
    const fullQuestion = await prisma.interviewQuestion.findFirst({
        where: {
            id: questionId,
            session: {
                userId,
            },
        },
    });

    if (!fullQuestion) {
        throw new Error("Question not found or unauthorized");
    }

    const createdAnswer = await prisma.interviewAnswer.create({
        data: {
            questionId,
            answer,
        },
    });

    const aiFeedback: AIFeedback = await generateFeedback(
        fullQuestion.question,
        answer
    );
    const createdFeedback = await prisma.answerFeedback.create({
        data: {
            answerId: createdAnswer.id,
            score: aiFeedback.score,
            strengths: aiFeedback.strengths || "",
            improvements: aiFeedback.improvements || "",
        },
    });
    await finalizeSessionIfComplete(fullQuestion.sessionId);

    const session = await prisma.interviewSession.findUnique({
        where: { id: fullQuestion.sessionId },
        select: { status: true },
    });

    return {
        answerId: createdAnswer.id,
        questionId,
        feedback: {
            score: createdFeedback.score,
            strengths: createdFeedback.strengths,
            improvements: createdFeedback.improvements,
        },
        sessionCompleted: session?.status === "COMPLETED",
        overallFeedback:
            session?.status === "COMPLETED"
                ? await buildSessionOverallFeedback(fullQuestion.sessionId)
                : null,
    };
};

export const addFeedback = async (
    userId: string,
    answerId: string,
    score: number,
    strengths: string,
    improvements: string
) => {
    const answer = await prisma.interviewAnswer.findFirst({
        where: {
            id: answerId,
            question: {
                session: {
                    userId,
                },
            },
        },
    });

    if (!answer) {
        throw new Error("Answer not found or unauthorized");
    }

    return prisma.answerFeedback.create({
        data: {
            answerId,
            score,
            strengths,
            improvements,
        },
    });
};

const finalizeSessionIfComplete = async (sessionId: string) => {
    const questions = await prisma.interviewQuestion.findMany({
        where: { sessionId },
        include: {
            answers: {
                include: {
                    feedback: true,
                },
            },
        },
    });

    // Check if every question has at least one answer with feedback
    const allAnswered = questions.every((q) =>
        q.answers.some((a) => a.feedback)
    );

    if (!allAnswered) return;

    // Collect all feedback scores
    const scores = questions.flatMap((q) =>
        q.answers
            .filter((a) => a.feedback)
            .map((a) => a.feedback!.score)
    );

    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    await prisma.interviewSession.update({
        where: { id: sessionId },
        data: {
            status: "COMPLETED",
            overallScore: avgScore,
            completedAt: new Date(),
        },
    });
};

export const getInterviewAnalytics = async (userId: string) => {
    const sessions = await prisma.interviewSession.findMany({
        where: {
            userId,
            status: "COMPLETED",
        },
        orderBy: {
            completedAt: "asc",
        },
    });

    if (sessions.length === 0) {
        return {
            totalSessions: 0,
            completedSessions: 0,
            averageScore: 0,
            bestScore: 0,
            worstScore: 0,
            recentTrend: [],
        };
    }

    const scores = sessions
        .map((s) => s.overallScore)
        .filter((score): score is number => score !== null);

    const totalSessions = sessions.length;

    const averageScore =
        scores.reduce((sum, score) => sum + score, 0) / scores.length;

    const bestScore = Math.max(...scores);
    const worstScore = Math.min(...scores);

    const recentTrend = sessions.map((s) => ({
        date: s.completedAt,
        score: s.overallScore,
    }));

    return {
        totalSessions,
        completedSessions: totalSessions,
        averageScore,
        bestScore,
        worstScore,
        recentTrend,
    };
};
