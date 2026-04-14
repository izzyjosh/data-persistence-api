import { Router } from "express";
import { validateRequest } from "../utils/validate-request";
import { profileController } from "../controllers/profile.controllers";

const profileRouter = Router();

profileRouter.post("/profiles", validateRequest(), (req, res, next) => {
  profileController.classify(req, res, next);
});

export default profileRouter;
