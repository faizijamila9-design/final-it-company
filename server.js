const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const publicRoot = __dirname;
const dataDirectory = path.join(__dirname, "data");
const subscribersFile = path.join(dataDirectory, "subscribers.json");
const contactMessagesFile = path.join(dataDirectory, "contact-messages.json");
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "127.0.0.1";
const maxRequestBytes = 8 * 1024;
const contentTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".ico": "image/x-icon",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".js": "text/javascript; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp"
};
let subscriberWrites = Promise.resolve();
let contactMessageWrites = Promise.resolve();

function sendJson(response, status, body, headers = {}) {
    response.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        ...headers
    });
    response.end(JSON.stringify(body));
}

async function readJsonBody(request) {
    const chunks = [];
    let size = 0;

    for await (const chunk of request) {
        size += chunk.length;
        if (size > maxRequestBytes) {
            const error = new Error("Request body is too large.");
            error.status = 413;
            throw error;
        }
        chunks.push(chunk);
    }

    try {
        return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
        const error = new Error("Request body must be valid JSON.");
        error.status = 400;
        throw error;
    }
}

function saveSubscriber(email) {
    const operation = subscriberWrites.then(async () => {
        let subscribers;

        try {
            subscribers = JSON.parse(await fs.readFile(subscribersFile, "utf8"));
        } catch (error) {
            if (error.code !== "ENOENT") {
                throw error;
            }
            subscribers = [];
        }

        if (!Array.isArray(subscribers)) {
            throw new Error("Subscriber data must be a JSON array.");
        }

        if (subscribers.some(subscriber => subscriber.email === email)) {
            return false;
        }

        subscribers.push({
            email,
            subscribedAt: new Date().toISOString()
        });

        await fs.mkdir(dataDirectory, { recursive: true });
        const temporaryFile = `${subscribersFile}.${randomUUID()}.tmp`;
        await fs.writeFile(temporaryFile, `${JSON.stringify(subscribers, null, 2)}\n`, {
            encoding: "utf8",
            flag: "wx"
        });
        await fs.rename(temporaryFile, subscribersFile);
        return true;
    });

    subscriberWrites = operation.then(() => undefined, () => undefined);
    return operation;
}

async function handleSubscription(request, response) {
    const contentType = request.headers["content-type"]
        ?.split(";")[0]
        .trim()
        .toLowerCase();
    if (contentType !== "application/json") {
        sendJson(response, 415, { error: "Content-Type must be application/json." });
        return;
    }

    const body = await readJsonBody(request);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        sendJson(response, 400, { error: "Request body must include an email address." });
        return;
    }

    const email = typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        sendJson(response, 400, { error: "Enter a valid email address." });
        return;
    }

    const added = await saveSubscriber(email);
    sendJson(response, added ? 201 : 200, {
        success: true,
        alreadySubscribed: !added
    });
}

function saveContactMessage(message) {
    const operation = contactMessageWrites.then(async () => {
        let messages;

        try {
            messages = JSON.parse(await fs.readFile(contactMessagesFile, "utf8"));
        } catch (error) {
            if (error.code !== "ENOENT") {
                throw error;
            }
            messages = [];
        }

        if (!Array.isArray(messages)) {
            throw new Error("Contact message data must be a JSON array.");
        }

        messages.push({
            ...message,
            submittedAt: new Date().toISOString()
        });

        await fs.mkdir(dataDirectory, { recursive: true });
        const temporaryFile = `${contactMessagesFile}.${randomUUID()}.tmp`;
        await fs.writeFile(temporaryFile, `${JSON.stringify(messages, null, 2)}\n`, {
            encoding: "utf8",
            flag: "wx"
        });
        await fs.rename(temporaryFile, contactMessagesFile);
    });

    contactMessageWrites = operation.then(() => undefined, () => undefined);
    return operation;
}

