import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { knowledge } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { getUser } from "@/lib/getUser";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const entry = await db.query.knowledge.findFirst({
            where: and(eq(knowledge.id, id), eq(knowledge.userId, user.id)),
        });

        if (!entry) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json(entry);
    } catch (error) {
        console.error("Get knowledge by id error:", error);
        return NextResponse.json({ error: "Failed to fetch entry" }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        const { id: _, userId: __, createdAt: ___, ...updateData } = body;

        const [updated] = await db.update(knowledge)
            .set(updateData)
            .where(and(eq(knowledge.id, id), eq(knowledge.userId, user.id)))
            .returning();

        if (!updated) {
            return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Update knowledge error:", error);
        return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const [deleted] = await db.delete(knowledge)
            .where(and(eq(knowledge.id, id), eq(knowledge.userId, user.id)))
            .returning();

        if (!deleted) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete knowledge error:", error);
        return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
    }
}
