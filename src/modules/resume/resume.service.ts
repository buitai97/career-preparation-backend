import prisma from "../../config/prisma";
import { Resume, ResumeSectionType } from "../../generated/prisma/client";

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

export {
    createResume,
    getUserResumes,
    getResumeById,
    deleteResume,
    createSection,
    updateSection,
    deleteSection,
};