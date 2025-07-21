# A2A Weather Agent Client

A small Node.js example that queries the Weather Assistant agent using
the [@a2a-js/sdk](https://github.com/a2aproject/a2a-js). Two scripts are
included:

- **`index.js`** – performs a blocking request and prints the final result.
- **`stream.js`** – streams partial responses as they are produced by the agent.

## Prerequisites

- Node.js **18 or later** (for built‑in `fetch`; older versions need a polyfill)
- An API key if your agent requires one

## Setup

1. **Clone & install**

   ```bash
   git clone <this-repo-url>
   cd a2a-weather-client
   npm install
   ```

2. **Configure**

   * Export your API key:

      ```bash
      export A2A_API_KEY="your_key_here"
      ```

   * Set the agent's base URL:

      ```bash
      export A2A_AGENT_URL="http://your-host/gateway/a2a/weather-agent/1"
      ```

3. **Run**

   ```bash
   # Query for London in blocking mode
   npm start -- "London"       # or: node index.js "London"

   # Stream the response instead
   node stream.js "Tokyo"
   ```

You should see output like:

```
📡 Asking for weather in London…
🌤  Agent says: The current temperature in London is 18°C with light rain…
```
