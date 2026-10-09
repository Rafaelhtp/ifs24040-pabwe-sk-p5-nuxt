import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const port = process.env.APP_PORT || "3000";

console.log(`Starting Delcom Cash Flow on port ${port}...`);

const child = spawn(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["nuxt", "preview", "--port", port],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      PORT: port,
      NITRO_PORT: port,
    },
  }
);

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
