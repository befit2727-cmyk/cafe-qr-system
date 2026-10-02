import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isWin = process.platform === "win32";

console.log("\n=======================================================");
console.log("  ☕ Chai & Charcha Craft Cafe - Full-Stack Monorepo");
console.log("  📁 Separated Architecture: /backend (5000) & /frontend (3000)");
console.log("=======================================================\n");

const backendPath = fs.existsSync(path.join(__dirname, "backend", "server.js"))
  ? path.join(__dirname, "backend", "server.js")
  : path.join(__dirname, "server", "server.js");

const backendCwd = path.dirname(backendPath);

const frontendCwd = fs.existsSync(path.join(__dirname, "frontend", "vite.config.ts"))
  ? path.join(__dirname, "frontend")
  : __dirname;

const viteBin = path.join(__dirname, "node_modules", "vite", "bin", "vite.js");

// 1. Start Node.js Express + Socket.io Server
const serverProc = spawn("node", [backendPath], {
  cwd: backendCwd,
  stdio: "inherit"
});

// 2. Start Vite Dev Server in frontend directory
const viteProc = spawn("node", [viteBin], {
  cwd: frontendCwd,
  stdio: "inherit"
});

const cleanup = () => {
  console.log("\n🛑 Gracefully stopping backend and frontend...");
  try {
    if (isWin) {
      if (serverProc.pid) spawn("taskkill", ["/pid", serverProc.pid.toString(), "/f", "/t"]);
      if (viteProc.pid) spawn("taskkill", ["/pid", viteProc.pid.toString(), "/f", "/t"]);
    } else {
      serverProc.kill("SIGTERM");
      viteProc.kill("SIGTERM");
    }
  } catch (e) {
    // ignore
  }
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
