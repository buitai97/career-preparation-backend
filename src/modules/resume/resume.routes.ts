import { Router } from "express";
import * as ResumeController from "./resume.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

// All routes protected
router.use(authMiddleware);

router.post("/", ResumeController.createResume);
router.get("/", ResumeController.getUserResumes);
router.get("/:id", ResumeController.getResumeById);
router.delete("/:id", ResumeController.deleteResume);

router.post("/:id/sections", ResumeController.createSection);
router.patch("/sections/:id", ResumeController.updateSection);
router.delete("/sections/:id", ResumeController.deleteSection);

export default router;