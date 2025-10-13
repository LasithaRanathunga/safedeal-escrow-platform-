import { validationResult } from "express-validator";

import type { Request, Response, NextFunction } from "express";

export default function validateRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err: any) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
}
