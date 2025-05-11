import ECPoint from "./ECPoint";
import {curveConfig, generatorPoint} from "./secp256k1";
import {findInverse, getModulo, getBN, getLargeRandom} from "./utils";

/**
 *
 * @param x {number|BigNumber}
 * @param y {number|BigNumber}
 * @returns {ECPoint}
 */
export function getSecp256k1Point(x, y) {
    return new ECPoint(x, y, curveConfig);
}

export const GPoint = getSecp256k1Point(generatorPoint.x, generatorPoint.y);

/**
 *
 * @param message {integer|BigNumber}
 * @param privateKey {BigNumber}
 * @returns {{r: (BigNumber), s: (BigNumber)}}
 */
export function signMessage(message, privateKey) {
    let k;
    let r;

    // Выбрать случайное k и вычислить R = kG. Шаг 3: Вычислить r = R.x mod n.
    // Повторять, если r = 0.
    do {
        k = getLargeRandom();
        const R = GPoint.multiply(k);
        r = getModulo(R.x, generatorPoint.orderN);
    } while (r.isEqualTo(0));

    //  Вычислить k^(-1) mod n
    const kInverse = getModulo(
        findInverse(k, generatorPoint.orderN),
        generatorPoint.orderN
    );

    // Вычислить s = k^(-1) * (e + r*d) mod n
    // Здесь 'message' уже предполагается как e (хеш сообщения, преобразованный в BigNumber)
    const s = getModulo(
        kInverse.multipliedBy(getBN(message).plus(r.multipliedBy(privateKey))),
        generatorPoint.orderN
    );

    return {s, r};
}

/**
 *
 * @param message {integer|BigNumber}
 * @param r {BigNumber}
 * @param s {BigNumber}
 * @param publicKey {ECPoint}
 * @returns {boolean}
 */
export function verifySignature(message, {r, s}, publicKey) {
    const sInverse = findInverse(s, generatorPoint.orderN);

    const u1 = getModulo(
        getBN(message).multipliedBy(sInverse),
        generatorPoint.orderN
    );

    const u2 = getModulo(getBN(r).multipliedBy(sInverse), generatorPoint.orderN);

    const c = GPoint.multiply(u1).add(publicKey.multiply(u2));

    return getModulo(r.minus(c.x), generatorPoint.orderN).isEqualTo(0);
}
