/**
 * LuxFHE v2 - Lux FHE Server Client
 * 
 * Threshold TFHE mode (decentralized decryption)
 * Uses network of FHE parties for trustless operation
 */

export {
  LuxFHEClient,
  FheUintType,
  EncryptedUint,
  type LuxFHEConfig,
  type EncryptRequest,
  type EvaluateRequest,
  type HealthResponse,
} from './client';

import { LuxFHEClient, type LuxFHEConfig } from './client';

/**
 * Create threshold-enabled LuxFHE client
 * Default configuration for decentralized FHE operations
 */
export function createLuxFHEClient(
  serverUrl = 'https://fhe.lux.network',
): LuxFHEClient {
  return new LuxFHEClient({ 
    serverUrl, 
    thresholdMode: true  // v2 always uses threshold mode
  });
}

/**
 * Create client with custom configuration
 */
export function createThresholdClient(config: LuxFHEConfig): LuxFHEClient {
  return new LuxFHEClient({
    ...config,
    thresholdMode: true,
  });
}

export { createLuxFHEClient as default };
