import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getUser } from "@/lib/getUser";

export async function GET() {
    try {
        const userPayload = await getUser();

        if (!userPayload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await db.query.users.findFirst({
            where: eq(users.id, userPayload.id),
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                dailyRevisionTarget: user.dailyRevisionTarget
            }
        });
    } catch (error) {
        console.error("Get user error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const userPayload = await getUser();

        if (!userPayload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, dailyRevisionTarget } = body;

        // Validation could be added here

        const [updatedUser] = await db.update(users)
            .set({
                name: name !== undefined ? name : undefined,
                dailyRevisionTarget: dailyRevisionTarget !== undefined ? dailyRevisionTarget : undefined,
            })
            .where(eq(users.id, userPayload.id))
            .returning();

        return NextResponse.json({
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                dailyRevisionTarget: updatedUser.dailyRevisionTarget
            }
        });
    } catch (error) {
        console.error("Update user error:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
