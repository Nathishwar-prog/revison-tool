import { headers } from "next/headers";
import { verifyToken, JWTPayload } from "./auth";

export async function getUser(): Promise<JWTPayload | null> {
    const headersList = await headers();
    const authorization = headersList.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return null;
    }

    const token = authorization.split(" ")[1];
    return verifyToken(token);
}
