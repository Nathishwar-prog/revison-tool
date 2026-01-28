import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { hashPassword, signToken } from "@/lib/auth";
import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const validation = registerSchema.safeParse(body);
        if (!validation.success) {
            const firstError = validation.error.issues[0]?.message || "Validation failed";
            return NextResponse.json({ 
                error: firstError
            }, { status: 400 });
        }

        const { name, email, password } = validation.data;

        const existing = await db.query.users.findFirst({
            where: eq(users.email, email.toLowerCase()),
        });

        if (existing) {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }

        const passwordHash = await hashPassword(password);

        const [newUser] = await db.insert(users).values({
            name,
            email: email.toLowerCase(),
            passwordHash,
        }).returning();

        const token = signToken({ id: newUser.id, email: newUser.email, name: newUser.name });

        return NextResponse.json({ 
            token, 
            user: { id: newUser.id, name: newUser.name, email: newUser.email } 
        });
    } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
