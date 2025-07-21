#!/usr/bin/env node

/**
 * Simple CLI that asks the A2A Weather Assistant about the weather in a city.
 * It showcases how to perform a blocking request using the A2A SDK.
 */

import fetch from "node-fetch";
import {A2AClient} from "@a2a-js/sdk/client";
import {v4 as uuidv4} from "uuid";

// ── CONFIG ──────────────────────────────────────────────────────────────────────
const API_KEY = process.env.A2A_API_KEY;
const AGENT_BASE_URL = process.env.A2A_AGENT_URL;

// Monkey‑patch global `fetch` so the API key is automatically included
const originalFetch = fetch;
globalThis.fetch = async (url, options = {}) => {
    const headers = {
        ...(options.headers || {}),
        ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
    };
    return originalFetch(url, { ...options, headers });
};
// ── END CONFIG ──────────────────────────────────────────────────────────────────

/**
 * Polls the given task until it completes.
 *
 * @param {A2AClient} client      A2A client instance
 * @param {string}     taskId      Identifier of the task to poll
 * @param {number}     intervalMs  Polling interval in milliseconds
 * @returns {Promise<object>}      The completed task object
 */
async function waitForTaskResult(client, taskId, intervalMs = 10000) {
    while (true) {
        const { result, error } = await client.getTask({ id: taskId, historyLength: 100 });
        if (error) throw error;

        if (result.status.state === "working") {
            // still processing
            await new Promise((r) => setTimeout(r, intervalMs));
            continue;
        }

        return result;
    }
}

/**
 * Entry point for the CLI.
 * Reads the city name from the command line and prints the agent's reply.
 */
async function main() {
    const city = process.argv[2];
    if (!city) {
        console.error("Usage: node index.js <City Name>");
        process.exit(1);
    }

    const client = new A2AClient(AGENT_BASE_URL);
    const messageId = uuidv4();

    // Prepare the message to send to the agent
    const sendParams = {
        message: {
            messageId,
            role: "user",
            parts: [{ kind: "text", text: `What's the weather in ${city}?` }],
        },
        configuration: {
            blocking: true,
            acceptedOutputModes: ["text/plain"],
        },
    };

    console.log(`📡 Asking for weather in ${city}…`);
    const sendResp = await client.sendMessage(sendParams);
    if ("error" in sendResp) {
        console.error("❌ RPC error:", sendResp.error);
        process.exit(1);
    }

    const { result } = sendResp;
    if (result.kind === "message") {
        // immediate reply
        console.log(
            "🌤  Agent says:",
            result.parts.map((p) => p.text).join("")
        );
    } else {
        // got a task → poll until done
        console.log("🛠  Task created, polling for result…");
        const task = await waitForTaskResult(client, result.id);

        // The final agent reply is the last entry in the task history
        const last = task.history[task.history.length - 1];
        console.log(
            "🌤  Agent says:",
            last.parts.map((p) => p.text).join("")
        );
    }
}

main().catch((err) => {
    console.error("⚠️ Error:", err);
    process.exit(1);
});
