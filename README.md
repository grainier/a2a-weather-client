# A2A Weather Agent Client

A simple Node.js client that uses [@a2a-js/sdk](https://github.com/a2aproject/a2a-js) to query the Weather Assistant agent.

## Prerequisites

- Node.js ≥ 18 (for built-in `fetch`, or you can install `node-fetch`)
- an API key (if your agent enforces one)

## Setup

1. **Clone & install**

   ```bash
   git clone <this-repo-url>
   cd a2a-weather-client
   npm install @a2a-js/sdk node-fetch undici uuid
   npm install
    ```

2. **Configure**

    * (Optional) If your agent requires an API key, export it:

      ```bash
      export A2A_API_KEY="your_key_here"
      ```
    * If you’ve deployed your agent under a different URL, set:

      ```bash
      export A2A_AGENT_URL="http://your-host/gateway/a2a/weather-agent/1"
      ```

3. **Run**

   ```bash
   # Query for London:
   npm start -- "London"

   # Or directly:
   node index.js "Tokyo"
   ```

You should see output like:

```
📡 Asking for weather in London…
🌤  Agent says: The current temperature in London is 18°C with light rain…
```