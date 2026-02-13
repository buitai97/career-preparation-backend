import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { addFeedback, addQuestion, createSession, getAnalytics, submitAnswer } from "./interview.controller";
import { aiRateLimiter } from "../../middleware/rateLimit.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/", createSession);
router.get("/analytics", getAnalytics);
router.post("/:sessionId/questions", aiRateLimiter, addQuestion);
router.post("/questions/:questionId/answer", submitAnswer);
router.post("/answers/:answerId/feedback", addFeedback);
export default router;