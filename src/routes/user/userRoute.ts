import express, { Router } from "express";
import {
  LoginController,
  SignupController,
} from "../../contollers/user.controller";

const router: Router = express.Router();

router.post("/login", LoginController);
router.post("/create-profile", SignupController);

export default router;
