export function extendedEuclid(a, b) {
    if (b === 0) return [a, 1, 0, [a, b, 1, 0, undefined]];
    let [d, u, v, arr] = extendedEuclid(b, a % b);
    [u, v] = [v, u - Math.floor(a / b) * v];
    return [d, u, v, [a, b, u, v, arr]];
}

export function extendedEuclidTable(a, b) {
    const rows = [` a & b & u & v \\\\ \\hline `];
    let arr = extendedEuclid(a, b)[3];
    while (arr !== undefined) {
        rows.push(` ${arr[0]} & ${arr[1]} & ${arr[2]} & ${arr[3]} \\\\ `);
        arr = arr[4];
    }
    return `\\begin{array}{cc | cc} ${rows.join(` `)} \\end{array}`;
}

export function gcd(a, b) {
    return extendedEuclid(a, b)[0];
}

export function lcm(a, b) {
    return a / gcd(a, b) * b;
}

export function modularInverse(a, m) {
    return ((extendedEuclid(a, m)[1] % m) + m) % m;
}

export function modularPow(a, b, m) {
    if (b === 0) return 1;
    else if (b % 2 === 1) return (a * modularPow(a, b-1, m)) % m;
    else return Math.pow(modularPow(a, b/2, m), 2) % m;
}

export function primeFactors(num) {
    const result = [];
    const sqrtNum = Math.sqrt(num);
    for (let i = 2; i <= Math.min(num, sqrtNum); i++) {
        while (num % i === 0) {
            result.push(i);
            num /= i;
        }
    }
    if (num > 1) result.push(num);
    return result;
}

export function eulerPhi(m) {
    return primeFactors(m).reduce((a, b) => [a[0] * (b === a[1] ? b : b - 1), b], [1, 0])[0];
}

export function multiplicativeOrder(a, m) {
    let min = undefined;
    const factors = primeFactors(eulerPhi(m));
    for (let i = 0; i < 1 << factors.length; i++) {
        let r = 1;
        for (let j = 0; j < factors.length; j++) {
            if ((i >> j & 1) === 1) r *= factors[j];
        }
        if (modularPow(a, r, m) === 1) min = Math.min(min, r) || r;
    }
    return min;
}

