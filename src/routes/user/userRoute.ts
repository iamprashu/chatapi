import express, { Router } from "express";
import {
  LoginController,
  SignupController,
} from "../../contollers/UserController";

const router: Router = express.Router();

router.post("/login", LoginController);
router.post("/signup", SignupController);

export default router;
