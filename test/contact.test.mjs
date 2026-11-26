import assert from "node:assert/strict";
import test from "node:test";
import { handleContact } from "../netlify/functions/contact.mjs";

function createStore() {
    const records = new Map();
    return {
        records,
        async set(key, value) {
            records.set(key, value);
        }
    };
}

function createRequest(overrides = {}) {
    return new Request("https://example.test/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "  Alex Example ",
            email: " ALEX@example.com ",
            subject: " Website project ",
            projectType: "Web Development",
            timeline: "1–3 months",
            message: " Please contact me. ",
            ...overrides
        })
    });
}

test("stores a validated and normalized contact message", async () => {
    const store = createStore();
    const response = await handleContact(createRequest(), store);
    const result = await response.json();

    assert.equal(response.status, 201);
    assert.equal(result.success, true);
    assert.equal(store.records.size, 1);
    assert.deepEqual(
        Object.fromEntries(Object.entries(JSON.parse([...store.records.values()][0]))
            .filter(([key]) => key !== "submittedAt")),
        {
            name: "Alex Example",
            email: "alex@example.com",
            subject: "Website project",
            projectType: "Web Development",
            timeline: "1–3 months",
            message: "Please contact me."
        }
    );
});

test("rejects invalid email and unsupported project type", async () => {
    const store = createStore();
    const invalidEmail = await handleContact(createRequest({ email: "invalid" }), store);
    const invalidType = await handleContact(
        createRequest({ projectType: "Something else" }),
        store
    );

    assert.equal(invalidEmail.status, 400);
    assert.equal(invalidType.status, 400);
    assert.equal(store.records.size, 0);
});

test("rejects unsupported methods", async () => {
    const response = await handleContact(
        new Request("https://example.test/api/contact"),
        createStore()
    );

    assert.equal(response.status, 405);
    assert.equal(response.headers.get("allow"), "POST");
});
