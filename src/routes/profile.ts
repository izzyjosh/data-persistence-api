import { Router } from "express";
import { validateRequest } from "../utils/validate-request";
import { profileController } from "../controllers/profile.controllers";

const profileRouter = Router();

profileRouter.post("/profiles", validateRequest(), (req, res, next) => {
  profileController.classify(req, res, next);
});

profileRouter.get("/profiles", (req, res, next) => {
  profileController.allProfiles(req, res, next);
});

profileRouter.get("/profiles/:id", (req, res, next) => {
  profileController.getProfile(req, res, next);
});

profileRouter.delete("/profiles/:id", (req, res, next) => {
  profileController.deleteProfile(req, res, next);
});

export default profileRouter;
