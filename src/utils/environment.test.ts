/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from "vitest";
import { applyEnvironmentDefaults } from "./environment";
import { Environment, EnvironmentParams } from "../types";

describe("Environment Utils", () => {
  describe("applyEnvironmentDefaults", () => {
    it("should return original params when no environment is specified and all URLs are provided", () => {
      const params: EnvironmentParams = {
        fheUrl: "https://custom-fhe.example.com",
        verifierUrl: "https://custom-verifier.example.com",
        thresholdNetworkUrl: "https://custom-threshold.example.com",
      };

      const result = applyEnvironmentDefaults(params);

      expect(result).toEqual(params);
      expect(result.fheUrl).toBe("https://custom-fhe.example.com");
      expect(result.verifierUrl).toBe("https://custom-verifier.example.com");
      expect(result.thresholdNetworkUrl).toBe(
        "https://custom-threshold.example.com",
      );
    });

    it("should throw error when no environment is specified and URLs are missing", () => {
      const params: EnvironmentParams = {
        fheUrl: "https://custom-fhe.example.com",
        // Missing verifierUrl and thresholdNetworkUrl
      };

      expect(() => applyEnvironmentDefaults(params)).toThrow(
        "When environment is not specified, fheUrl, verifierUrl, and thresholdNetworkUrl must be provided",
      );
    });

    it("should throw error when no environment is specified and all URLs are missing", () => {
      const params: EnvironmentParams = {};

      expect(() => applyEnvironmentDefaults(params)).toThrow(
        "When environment is not specified, fheUrl, verifierUrl, and thresholdNetworkUrl must be provided",
      );
    });

    describe("MOCK environment", () => {
      it("should set all URLs to undefined for MOCK environment", () => {
        const params: EnvironmentParams = {
          environment: "MOCK",
          fheUrl: "https://should-be-removed.example.com",
          verifierUrl: "https://should-be-removed.example.com",
          thresholdNetworkUrl: "https://should-be-removed.example.com",
        };

        const result = applyEnvironmentDefaults(params);

        expect(result.environment).toBe("MOCK");
        expect(result.fheUrl).toBeUndefined();
        expect(result.verifierUrl).toBeUndefined();
        expect(result.thresholdNetworkUrl).toBeUndefined();
      });
    });

    describe("LOCAL environment", () => {
      it("should apply default local URLs when none provided", () => {
        const params: EnvironmentParams = {
          environment: "LOCAL",
        };

        const result = applyEnvironmentDefaults(params);

        expect(result.environment).toBe("LOCAL");
        expect(result.fheUrl).toBe("http://127.0.0.1:8448");
        expect(result.verifierUrl).toBe("http://127.0.0.1:3001");
        expect(result.thresholdNetworkUrl).toBe("http://127.0.0.1:3000");
      });

      it("should preserve custom URLs when provided for LOCAL environment", () => {
        const params: EnvironmentParams = {
          environment: "LOCAL",
          fheUrl: "http://localhost:9999",
          verifierUrl: "http://localhost:8888",
          thresholdNetworkUrl: "http://localhost:7777",
        };

        const result = applyEnvironmentDefaults(params);

        expect(result.environment).toBe("LOCAL");
        expect(result.fheUrl).toBe("http://localhost:9999");
        expect(result.verifierUrl).toBe("http://localhost:8888");
        expect(result.thresholdNetworkUrl).toBe("http://localhost:7777");
      });
    });

    describe("TESTNET environment", () => {
      it("should apply default testnet URLs when none provided", () => {
        const params: EnvironmentParams = {
          environment: "TESTNET",
        };

        const result = applyEnvironmentDefaults(params);

        expect(result.environment).toBe("TESTNET");
        expect(result.fheUrl).toBe("https://testnet-fhe.luxfhe.zone");
        expect(result.verifierUrl).toBe(
          "https://testnet-fhe-vrf.luxfhe.zone",
        );
        expect(result.thresholdNetworkUrl).toBe(
          "https://testnet-fhe-tn.luxfhe.zone",
        );
      });

      it("should preserve custom URLs when provided for TESTNET environment", () => {
        const params: EnvironmentParams = {
          environment: "TESTNET",
          fheUrl: "https://custom-testnet-fhe.example.com",
          verifierUrl: "https://custom-testnet-verifier.example.com",
          thresholdNetworkUrl: "https://custom-testnet-threshold.example.com",
        };

        const result = applyEnvironmentDefaults(params);

        expect(result.environment).toBe("TESTNET");
        expect(result.fheUrl).toBe(
          "https://custom-testnet-fhe.example.com",
        );
        expect(result.verifierUrl).toBe(
          "https://custom-testnet-verifier.example.com",
        );
        expect(result.thresholdNetworkUrl).toBe(
          "https://custom-testnet-threshold.example.com",
        );
      });
    });

    describe("MAINNET environment", () => {
      it("should apply default mainnet URLs when none provided", () => {
        const params: EnvironmentParams = {
          environment: "MAINNET",
        };

        const result = applyEnvironmentDefaults(params);

        expect(result.environment).toBe("MAINNET");
        expect(result.fheUrl).toBe("https://mainnet-fhe.luxfhe.zone");
        expect(result.verifierUrl).toBe(
          "https://mainnet-fhe-vrf.luxfhe.zone",
        );
        expect(result.thresholdNetworkUrl).toBe(
          "https://mainnet-fhe-tn.luxfhe.zone",
        );
      });

      it("should preserve custom URLs when provided for MAINNET environment", () => {
        const params: EnvironmentParams = {
          environment: "MAINNET",
          fheUrl: "https://custom-mainnet-fhe.example.com",
          verifierUrl: "https://custom-mainnet-verifier.example.com",
          thresholdNetworkUrl: "https://custom-mainnet-threshold.example.com",
        };

        const result = applyEnvironmentDefaults(params);

        expect(result.environment).toBe("MAINNET");
        expect(result.fheUrl).toBe(
          "https://custom-mainnet-fhe.example.com",
        );
        expect(result.verifierUrl).toBe(
          "https://custom-mainnet-verifier.example.com",
        );
        expect(result.thresholdNetworkUrl).toBe(
          "https://custom-mainnet-threshold.example.com",
        );
      });
    });

    it("should throw error for unknown environment", () => {
      const params: EnvironmentParams = {
        environment: "UNKNOWN" as Environment,
      };

      expect(() => applyEnvironmentDefaults(params)).toThrow(
        "Unknown environment: UNKNOWN",
      );
    });

    it("should not modify the original input parameters", () => {
      const originalParams: EnvironmentParams = {
        environment: "LOCAL",
        fheUrl: "http://localhost:9999",
      };

      const result = applyEnvironmentDefaults(originalParams);

      // Original params should remain unchanged
      expect(originalParams.fheUrl).toBe("http://localhost:9999");
      expect(originalParams.verifierUrl).toBeUndefined();
      expect(originalParams.thresholdNetworkUrl).toBeUndefined();

      // Result should have the defaults applied
      expect(result.fheUrl).toBe("http://localhost:9999");
      expect(result.verifierUrl).toBe("http://127.0.0.1:3001");
      expect(result.thresholdNetworkUrl).toBe("http://127.0.0.1:3000");
    });

    it("should handle partial URL overrides correctly", () => {
      const params: EnvironmentParams = {
        environment: "TESTNET",
        thresholdNetworkUrl: "https://custom-threshold.example.com",
      };

      const result = applyEnvironmentDefaults(params);

      expect(result.environment).toBe("TESTNET");
      expect(result.fheUrl).toBe("https://testnet-fhe.luxfhe.zone");
      expect(result.verifierUrl).toBe("https://testnet-fhe-vrf.luxfhe.zone");
      expect(result.thresholdNetworkUrl).toBe(
        "https://custom-threshold.example.com",
      );
    });
  });
});
