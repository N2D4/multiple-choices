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

export function deepEquals(a, b) {
    if (typeof a !== typeof b) return false;
    if (typeof a !== 'object') return a === b;

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
                arr.splice(j, 1);
                j--;
            }
        }
    }
}
