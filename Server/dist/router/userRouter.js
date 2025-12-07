"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controller/userController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post("/signup", userController_1.signup);
router.post("/login", userController_1.login);
router.get("/profile", auth_1.auth, userController_1.getProfile);
exports.default = router;
