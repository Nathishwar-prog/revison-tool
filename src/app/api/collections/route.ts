import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { collections } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { getUser } from "@/lib/getUser";

export async function GET() {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const results = await db.query.collections.findMany({
            where: eq(collections.userId, user.id),
            with: {
                knowledge: true
            }
        });

        return NextResponse.json(results);
    } catch (error: any) {
        console.error("Collections GET error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, description } = await request.json();

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const [newCollection] = await db.insert(collections).values({
            userId: user.id,
            name,
            description
        }).returning();

        return NextResponse.json(newCollection, { status: 201 });
    } catch (error: any) {
        console.error("Collections POST error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Collection ID is required" }, { status: 400 });
        }

        await db.delete(collections).where(
            and(
                eq(collections.id, id),
                eq(collections.userId, user.id)
            )
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Collections DELETE error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
