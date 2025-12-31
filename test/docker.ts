/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-empty */
import util from "util";
import { writeFile, unlink } from "fs/promises";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const execPromise = util.promisify(require("child_process").exec);

// ZK Verifier (Image)

export const ZK_VERIFIER_CONTAINER_NAME = "luxfhe-test-zk-verifier";

// Function to run a Docker container using the 'execPromise' function
export async function runZkVerifierContainer() {
  const image = "ghcr.io/luxfi/zk-verifier:latest";
  const ports = "-p 3000:3000";

  const remove = `docker kill ${ZK_VERIFIER_CONTAINER_NAME}`;

  const command = `docker run --rm --name ${ZK_VERIFIER_CONTAINER_NAME} --env RUST_LOG=trace ${ports} -d ${image}`;

  try {
    try {
      await execPromise(remove);
    } catch (_) {}
    const result = await execPromise(command);
    console.log(result.stdout);
    console.error(result.stderr);
  } catch (error: any) {
    console.error(error.message);
    throw new Error("Failed to start docker container");
  }
}

export async function killZkVerifierContainer() {
  const removePrevious = `docker kill ${ZK_VERIFIER_CONTAINER_NAME}`;

  try {
    await execPromise(removePrevious);
  } catch (error: any) {
    console.error(error.message);
    throw new Error("Failed to remove docker container");
  }
}

// LuxFHE (Docker Compose)

const FHE_DOCKER_COMPOSE_FILE =
  "https://raw.githubusercontent.com/luxfi/fhe/refs/heads/main/docker-compose.yml";
const TEMP_FILE_PATH = "luxfhe-compose.yml";

/**
 * Fetches a remote file and saves it locally.
 * @param url - The URL of the remote file.
 * @param filePath - The local path to save the file.
 */
async function fetchDockerCompose(
  url: string,
  filePath: string,
): Promise<void> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`);
  }
  const fileContent = await response.text();
  await writeFile(filePath, fileContent, "utf8");
}

/**
 * Cleanup function to remove the temp docker-compose file.
 */
async function cleanup() {
  try {
    await unlink(TEMP_FILE_PATH);
    console.log("Temporary docker-compose file removed.");
  } catch (error) {
    console.warn("Cleanup failed:", error);
  }
}

/**
 * Starts Docker Compose after ensuring the docker-compose.yml file exists.
 */
export async function runFHEContainers() {
  try {
    // Download the docker-compose.yml file
    await fetchDockerCompose(FHE_DOCKER_COMPOSE_FILE, TEMP_FILE_PATH);
    console.log("LuxFHE docker-compose file saved. Starting containers...");

    try {
      await stopFHEContainers();
      console.log("Existing LuxFHE containers stopped.");
    } catch (_) {}

    // Run docker-compose up
    const process = await execPromise(
      `docker-compose -f ${TEMP_FILE_PATH} up -d`,
    );

    console.log(process.stdout);
    console.error(process.stderr);

    // Cleanup
    // await cleanup();
  } catch (error) {
    console.error("Error fetching or starting docker-compose:", error);
  }
}

/**
 * Stops and removes all containers from docker-compose.
 */
export async function stopFHEContainers(requiresFetch = false) {
  try {
    console.log("Stopping LuxFHE containers...");

    if (requiresFetch) {
      await fetchDockerCompose(FHE_DOCKER_COMPOSE_FILE, TEMP_FILE_PATH);
      console.log("LuxFHE docker-compose file saved. Stopping containers...");
    }

    // Run docker-compose down
    const { stdout, stderr } = await execPromise(
      `docker-compose -f ${TEMP_FILE_PATH} down`,
    );

    console.log(stdout);
    if (stderr) console.error(stderr);

    // Cleanup
    // await cleanup();
  } catch (error: any) {
    console.error("Error stopping docker-compose:", error.message);
  }
}

