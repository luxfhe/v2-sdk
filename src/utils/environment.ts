import { FHEError, FHEErrorCode, EnvironmentParams } from "../types";

/**
 * Applies environment-specific default values to initialization parameters
 */
export function applyEnvironmentDefaults<T extends EnvironmentParams>(
  params: T,
): T {
  // Create a copy of the original params to avoid modifying the input
  const result = { ...params };

  if (!params.environment) {
    // If no environment is provided, all URLs must be explicitly provided
    if (
      !params.fheUrl ||
      !params.verifierUrl ||
      !params.thresholdNetworkUrl
    ) {
      throw new Error(
        "When environment is not specified, fheUrl, verifierUrl, and thresholdNetworkUrl must be provided",
      );
    }
    return result;
  }

  switch (params.environment) {
    case "MOCK":
      result.fheUrl = undefined;
      result.verifierUrl = undefined;
      result.thresholdNetworkUrl = undefined;
      break;
    case "LOCAL":
      result.fheUrl = params.fheUrl || "http://127.0.0.1:8448";
      result.verifierUrl = params.verifierUrl || "http://127.0.0.1:3001";
      result.thresholdNetworkUrl =
        params.thresholdNetworkUrl || "http://127.0.0.1:3000";
      break;
    case "TESTNET":
      result.fheUrl = params.fheUrl || "https://testnet-fhe.luxfhe.zone";
      result.verifierUrl =
        params.verifierUrl || "https://testnet-fhe-vrf.luxfhe.zone";
      result.thresholdNetworkUrl =
        params.thresholdNetworkUrl || "https://testnet-fhe-tn.luxfhe.zone";
      break;
    case "MAINNET":
      result.fheUrl = params.fheUrl || "https://mainnet-fhe.luxfhe.zone";
      result.verifierUrl =
        params.verifierUrl || "https://mainnet-fhe-vrf.luxfhe.zone";
      result.thresholdNetworkUrl =
        params.thresholdNetworkUrl || "https://mainnet-fhe-tn.luxfhe.zone";
      break;
    default:
      throw new FHEError({
        code: FHEErrorCode.UnknownEnvironment,
        message: `Unknown environment: ${params.environment}`,
      });
  }

  return result;
}
