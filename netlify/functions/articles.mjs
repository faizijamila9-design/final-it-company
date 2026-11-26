import articles from "../../data/articles.mjs";

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

export function handleArticles(request) {
    if (request.method !== "GET") {
        return jsonResponse(405, { error: "Method not allowed." }, { Allow: "GET" });
    }

    return jsonResponse(200, { articles });
}

export default function articlesHandler(request) {
    return handleArticles(request);
}

export const config = {
    path: "/api/articles"
};