async function handleContact(request, response) {
    if (request.method !== "POST") {
        sendJson(response, 405, { error: "Method not allowed." }, { Allow: "POST" });
        return;
    }

    const contentType = request.headers["content-type"]
        ?.split(";")[0]
        .trim()
        .toLowerCase();
    if (contentType !== "application/json") {
        sendJson(response, 415, { error: "Content-Type must be application/json." });
        return;
    }

    const body = await readJsonBody(request);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        sendJson(response, 400, { error: "A contact message is required." });
        return;
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
        sendJson(response, 400, { error: "Enter a name of 1 to 100 characters." });
        return;
    }
    if (message.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(message.email)) {
        sendJson(response, 400, { error: "Enter a valid email address." });
        return;
    }
    if (!message.subject || message.subject.length > 150) {
        sendJson(response, 400, { error: "Enter a subject of 1 to 150 characters." });
        return;
    }
    if (![
        "Web Development",
        "Custom Software",
        "Mobile App",
        "IT Infrastructure",
        "UI/UX Design",
        "IT Consulting"
    ].includes(message.projectType) || ![
        "As soon as possible",
        "1–3 months",
        "3–6 months",
        "Still planning"
    ].includes(message.timeline)) {
        sendJson(response, 400, { error: "Select a valid project type and timeline." });
        return;
    }
    if (!message.message || message.message.length > 5000) {
        sendJson(response, 400, { error: "Enter a message of 1 to 5000 characters." });
        return;
    }

    await saveContactMessage(message);
    sendJson(response, 201, {
        success: true,
        message: "Thank you! Your message has been received."
    });
}

async function serveFile(request, response, pathname) {
    if (request.method !== "GET" && request.method !== "HEAD") {
        response.writeHead(405, { Allow: "GET, HEAD" });
        response.end();
        return;
    }

    let decodedPath;
    try {
        decodedPath = decodeURIComponent(pathname);
    } catch {
        response.writeHead(400);
        response.end("Invalid URL path.");
        return;
    }

    const relativePath = decodedPath === "/" ? "index.html" : decodedPath.slice(1);
    const segments = relativePath.split(/[\\/]/);
    if (segments.some(segment => segment.startsWith("."))) {
        response.writeHead(404);
        response.end("Not found.");
        return;
    }

    const filePath = path.resolve(publicRoot, relativePath);
    if (!filePath.startsWith(`${publicRoot}${path.sep}`) || path.basename(filePath) === "server.js") {
        response.writeHead(404);
        response.end("Not found.");
        return;
    }

    const contentType = contentTypes[path.extname(filePath).toLowerCase()];
    if (!contentType) {
        response.writeHead(404);
        response.end("Not found.");
        return;
    }

    try {
        const file = await fs.readFile(filePath);
        response.writeHead(200, {
            "Content-Type": contentType,
            "X-Content-Type-Options": "nosniff"
        });
        response.end(request.method === "HEAD" ? undefined : file);
    } catch (error) {
        if (error.code !== "ENOENT" && error.code !== "ENOTDIR") {
            console.error("Unable to serve requested file:", error);
            response.writeHead(500);
            response.end("Unable to serve file.");
            return;
        }

        response.writeHead(404);
        response.end("Not found.");
    }
}

const server = http.createServer(async (request, response) => {
    try {
        const url = new URL(request.url, "http://localhost");

        if (url.pathname === "/api/subscribe" && request.method === "POST") {
            await handleSubscription(request, response);
            return;
        }

        if (url.pathname === "/api/contact") {
            await handleContact(request, response);
            return;
        }

        if (url.pathname === "/api/articles") {
            if (request.method !== "GET") {
                response.writeHead(405, { Allow: "GET" });
                response.end();
                return;
            }

            const { default: articles } = await import("./data/articles.mjs");
            sendJson(response, 200, { articles });
            return;
        }

        if (url.pathname.startsWith("/api/")) {
            sendJson(response, 404, { error: "API endpoint not found." });
            return;
        }

        await serveFile(request, response, url.pathname);
    } catch (error) {
        if (error.status) {
            sendJson(response, error.status, { error: error.message });
            return;
        }

        console.error("Request failed:", error);
        sendJson(response, 500, { error: "Unable to process your request right now. Please try again." });
    }
});

server.listen(port, host, () => {
    console.log(`Hewad IT is available at http://${host}:${port}`);
});
