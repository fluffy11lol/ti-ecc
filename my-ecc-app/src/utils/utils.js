import BN from "bignumber.js";
import { sha256 } from "hash.js";

/**
 *
 * @param text {string}
 * @returns {string}
 */
export function getSha256(text) {
  return "0x" + sha256().update(text).digest("hex");
}

/**
 *
 * @param number {number|string}
 * @returns {BigNumber}
 */
export function getBN(number) {
  return new BN(number);
}

/**
 * generates a stringified random number of max length 64
 * @returns {string}
 */
export function getLargeRandom() {
  return [0, 0, 0, 0].map(() => Math.floor(Math.random() * 10e15)).join("");
}

/**
 *
 * @param number {number|string|BigNumber}
 * @param modulo{number|string|BigNumber}
 * @returns {BigNumber}
 */
export function findInverse(number, modulo) {
  const xgcdBN = (a, b) => {
    if (b.isEqualTo(0)) {
      return [getBN(1), getBN(0)];
    }

    const [x, y] = xgcdBN(
      b,
      a.minus(a.dividedBy(b).integerValue(BN.ROUND_FLOOR).multipliedBy(b))
    );

    return [
      y,
      x.minus(y.multipliedBy(a.dividedBy(b).integerValue(BN.ROUND_FLOOR)))
    ];
  };

  const [result] = xgcdBN(getBN(number), getBN(modulo));

  return result;
}

/**
 *
 * @param bigNumber {BigNumber}
 * @param modulo {BigNumber}
 * @returns {BigNumber}
 */
export function getModulo(bigNumber, modulo) {
  if (bigNumber.isGreaterThanOrEqualTo(0)) {
    return bigNumber.modulo(modulo);
  }

  return getBN(modulo)
    .minus(bigNumber.multipliedBy(-1).mod(modulo))
    .mod(modulo);
}
