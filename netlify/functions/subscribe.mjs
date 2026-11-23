import { createHash } from "node:crypto";
import { getStore } from "@netlify/blobs";

const storeName = "newsletter-subscribers";
const maxRequestBytes = 8 * 1024;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(status, body, headers = {}) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
            ...headers
        }
    });
}

export async function handleSubscribe(request, store) {
    if (request.method !== "POST") {
        return jsonResponse(405, { error: "Method not allowed." }, { Allow: "POST" });
    }

    const contentType = request.headers.get("content-type")
        ?.split(";")[0]
        .trim()
        .toLowerCase();
    if (contentType !== "application/json") {
        return jsonResponse(415, { error: "Content-Type must be application/json." });
    }

    const declaredLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > maxRequestBytes) {
        return jsonResponse(413, { error: "Request body is too large." });
    }

    let rawBody;
    try {
        rawBody = await request.text();
    } catch {
        return jsonResponse(400, { error: "Request body must be valid JSON." });
    }
    if (new TextEncoder().encode(rawBody).byteLength > maxRequestBytes) {
        return jsonResponse(413, { error: "Request body is too large." });
    }

    let body;
    try {
        body = JSON.parse(rawBody);
    } catch {
        return jsonResponse(400, { error: "Request body must be valid JSON." });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return jsonResponse(400, { error: "Request body must include an email address." });
    }

    const email = typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
    if (email.length > 254 || !emailPattern.test(email)) {
        return jsonResponse(400, { error: "Enter a valid email address." });
    }

    const key = createHash("sha256").update(email).digest("hex");
    let result;
    try {
        result = await store.set(key, JSON.stringify({
            email,
            subscribedAt: new Date().toISOString()
        }), { onlyIfNew: true });
    } catch (error) {
        console.error("Unable to save newsletter subscriber:", error);
        return jsonResponse(500, { error: "Unable to subscribe right now. Please try again." });
    }

    return jsonResponse(result.modified ? 201 : 200, {
        success: true,
        alreadySubscribed: !result.modified
    });
}

export default async function subscribe(request) {
    return handleSubscribe(request, getStore(storeName));
}

export const config = {
    path: "/api/subscribe"
};
