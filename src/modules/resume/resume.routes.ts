import { Router } from "express";
import * as ResumeController from "./resume.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

// All routes protected
router.use(authMiddleware);

/**
 * @swagger
 * /api/resumes/{id}/sections:
 *   post:
 *     summary: Create a new section in a resume
 *     tags: [Section]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: json
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Section created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/:id/sections", ResumeController.createSection);

/**
 * @swagger
 * /api/resumes/{id}/sections:
 *   patch:
 *     summary: Update an existing section in a resume
 *     tags: [Section]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: json
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Section updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.patch("/sections/:id", ResumeController.updateSection);

/**
 * @swagger
 * /api/resumes/{id}/sections:
 *   delete:
 *     summary: Delete a section from a resume
 *     tags: [Section]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Section deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete("/sections/:id", ResumeController.deleteSection);

/**
 * @swagger
 * /api/resumes:
 *   post:
 *     summary: Create a new resume
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Resume created successfully
 */
router.post("/", ResumeController.createResume);
/**
 * @swagger
 * /api/resumes:
 *   get:
 *     summary: Get user resumes
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumes fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/", ResumeController.getUserResumes);
/**
 * @swagger
 * /api/resumes/{id}:
 *  get:
 *      summary: Get resume by ID
 *      tags: [Resume]
 *      security:
 *         - bearerAuth: []
 *      responses:
 *        200:
 *          description: Resume fetched successfully
 *        404:
 *          description: Resume not found
 */
router.get("/:id", ResumeController.getResumeById);
/**
 * @swagger
 * /api/resumes:
 *   delete:
 *     summary: Delete a resume
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Resume deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete("/:id", ResumeController.deleteResume);



export default router;