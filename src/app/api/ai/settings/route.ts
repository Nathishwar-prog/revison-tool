import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aiSettings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getUser } from "@/lib/getUser";

export async function GET() {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await db.query.aiSettings.findFirst({
            where: eq(aiSettings.userId, user.id),
        });

        return NextResponse.json(data || {});
    } catch (error) {
        console.error("Get AI settings error:", error);
        return NextResponse.json({ error: "Failed to fetch AI settings" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        const [updated] = await db.insert(aiSettings)
            .values({ ...body, userId: user.id })
            .onConflictDoUpdate({
                target: aiSettings.userId,
                set: { ...body },
            })
            .returning();

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Update AI settings error:", error);
        return NextResponse.json({ error: "Failed to update AI settings" }, { status: 500 });
    }
}
