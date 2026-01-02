import { runFHEContainers, stopFHEContainers, waitForFHEServer } from "./docker";

// Track if infrastructure is available
export let fheInfrastructureAvailable = false;

export const setup = async () => {
  // Skip infrastructure setup for unit tests (MOCK mode doesn't need it)
  if (process.env.SKIP_LOCAL_ENV === "true") {
    console.log("Skipping local FHE environment setup (SKIP_LOCAL_ENV=true)");
    return;
  }

  console.log("\nAttempting to start LuxFHE server...");

  const started = await runFHEContainers();

  if (!started) {
    console.log(
      "FHE infrastructure not available - unit tests will use MOCK mode",
    );
    return;
  }

  const healthy = await waitForFHEServer(60000);

  if (!healthy) {
    console.warn("FHE server failed health check - tests may be limited");
    return;
  }

  fheInfrastructureAvailable = true;
  console.log("LuxFHE server is running!");
};

export const teardown = async () => {
  if (process.env.SKIP_LOCAL_ENV === "true") {
    return;
  }

  console.log("\nStopping LuxFHE containers...");
  await stopFHEContainers();
  console.log("LuxFHE containers stopped. Goodbye!");
};
