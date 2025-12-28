/**
 * LuxFHE v2 Client - Threshold FHE with Lux Chain Infrastructure
 * 
 * Architecture:
 * - t-chain: Threshold FHE chain for decentralized decryption
 * - z-chain: ZK coprocessor accelerator for proof generation
 * 
 * Endpoints:
 * - GET  /publickey           - Fetch public key
 * - POST /encrypt             - Encrypt value with public key
 * - POST /evaluate            - Evaluate FHE operation
 * - POST /threshold/decrypt   - Request threshold decryption from t-chain
 * - POST /zk/prove            - Generate ZK proof via z-chain
 * - POST /zk/verify           - Verify ZK proof via z-chain
 * - GET  /health              - Health check
 */

export interface LuxFHEConfig {
  /** FHE server URL (default: https://fhe.lux.network) */
  serverUrl: string;
  /** t-chain URL for threshold decryption (default: derived from serverUrl) */
  tChainUrl?: string;
  /** z-chain URL for ZK coprocessor (default: derived from serverUrl) */
  zChainUrl?: string;
  /** Enable threshold mode (default: true for v2) */
  thresholdMode?: boolean;
}

export interface EncryptRequest {
  value: number | bigint;
  bitWidth: 4 | 8 | 16 | 32 | 64 | 128 | 160 | 256;
}

export interface EvaluateRequest {
  op: 'add' | 'sub' | 'eq' | 'lt' | 'gt' | 'and' | 'or' | 'xor' | 'not' | 'shl' | 'shr';
  left: Uint8Array;
  right?: Uint8Array;
  bitWidth: number;
}

export interface ThresholdDecryptRequest {
  ciphertext: Uint8Array;
  /** Minimum parties required for decryption */
  threshold?: number;
  /** Callback URL for async decryption */
  callbackUrl?: string;
}

export interface ZKProveRequest {
  /** Ciphertext to prove */
  ciphertext: Uint8Array;
  /** Public inputs for proof */
  publicInputs?: Uint8Array;
  /** Proof type */
  proofType?: 'groth16' | 'plonk' | 'fflonk';
}

export interface HealthResponse {
  status: string;
  threshold: boolean;
  parties: number;
  tChainConnected?: boolean;
  zChainConnected?: boolean;
}

export class LuxFHEClient {
  private serverUrl: string;
  private tChainUrl: string;
  private zChainUrl: string;
  private thresholdMode: boolean;
  private publicKey: Uint8Array | null = null;

  constructor(config: LuxFHEConfig) {
    this.serverUrl = config.serverUrl.replace(/\/$/, '');
    this.tChainUrl = config.tChainUrl ?? `${this.serverUrl}/threshold`;
    this.zChainUrl = config.zChainUrl ?? `${this.serverUrl}/zk`;
    this.thresholdMode = config.thresholdMode ?? true;
  }

  /**
   * Check server health
   */
  async health(): Promise<HealthResponse> {
    const res = await fetch(`${this.serverUrl}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    return res.json();
  }

  /**
   * Fetch public key from server
   */
  async getPublicKey(): Promise<Uint8Array> {
    if (this.publicKey) return this.publicKey;

    const res = await fetch(`${this.serverUrl}/publickey`);
    if (!res.ok) throw new Error(`Failed to fetch public key: ${res.status}`);

    const buffer = await res.arrayBuffer();
    this.publicKey = new Uint8Array(buffer);
    return this.publicKey;
  }

  /**
   * Encrypt a value using server's public key
   */
  async encrypt(req: EncryptRequest): Promise<Uint8Array> {
    const res = await fetch(`${this.serverUrl}/encrypt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        value: typeof req.value === 'bigint' ? Number(req.value) : req.value,
        bitWidth: req.bitWidth,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Encryption failed: ${text}`);
    }

    const buffer = await res.arrayBuffer();
    return new Uint8Array(buffer);
  }

  /**
   * Evaluate FHE operation on encrypted values
   */
  async evaluate(req: EvaluateRequest): Promise<Uint8Array> {
    const res = await fetch(`${this.serverUrl}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        op: req.op,
        left: Array.from(req.left),
        right: req.right ? Array.from(req.right) : undefined,
        bitWidth: req.bitWidth,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Evaluation failed: ${text}`);
    }

    const buffer = await res.arrayBuffer();
    return new Uint8Array(buffer);
  }

  /**
   * Request threshold decryption via t-chain
   * Coordinates with FHE parties for decentralized decryption
   */
  async thresholdDecrypt(req: ThresholdDecryptRequest): Promise<bigint> {
    const res = await fetch(`${this.tChainUrl}/decrypt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ciphertext: Array.from(req.ciphertext),
        threshold: req.threshold,
        callbackUrl: req.callbackUrl,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Threshold decryption failed: ${text}`);
    }

    const data = await res.json();
    return BigInt(data.value);
  }

  /**
   * Get list of threshold parties
   */
  async getThresholdParties(): Promise<Array<{ id: number; publicKey: Uint8Array }>> {
    const res = await fetch(`${this.tChainUrl}/parties`);
    if (!res.ok) throw new Error(`Failed to fetch parties: ${res.status}`);
    return res.json();
  }

  /**
   * Generate ZK proof via z-chain coprocessor
   */
  async zkProve(req: ZKProveRequest): Promise<Uint8Array> {
    const res = await fetch(`${this.zChainUrl}/prove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ciphertext: Array.from(req.ciphertext),
        publicInputs: req.publicInputs ? Array.from(req.publicInputs) : undefined,
        proofType: req.proofType ?? 'groth16',
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`ZK proof generation failed: ${text}`);
    }

    const buffer = await res.arrayBuffer();
    return new Uint8Array(buffer);
  }

  /**
   * Verify ZK proof via z-chain coprocessor
   */
  async zkVerify(proof: Uint8Array, publicInputs?: Uint8Array): Promise<boolean> {
    const res = await fetch(`${this.zChainUrl}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proof: Array.from(proof),
        publicInputs: publicInputs ? Array.from(publicInputs) : undefined,
      }),
    });

    if (!res.ok) return false;
    const data = await res.json();
    return data.verified === true;
  }

  /**
   * Convenience: decrypt using threshold if enabled, otherwise standard
   */
  async decrypt(ciphertext: Uint8Array): Promise<bigint> {
    if (this.thresholdMode) {
      return this.thresholdDecrypt({ ciphertext });
    }
    
    // Standard single-key decryption (requires server access)
    const res = await fetch(`${this.serverUrl}/decrypt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: ciphertext,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Decryption failed: ${text}`);
    }

    const data = await res.json();
    return BigInt(data.value);
  }
}

/**
 * FHE integer types supported by luxd
 */
export enum FheUintType {
  FheUint4 = 4,
  FheUint8 = 8,
  FheUint16 = 16,
  FheUint32 = 32,
  FheUint64 = 64,
  FheUint128 = 128,
  FheUint160 = 160,
  FheUint256 = 256,
}

/**
 * Encrypted integer wrapper
 */
export class EncryptedUint {
  constructor(
    public readonly data: Uint8Array,
    public readonly bitWidth: number
  ) {}

  toBytes(): Uint8Array {
    return this.data;
  }

  static fromBytes(data: Uint8Array, bitWidth: number): EncryptedUint {
    return new EncryptedUint(data, bitWidth);
  }
}
