import { Request, Response, NextFunction } from "express";

import { profileService } from "../services/genderize.services";
import { successResponse } from "../utils/responses";

class ProfileController {
  async classify(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const name = (req as any).validatedBody.name;
      const result = await profileService.classify(name);
      res
        .status(result.statusCode)
        .json(successResponse(result.profile, result.message));
    } catch (error) {
      next(error);
    }
  }
}

export const profileController = new ProfileController();
