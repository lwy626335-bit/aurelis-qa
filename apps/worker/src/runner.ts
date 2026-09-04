import { processOne, workerCapabilities } from "./index.js";
import { startHealthServer } from "./health.js";

async function main() {
  console.info(JSON.stringify({ capabilities: workerCapabilities, status: "ready" }));
  if (process.env.WORKER_ONCE === "true") {
    await processOne();
    return;
  }

  const healthServer = await startHealthServer();
  let running = true;
  const stop = () => { running = false; };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);

  while (running) {
    const processed = await processOne();
    await new Promise((resolve) => setTimeout(resolve, processed ? 250 : 2_000));
  }

  await new Promise<void>((resolve) => healthServer.close(() => resolve()));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
