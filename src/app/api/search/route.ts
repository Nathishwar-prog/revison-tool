import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { knowledge } from "@/lib/schema";
import { eq, and, ilike, or, sql } from "drizzle-orm";
import { getUser } from "@/lib/getUser";

export async function GET(request: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");

        if (!query) {
            return NextResponse.json([]);
        }

        const results = await db.query.knowledge.findMany({
            where: and(
                eq(knowledge.userId, user.id),
                or(
                    ilike(knowledge.title, `%${query}%`),
                    ilike(knowledge.technology, `%${query}%`),
                    ilike(knowledge.domain, `%${query}%`),
                    sql`${knowledge.content}->>'definition' ILIKE ${`%${query}%`}`
                )
            ),
            limit: 10
        });

        return NextResponse.json(results);
    } catch (error: any) {
        console.error("Search API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
