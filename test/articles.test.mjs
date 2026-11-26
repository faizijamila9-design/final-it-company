import assert from "node:assert/strict";
import test from "node:test";
import { handleArticles } from "../netlify/functions/articles.mjs";

test("returns the blog articles with featured and category information", async () => {
    const response = handleArticles(new Request("https://example.test/api/articles"));
    const result = await response.json();

    assert.equal(response.status, 200);
    assert.equal(result.articles.length, 9);
    assert.equal(result.articles.filter(article => article.featured).length, 3);
    assert.ok(result.articles.every(article => article.slug && article.title && article.category));
});

test("rejects unsupported article API methods", async () => {
    const response = handleArticles(new Request("https://example.test/api/articles", {
        method: "POST"
    }));

    assert.equal(response.status, 405);
    assert.equal(response.headers.get("allow"), "GET");
});
