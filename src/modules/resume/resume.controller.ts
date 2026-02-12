import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types/express";
import * as ResumeService from "./resume.service";


/**
 * POST /api/resumes
 */
const createResume = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    console.log(req.body);
    try {
        const userId = req.user!.id;
        const { title } = req.body;

        const resume = await ResumeService.createResume(userId, title);

        res.status(201).json(resume);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/resumes
 */
const getUserResumes = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;

        const resumes = await ResumeService.getUserResumes(userId);

        res.json(resumes);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/resumes/:id
 */
const getResumeById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const resumeId = req.params.id as string;

        const resume = await ResumeService.getResumeById(
            userId,
            resumeId
        );

        res.json(resume);
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/resumes/:id
 */
const deleteResume = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const resumeId = req.params.id as string;

        await ResumeService.deleteResume(userId, resumeId);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/resumes/:id/sections
 */
const createSection = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const resumeId = req.params.id as string;
        const { type, content, order } = req.body;

        const section = await ResumeService.createSection(
            userId,
            resumeId,
            type,
            content,
            order
        );

        res.status(201).json(section);
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH /api/sections/:id
 */
const updateSection = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const sectionId = req.params.id as string;
        const { content } = req.body;

        const updatedSection = await ResumeService.updateSection(
            userId,
            sectionId,
            content
        );

        res.json(updatedSection);
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/sections/:id
 */
const deleteSection = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const sectionId = req.params.id as string;

        await ResumeService.deleteSection(userId, sectionId);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
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
