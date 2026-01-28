import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
}

export interface JWTPayload {
    id: string;
    email: string;
    name: string;
}

export const signToken = (payload: JWTPayload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): JWTPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        return null;
    }
};

export const hashPassword = (password: string) => bcrypt.hash(password, 10);

export const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);
