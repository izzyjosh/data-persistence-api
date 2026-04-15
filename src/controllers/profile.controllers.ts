import { Request, Response, NextFunction } from "express";

import { profileService } from "../services/genderize.services";
import { successResponse } from "../utils/responses";
import { StatusCodes } from "http-status-codes";

class ProfileController {
  async classify(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const name = (req as any).validatedBody.name;
      const result = await profileService.classify(name);
      res.status(result.statusCode).json(
        successResponse({
          data: result.profile,
          ...(result.message !== undefined ? { message: result.message } : {}),
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async getProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = (req as any).params?.id;
      const result = await profileService.getProfile(id);

      res.status(StatusCodes.OK).json(successResponse({ data: result }));
    } catch (error) {
      next(error);
    }
  }

  async allProfiles(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { gender, country_id, age_group } = req.query;

      const filters = {
        ...(gender ? { gender: String(gender) } : {}),
        ...(country_id ? { country_id: String(country_id) } : {}),
        ...(age_group ? { age_group: String(age_group) } : {}),
      };

      const response = await profileService.getAllProfiles(filters);

      res
        .status(StatusCodes.OK)
        .json(
          successResponse({ data: response.profiles, count: response.count }),
        );
    } catch (error) {
      next(error);
    }
  }

  async deleteProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = (req as any).params?.id;
      await profileService.deleteProfile(id);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }
}

export const profileController = new ProfileController();
