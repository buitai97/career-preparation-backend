import prisma from "../../config/prisma";
import { ResumeSectionType } from "../../generated/prisma/client";
import { generateResumeFeedback } from "../ai/ai.service";
import type { Prisma } from "../../generated/prisma/client";

/**
 * Create a new resume
 */
const createResume = async (userId: string, title: string) => {
    return prisma.resume.create({
        data: {
            title,
            userId,
        },
    });
}

/**
 * Get all resumes for a user
 */
const getUserResumes = async (userId: string) => {
    return prisma.resume.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
}

/**
 * Get a single resume (must belong to user)
 */
const getResumeById = async (userId: string, resumeId: string) => {
    const resume = await prisma.resume.findFirst({
        where: {
            id: resumeId,
            userId,
        },
        include: {
            resumeSections: {
                orderBy: { order: "asc" },
            },
        },
    });

    if (!resume) {
        throw new Error("Resume not found");
    }

    return resume;
}

/**
 * Delete resume (ownership enforced)
 */
const deleteResume = async (userId: string, resumeId: string) => {
    const resume = await prisma.resume.findFirst({
        where: {
            id: resumeId,
            userId,
        },
    });

    if (!resume) {
        throw new Error("Resume not found or unauthorized");
    }

    return prisma.resume.delete({
        where: { id: resumeId },
    });
}

/**
 * Create resume section
 */
const createSection = async (
    userId: string,
    resumeId: string,
    type: ResumeSectionType,
    content: any,
    order: number
) => {
    // Verify resume belongs to user
    const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
    });

    if (!resume) {
        throw new Error("Resume not found or unauthorized");
    }

    return prisma.resumeSection.create({
        data: {
            resumeId,
            type,
            content,
            order,
        },
    });
}

/**
 * Update resume section
 */
const updateSection = async (
    userId: string,
    sectionId: string,
    content: any
) => {
    const section = await prisma.resumeSection.findFirst({
        where: {
            id: sectionId,
            resume: {
                userId,
            },
        },
    });

    if (!section) {
        throw new Error("Section not found or unauthorized");
    }

    return prisma.resumeSection.update({
        where: { id: sectionId },
        data: { content },
    });
}

/**
 * Delete resume section
 */
const deleteSection = async (userId: string, sectionId: string) => {
    const section = await prisma.resumeSection.findFirst({
        where: {
            id: sectionId,
            resume: {
                userId,
            },
        },
    });

    if (!section) {
        throw new Error("Section not found or unauthorized");
    }

    return prisma.resumeSection.delete({
        where: { id: sectionId },
    });
}

const analyzeResume = async (userId: string, resumeId: string) => {
    const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
        include: { resumeSections: { orderBy: { order: "asc" } } },
    });

    if (!resume) throw new Error("Resume not found or unauthorized");

    // Build a readable text representation for the AI
    const setupSection = resume.resumeSections.find(
        (s) => s.type === "OTHER" && (s.content as any)?.kind === "SETUP"
    );
    const setup = (setupSection?.content as any)?.payload ?? {};

    const sectionText = (type: string) => {
        const s = resume.resumeSections.find((s) => s.type === type);
        return s ? (s.content as any)?.text ?? "" : "";
    };

    const resumeText = [
        `Name: ${setup.fullName ?? ""}`,
        `Target Role: ${setup.targetRole ?? ""}`,
        setup.targetCompany ? `Target Company: ${setup.targetCompany}` : "",
        `\nSummary:\n${sectionText("OTHER")}`,
        `\nExperience:\n${sectionText("EXPERIENCE")}`,
        `\nSkills:\n${sectionText("SKILLS")}`,
        `\nProjects:\n${sectionText("PROJECT")}`,
        `\nEducation:\n${sectionText("EDUCATION")}`,
    ]
        .filter(Boolean)
        .join("\n");

    const feedback = await generateResumeFeedback(resumeText);

    return prisma.resumeFeedback.upsert({
        where: { resumeId },
        update: {
            score: feedback.score,
            summary: feedback.summary,
            suggestions: feedback.suggestions as Prisma.InputJsonValue,
            sectionTips: feedback.sectionTips as Prisma.InputJsonValue,
        },
        create: {
            resumeId,
            score: feedback.score,
            summary: feedback.summary,
            suggestions: feedback.suggestions as Prisma.InputJsonValue,
            sectionTips: feedback.sectionTips as Prisma.InputJsonValue,
        },
    });
};

export {
    createResume,
    getUserResumes,
    getResumeById,
    deleteResume,
    createSection,
    updateSection,
    deleteSection,
    analyzeResume,
};