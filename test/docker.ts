/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-empty */
import util from "util";
import path from "path";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const execPromise = util.promisify(require("child_process").exec);

// LuxFHE Docker Compose - Uses ~/work/lux/fhe/compose.yml
const FHE_COMPOSE_DIR =
  process.env.LUX_FHE_DIR ||
  path.join(process.env.HOME || "~", "work/lux/fhe");

/**
 * Check if Docker daemon is running
 */
async function isDockerRunning(): Promise<boolean> {
  try {
    await execPromise("docker info");
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Starts the FHE server container for testing.
 * Uses the compose.yml from lux/fhe repository.
 */
export async function runFHEContainers(): Promise<boolean> {
  // Check if Docker is running first
  if (!(await isDockerRunning())) {
    console.warn(
      "Docker daemon not running - tests will run without FHE infrastructure",
    );
    return false;
  }

  try {
    console.log("Starting LuxFHE containers from", FHE_COMPOSE_DIR);

    try {
      await stopFHEContainers();
      console.log("Existing LuxFHE containers stopped.");
    } catch (_) {}

    // Start only the server service (no coprocessor profile needed for tests)
    const { stdout, stderr } = await execPromise(
      `docker compose -f ${FHE_COMPOSE_DIR}/compose.yml up -d server`,
    );

    console.log(stdout);
    if (stderr) console.error(stderr);

    console.log("LuxFHE server started on port 8448");
    return true;
  } catch (error: any) {
    console.warn("Failed to start LuxFHE containers:", error.message);
    console.warn("Tests will run without FHE infrastructure");
    return false;
  }
}

/**
 * Starts the full FHE coprocessor stack (gateway + workers + redis).
 */
export async function runFHECoprocessor(): Promise<boolean> {
  if (!(await isDockerRunning())) {
    console.warn("Docker daemon not running - skipping coprocessor startup");
    return false;
  }

  try {
    console.log("Starting LuxFHE coprocessor stack from", FHE_COMPOSE_DIR);

    // Start with coprocessor profile
    const { stdout, stderr } = await execPromise(
      `docker compose -f ${FHE_COMPOSE_DIR}/compose.yml --profile coprocessor up -d`,
    );

    console.log(stdout);
    if (stderr) console.error(stderr);

    console.log("LuxFHE coprocessor stack started");
    return true;
  } catch (error: any) {
    console.warn("Failed to start LuxFHE coprocessor:", error.message);
    return false;
  }
}

/**
 * Stops all LuxFHE containers.
 */
export async function stopFHEContainers(): Promise<void> {
  if (!(await isDockerRunning())) {
    return;
  }

  try {
    console.log("Stopping LuxFHE containers...");

    const { stdout, stderr } = await execPromise(
      `docker compose -f ${FHE_COMPOSE_DIR}/compose.yml --profile coprocessor down`,
    );

    console.log(stdout);
    if (stderr) console.error(stderr);

    console.log("LuxFHE containers stopped");
  } catch (error: any) {
    // Ignore errors on stop
  }
}

/**
 * Wait for the FHE server to be healthy.
 */
export async function waitForFHEServer(timeoutMs = 30000): Promise<boolean> {
  const startTime = Date.now();
  const healthUrl = "http://localhost:8448/health";

  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await fetch(healthUrl);
      if (response.ok) {
        console.log("FHE server is healthy");
        return true;
      }
    } catch (_) {
      // Server not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.warn("FHE server health check timed out");
  return false;
}
