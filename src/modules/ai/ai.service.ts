import OpenAI from "openai";
import { AIFeedback, AIFeedbackSchema } from "./ai.type";


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const getFallbackInterviewQuestions = (
    role: string,
    interviewType: "TECHNICAL" | "BEHAVIORAL" | "MIXED"
): string[] => {
    const baseRole = role.trim() || "software engineer";

    if (interviewType === "BEHAVIORAL") {
        return [
            `Tell me about a time you had a disagreement while working as a ${baseRole}. How did you resolve it?`,
            "Describe a situation where you had to prioritize multiple deadlines. What was your process?",
            "Share an example of a project mistake you made and what you changed afterward.",
            "Tell me about a time you influenced a teammate or stakeholder without direct authority.",
            "Describe a high-pressure situation and how you stayed effective.",
        ];
    }

    if (interviewType === "MIXED") {
        return [
            `What core skills are most important for a ${baseRole}, and how have you applied them recently?`,
            "Explain a technical decision you made and the tradeoffs you considered.",
            "Describe a project where collaboration was critical to success.",
            "Walk through how you debug a production issue with limited information.",
            "Tell me about a time you improved performance, quality, or reliability.",
        ];
    }

    return [
        `Walk me through a recent technical project you completed as a ${baseRole}.`,
        "How do you approach debugging a failing feature in production?",
        "Describe how you would design a scalable API for heavy read traffic.",
        "What testing strategy would you use for a critical user-facing feature?",
        "How do you identify and fix performance bottlenecks in an application?",
    ];
};

export const generateInterviewQuestions = async (
    role: string,
    interviewType: "TECHNICAL" | "BEHAVIORAL" | "MIXED" = "TECHNICAL"
): Promise<string[]> => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "You are an interviewer. Generate 5 concise interview questions.",
                },
                {
                    role: "user",
                    content: `Generate 5 ${interviewType.toLowerCase()} interview questions for a ${role} position. Return them as a numbered list.`,
                },
            ],
            temperature: 0.7,
        });

        const text = response.choices[0].message.content || "";
        const questions = text
            .split("\n")
            .map((q) => q.replace(/^\d+[\).\s-]*/, "").trim())
            .filter(Boolean)
            .slice(0, 5);

        if (questions.length >= 3) {
            return questions;
        }
    } catch {
        // Fall through to deterministic local fallback questions.
    }

    return getFallbackInterviewQuestions(role, interviewType);
};

export const generateFeedback = async (
    question: string,
    answer: string
): Promise<AIFeedback> => {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content:
                    "You are an expert technical interviewer. Provide structured feedback with score (0-10), strengths, and improvements.",
            },
            {
                role: "user",
                content: `
Question: ${question}

Answer: ${answer}

Return JSON in this exact format:

{
  "score": number (0-10),
  "strengths": "string",
  "improvements": "string"
}
`,
            },
        ],
        temperature: 0.4,
    });

    const content = response.choices[0].message.content;
    if (!content) {
        throw new Error("Empty response from AI feedback model");
    }

    // Strip markdown code fences if present
    const jsonText = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const raw = JSON.parse(jsonText);

    // Runtime validation
    const parsed = AIFeedbackSchema.parse(raw);

    return parsed;
};
