import { spawn } from "node:child_process";
import { connect } from "node:net";
import { loadEnvFile } from "node:process";

const appDirectory = new URL("../", import.meta.url);
const nextCli = "node_modules/next/dist/bin/next";
const playwrightCli = "node_modules/@playwright/test/cli.js";
const targetUrl = process.env.AURELIS_E2E_URL ?? "http://localhost:3000";
const targetPort = new URL(targetUrl).port || "3000";
const forwardedArguments = process.argv.slice(2).filter((argument, index) => argument !== "--" || index > 0);

try {
  loadEnvFile(new URL("../.env.local", import.meta.url));
} catch {
  // Local defaults below keep the development setup usable without an env file.
}

function checkPort(host, port, label) {
  return new Promise((resolve, reject) => {
    const socket = connect({ host, port });
    const finish = (error) => {
      socket.destroy();
      if (error) {
        reject(new Error(`${label} is unavailable at ${host}:${port}. Start the local services with \`docker compose up -d\`.`));
      } else {
        resolve();
      }
    };
    socket.setTimeout(2_000, () => finish(new Error("timeout")));
    socket.once("connect", () => finish());
    socket.once("error", finish);
  });
}

async function checkLocalDependencies() {
  const databaseUrl = new URL(process.env.DATABASE_URL ?? "postgresql://aurelis:aurelis_dev@localhost:5432/aurelis");
  await checkPort(databaseUrl.hostname, Number(databaseUrl.port || 5432), "PostgreSQL");

  const validatorUrl = new URL(process.env.HTML_VALIDATOR_URL ?? "http://127.0.0.1:8888");
  await checkPort(validatorUrl.hostname, Number(validatorUrl.port || 80), "HTML Validator");
}

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
  if (!process.env.AURELIS_E2E_URL) await checkLocalDependencies();
  if (!(await isReady())) {
    const build = await run(process.execPath, [nextCli, "build"]);
    if (build.code !== 0) process.exit(build.code);

    server = spawn(process.execPath, [nextCli, "start", "-p", targetPort], {
      cwd: appDirectory,
      detached: process.platform !== "win32",
      env: { ...process.env, AURELIS_ALLOW_INSECURE_LOCAL: "true" },
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
