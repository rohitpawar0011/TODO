"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.signup = void 0;
const userModel_1 = require("../models/userModel");
const userSchema_1 = require("../zodSchemas/userSchema");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Received signup request with body:', req.body);
        const validation = userSchema_1.signupSchema.safeParse(req.body);
        if (!validation.success) {
            console.log('Validation failed:', validation.error.errors);
            return res.status(400).json({ message: "Invalid input", errors: validation.error.errors });
        }
        const { email, password, name } = validation.data;
        // Check if user already exists
        const existingUser = yield userModel_1.UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }
        // Hash password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create user
        const user = yield userModel_1.UserModel.create({
            email,
            password: hashedPassword,
            name,
        });
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in .env file");
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        res.status(201).json({
            message: "User created successfully",
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
        });
    }
    catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.signup = signup;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Received login request with body:', req.body);
        const validation = userSchema_1.loginSchema.safeParse(req.body);
        if (!validation.success) {
            console.log('Login validation failed:', validation.error.errors);
            return res.status(400).json({ message: "Invalid input", errors: validation.error.errors });
        }
        const { email, password } = validation.data;
        console.log('Login validation passed, finding user...');
        // Find user
        const user = yield userModel_1.UserModel.findOne({ email });
        if (!user) {
            console.log('No user found with email:', email);
            return res.status(401).json({ message: "Invalid credentials" });
        }
        console.log('User found, checking password...');
        // Check password
        const isValidPassword = yield bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({ message: "Invalid credentials" });
        }
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined!');
            throw new Error("JWT_SECRET is not defined in .env file");
        }
        console.log('Password valid, generating JWT...');
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        console.log('Login successful for user:', user._id);
        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.login = login;
const getProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.UserModel.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            id: user._id,
            email: user.email,
            name: user.name,
        });
    }
    catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getProfile = getProfile;
