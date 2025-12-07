import { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/userModel";
import { signupSchema, loginSchema } from "../zodSchemas/userSchema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/auth";

export const signup = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        console.log('Received signup request with body:', req.body);
        const validation = signupSchema.safeParse(req.body);
        if (!validation.success) {
            console.log('Validation failed:', validation.error.errors);
            return res.status(400).json({ message: "Invalid input", errors: validation.error.errors });
        }

        const { email, password, name } = validation.data;

        // Check if user already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await UserModel.create({
            email,
            password: hashedPassword,
            name,
        });

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in .env file");
        }

        // Generate JWT
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
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
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        console.log('Received login request with body:', req.body);
        const validation = loginSchema.safeParse(req.body);
        if (!validation.success) {
            console.log('Login validation failed:', validation.error.errors);
            return res.status(400).json({ message: "Invalid input", errors: validation.error.errors });
        }

        const { email, password } = validation.data;
        console.log('Login validation passed, finding user...');

        // Find user
        const user = await UserModel.findOne({ email });
        if (!user) {
            console.log('No user found with email:', email);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log('User found, checking password...');
        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
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
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
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
    } catch (error) {
        console.error("Login error:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const user = await UserModel.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.json({
            id: user._id,
            email: user.email,
            name: user.name,
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
