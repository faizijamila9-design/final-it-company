import assert from "node:assert/strict";
import test from "node:test";
import { handleSubscribe } from "../netlify/functions/subscribe.mjs";

function createStore() {
    const records = new Map();
    return {
        records,
        async set(key, value, options) {
            if (options.onlyIfNew && records.has(key)) {
                return { modified: false };
            }
            records.set(key, value);
            return { modified: true };
        }
    };
}

function createRequest(email) {
    return new Request("https://example.test/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });
}

test("stores a normalized subscriber once", async () => {
    const store = createStore();
    const first = await handleSubscribe(createRequest("  NEWS@example.com "), store);
    const duplicate = await handleSubscribe(createRequest("news@example.com"), store);

    assert.equal(first.status, 201);
    assert.deepEqual(await first.json(), {
        success: true,
        alreadySubscribed: false
    });
    assert.equal(duplicate.status, 200);
    assert.deepEqual(await duplicate.json(), {
        success: true,
        alreadySubscribed: true
    });
    assert.equal(store.records.size, 1);
    assert.equal(JSON.parse([...store.records.values()][0]).email, "news@example.com");
});

test("rejects malformed or invalid email submissions", async () => {
    const store = createStore();
    const invalidEmail = await handleSubscribe(createRequest("not-an-email"), store);
    const nullBody = await handleSubscribe(new Request("https://example.test/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "null"
    }), store);

    assert.equal(invalidEmail.status, 400);
    assert.equal(nullBody.status, 400);
    assert.equal(store.records.size, 0);
});

test("rejects unsupported methods and content types", async () => {
    const store = createStore();
    const getRequest = await handleSubscribe(
        new Request("https://example.test/api/subscribe"),
        store
    );
    const textRequest = await handleSubscribe(new Request("https://example.test/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: "news@example.com"
    }), store);

    assert.equal(getRequest.status, 405);
    assert.equal(textRequest.status, 415);
    assert.equal(store.records.size, 0);
});
