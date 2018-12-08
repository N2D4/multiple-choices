/**
 * Implementation of the xoshiro128 PRNG, designed by David Blackman and Sebastiano Vigna.
 */
export default class Random {
    constructor(state = new Date().getTime()) {
        this.setState(state);
    }

    getState() {
        return [this.a, this.b, this.c, this.d];
    }

    setState(state) {
        if (typeof state === 'string') {
            if (state == parseInt(state)) state = parseInt(state);
            else state = state.split('').reduce((r, s) => 31 * r + s.charCodeAt(0), 0);
        }
        if (typeof state === 'number') {
            state >>>= 0;
            this.a = state = (1664525 * state + 1013904223) % 4294967296;
            this.b = state = (1664525 * state + 1013904223) % 4294967296;
            this.c = state = (1664525 * state + 1013904223) % 4294967296;
            this.d = state = (1664525 * state + 1013904223) % 4294967296;
            if (this.d === 0) this.d = 1;

            for (let i = 0; i < 10; i++) {
                this.next();
            }
        } else {
            [this.a, this.b, this.c, this.d] = state;
        }
        
    }

    /**
     * Returns a pseudo-random integer between 0 (inclusive) and 2^32 (exclusive).
     * 
     * Original implementation by user bryc on StackOverflow: https://stackoverflow.com/a/47593316. Slightly modified.
     */
    next() {
        let r = this.a * 5;
        r = (r << 7 | r >>> 25) * 9;

        const t = this.b << 9;
        this.c ^= this.a; this.d ^= this.b;
        this.b ^= this.c; this.a ^= this.d; this.c ^= t;
        this.d = this.d << 11 | this.d >>> 21;

        return r >>> 0;
    }

    /**
     * Returns a pseudo-random floating point number between 0 (inclusive) and 1 (exclusive).
     */
    nextFloat() {
        return this.next() / 4294967296;
    }

    chance(chance) {
        return this.nextFloat() < chance;
    }

    /**
     * Returns a pseudo-random integer between minInclusive and maxExclusive. If only one argument is given,
     * minInclusive is assumed to be 0. If maxExclusive is greater than 2^31 - 1, behaviour is undefined.
     */
    nextInt(minInclusive = 0, maxExclusive) {
        if (maxExclusive === undefined) {
            maxExclusive = minInclusive;
            minInclusive = 0;
        }

        const dif = maxExclusive - minInclusive;
        while (true) {
            const r = this.next();
            if (r + dif < 4294967296) return minInclusive + r % dif;
        }
    }

    binomialInt(minInclusive, expectedValue, maxExclusive) {
        const n = maxExclusive - minInclusive;
        const exp = expectedValue - minInclusive;
        const p = exp / n;

        let k = 0;
        for (let i = 0; i < n; i++) {
            if (this.chance(p)) k++;
        }

        return minInclusive + k;
    }


    nextElement(array) {
        return array[this.nextInt(array.length)];
    }

    shuffle(array) {
        for (let i = 0; i < array.length - 1; i++) {
            array[i] = array[this.nextInt(i + 1, array.length)];
        }
    }
}