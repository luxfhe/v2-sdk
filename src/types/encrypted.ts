import { FheTypes } from "./base";

export type EncryptedNumber = {
  data: Uint8Array;
  securityZone: number;
};

export type FHEInItem = {
  ctHash: bigint;
  securityZone: number;
  utype: FheTypes;
  signature: string;
};
export type FHEInBool = FHEInItem & {
  utype: FheTypes.Bool;
};
export type FHEInUint8 = FHEInItem & {
  utype: FheTypes.Uint8;
};
export type FHEInUint16 = FHEInItem & {
  utype: FheTypes.Uint16;
};
export type FHEInUint32 = FHEInItem & {
  utype: FheTypes.Uint32;
};
export type FHEInUint64 = FHEInItem & {
  utype: FheTypes.Uint64;
};
export type FHEInUint128 = FHEInItem & {
  utype: FheTypes.Uint128;
};
export type FHEInUint256 = FHEInItem & {
  utype: FheTypes.Uint256;
};
export type FHEInAddress = FHEInItem & {
  utype: FheTypes.Uint160;
};
