import { Router } from "express";
import * as ResumeController from "./resume.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

// All routes protected
router.use(authMiddleware);
router.post("/:id/sections", ResumeController.createSection);
router.patch("/sections/:id", ResumeController.updateSection);
router.delete("/sections/:id", ResumeController.deleteSection);

router.post("/", ResumeController.createResume);
/**
 * @swagger
 * /api/resume:
 *   get:
 *     summary: Get user resumes
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumes fetched successfully
 */
router.get("/", ResumeController.getUserResumes);
router.get("/:id", ResumeController.getResumeById);
router.delete("/:id", ResumeController.deleteResume);



export default router;