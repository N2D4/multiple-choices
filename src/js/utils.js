export function createArray(length, value = undefined) {
    const arr = [];
    for (let i = 0; i < length; i++) {
        arr.push(value);
    }
    return arr;
}

export function* range(min = 0, max) {
    if (max === undefined) {
        max = min;
        min = 0;
    }

    for (let i = min; i < max; i++) {
        yield i;
    }
}

export function* charRange(first = 'A', count) {
    if (count === undefined) {
        count = first;
        first = 'A';
    }
    for (const i of range(count)) {
        yield String.fromCharCode([first.charCodeAt(0) + i]);
    }
}

export function deepEquals(a, b) {
    if (typeof a !== typeof b) return false;
    if (typeof a !== 'object') return a === b;

    if (typeof a.equals === 'function') return a.equals(b);
    if (typeof b.equals === 'function') return b.equals(a);

    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    for (const key of [...aKeys, ...bKeys]) {
        if (!deepEquals(a[key], b[key])) return false;
    }

    return true;
}

export function removeDeepDuplicates(arr) {
    // could be optimized to O(n) but me lazy
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (deepEquals(arr[i], arr[j])) {
                arr.splice(j--, 1);
            }
        }
    }
    return arr;
}

export function spreadNumbers(random, ...nums) {
    const arr = [];
    for (const num of nums) {
        arr.push(num);
        for (let i = 0; i < 3; i++) {
            arr.push(random.binomialInt(num - 3, num, num + 4));
        }
    }
    removeDeepDuplicates(arr);
    arr.sort((a, b) => a - b);
    return arr;
}

export function spreadNumbersModulo(random, mod, ...nums) {
    return removeDeepDuplicates(spreadNumbers(random, ...nums).map(a => ((a % mod) + mod) % mod)).sort((a, b) => a - b);
}

