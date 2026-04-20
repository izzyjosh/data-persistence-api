import { Request, Response, NextFunction } from "express";

import { profileService } from "../services/genderize.services";
import { successResponse } from "../utils/responses";
import { StatusCodes } from "http-status-codes";

import {
  ListProfileDTO,
  CreateProfileDTO,
  ProfileResponseDTO,
} from "../schemas/profile.schemas";
import { SelectQueryBuilder } from "typeorm";

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
        successResponse<ProfileResponseDTO>({
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

      res
        .status(StatusCodes.OK)
        .json(successResponse<ProfileResponseDTO>({ data: result }));
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
      const validatedQuery = (req as any).validatedQuery.data;

      const response = await profileService.getAllProfiles(validatedQuery);

      res.status(StatusCodes.OK).json(
        successResponse<ListProfileDTO[]>({
          page: response.page,
          limit: response.limit,
          total: response.total,
          data: response.profiles,
        }),
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
