#!/usr/bin/env node

import { fetch } from "undici";
import { A2AClient } from "@a2a-js/sdk/client";
import { v4 as uuidv4 } from "uuid";

// ── CONFIG ──────────────────────────────────────────────────────────────────────
const API_KEY = process.env.A2A_API_KEY;
const AGENT_BASE_URL = process.env.A2A_AGENT_URL

// inject X-API-Key into every request
globalThis.fetch = async (url, init = {}) => {
    const headers = {
        ...(init.headers || {}),
        ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
    };
    return fetch(url, { ...init, headers });
};
// ── END CONFIG ──────────────────────────────────────────────────────────────────

async function streamWeather(city) {
    const client = new A2AClient(AGENT_BASE_URL);
    const messageId = uuidv4();

    const params = {
        message: {
            messageId,
            role: "user",
            parts: [
                {
                    kind: "text",
                    text: `What's the weather in ${city}?`,
                },
            ],
        },
        configuration: {
            acceptedOutputModes: ["text/plain"],
        },
    };

    console.log(`📡 Streaming weather for ${city}…`);
    const stream = client.sendMessageStream(params);

    for await (const event of stream) {
        if (event.kind === "task") {
            console.log("🛠  Task created:", event.id);
        } else if (event.kind === "status-update") {
            // print any new text
            if (event.status.message) {
                process.stdout.write(
                    event.status.message.parts.map((p) => p.text).join("")
                );
            }
            // when `final` is true, we're done
            if (event.final) {
                console.log("\n✅ Done streaming.");
                break;
            }
        }
    }
}

const city = process.argv[2];
if (!city) {
    console.error("Usage: node stream.js <City Name>");
    process.exit(1);
}

streamWeather(city).catch((err) => {
    console.error("⚠️ Error:", err);
    process.exit(1);
});
