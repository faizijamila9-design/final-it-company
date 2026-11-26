import { randomUUID } from "node:crypto";
import { getStore } from "@netlify/blobs";

const maxRequestBytes = 16 * 1024;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const projectTypes = new Set([
    "Web Development",
    "Custom Software",
    "Mobile App",
    "IT Infrastructure",
    "UI/UX Design",
    "IT Consulting"
]);
const timelines = new Set([
    "As soon as possible",
    "1–3 months",
    "3–6 months",
    "Still planning"
]);

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

export async function handleContact(request, store) {
    if (request.method !== "POST") {
        return jsonResponse(405, { error: "Method not allowed." }, { Allow: "POST" });
    }

    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
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
        return jsonResponse(400, { error: "A contact message is required." });
    }

    const message = {
        name: typeof body.name === "string" ? body.name.trim() : "",
        email: typeof body.email === "string" ? body.email.trim().toLowerCase() : "",
        subject: typeof body.subject === "string" ? body.subject.trim() : "",
        projectType: typeof body.projectType === "string" ? body.projectType.trim() : "",
        timeline: typeof body.timeline === "string" ? body.timeline.trim() : "",
        message: typeof body.message === "string" ? body.message.trim() : ""
    };

    if (!message.name || message.name.length > 100) {
        return jsonResponse(400, { error: "Enter a name of 1 to 100 characters." });
    }
    if (message.email.length > 254 || !emailPattern.test(message.email)) {
        return jsonResponse(400, { error: "Enter a valid email address." });
    }
    if (!message.subject || message.subject.length > 150) {
        return jsonResponse(400, { error: "Enter a subject of 1 to 150 characters." });
    }
    if (!projectTypes.has(message.projectType) || !timelines.has(message.timeline)) {
        return jsonResponse(400, { error: "Select a valid project type and timeline." });
    }
    if (!message.message || message.message.length > 5000) {
        return jsonResponse(400, { error: "Enter a message of 1 to 5000 characters." });
    }

    const record = {
        ...message,
        submittedAt: new Date().toISOString()
    };

    try {
        await store.set(randomUUID(), JSON.stringify(record));
    } catch (error) {
        console.error("Unable to save contact message:", error);
        return jsonResponse(500, { error: "Unable to send your message right now. Please try again." });
    }

    return jsonResponse(201, {
        success: true,
        message: "Thank you! Your message has been received."
    });
}

export default async function contact(request) {
    return handleContact(request, getStore("contact-messages"));
}

export const config = {
    path: "/api/contact"
};
