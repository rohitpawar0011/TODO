import express from "express";
import { signup, login, getProfile } from "../controller/userController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/signup", signup as express.RequestHandler);
router.post("/login", login as express.RequestHandler);
router.get("/profile", auth as express.RequestHandler, getProfile as express.RequestHandler);

export default router;
