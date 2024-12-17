import { Point } from "./point";

export type PrivateKey = bigint;

export type PublicKey = Point;

export type SharedSecret = Point;

export type Signature = {
  r: bigint;
  s: bigint;
  v?: bigint;
};
