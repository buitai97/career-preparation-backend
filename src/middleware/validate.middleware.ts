import { z } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
    (schema: z.ZodSchema) =>
        (req: Request, res: Response, next: NextFunction) => {
            try {
                req.body = schema.parse(req.body);
                next();
            } catch (error) {
                next(error);
            }
        };