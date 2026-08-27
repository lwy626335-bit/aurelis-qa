import { spawn } from "node:child_process";

const appDirectory = new URL("../", import.meta.url);
const nextCli = "node_modules/next/dist/bin/next";
const playwrightCli = "node_modules/@playwright/test/cli.js";
const targetUrl = process.env.AURELIS_E2E_URL ?? "http://localhost:3000";
const targetPort = new URL(targetUrl).port || "3000";
const forwardedArguments = process.argv.slice(2).filter((argument, index) => argument !== "--" || index > 0);

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: appDirectory,
      env: process.env,
      stdio: "inherit",
      windowsHide: true,
      ...options,
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code: code ?? 1, signal }));
  });
}

async function isReady() {
  try {
    const response = await fetch(targetUrl, { signal: AbortSignal.timeout(1_000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForServer(server) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (await isReady()) return;
    if (server.exitCode !== null) throw new Error(`Next.js server exited with code ${server.exitCode}.`);
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Timed out waiting for the AURELIS test server.");
}

function stopServer(server) {
  if (!server || server.exitCode !== null) return;
  if (process.platform === "win32") {
    server.kill();
    return;
  }
  process.kill(-server.pid, "SIGTERM");
}

let server;
let exitCode = 1;

try {
  if (!(await isReady())) {
    const build = await run(process.execPath, [nextCli, "build"]);
    if (build.code !== 0) process.exit(build.code);

    server = spawn(process.execPath, [nextCli, "start", "-p", targetPort], {
      cwd: appDirectory,
      detached: process.platform !== "win32",
      env: process.env,
      stdio: "inherit",
      windowsHide: true,
    });
    await waitForServer(server);
  }

  const tests = await run(process.execPath, [playwrightCli, "test", ...forwardedArguments], {
    env: { ...process.env, AURELIS_E2E_URL: targetUrl, AURELIS_EXTERNAL_SERVER: "true" },
  });
  exitCode = tests.code;
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
} finally {
  stopServer(server);
}

process.exitCode = exitCode;
