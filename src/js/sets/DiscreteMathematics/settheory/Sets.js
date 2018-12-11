import { deepEquals, removeDeepDuplicates } from "../../../utils.js";
import Random from "../../../Random.js";


// TODO add iterator requirement for general collections
export class Collection {
    simplify() {
        throw new Error("Unimplemented!");
    }

    size() {
        throw new Error("Unimplemented!");
    }

    isEmpty() {
        return this.size() === 0;
    }

    atomicCount(countEmpties = false) {
        return this.elements.reduce((r, a) => {
            if (!(a instanceof Collection)) return r + 1;
            return r + a.isEmpty() ? Number(countEmpties) : a.atomicCount(countEmpties);
        }, 0);
    }
}

export class MSet extends Collection {
    contains() {
        throw new Error("Unimplemented!");
    }
    
    isSubSetOf(other) {
        throw new Error("Unimplemented!");
    }
    
    isSuperSetOf(other) {
        throw new Error("Unimplemented!");
    }

    nthSubSet(n) {
        throw new Error("Unimplemented!");
    }

    powerSet() {
        const news = this.simplify();
        const arr = [];
        for (let i = 0; i < (1 << news.size()); i++) {
            arr.push(news.nthSubSet(i));
        }
        return new FiniteSet(arr).simplify();
    }

    elementLength() {
        throw new Error("Unimplemented!");
    }

}

export class FiniteSet extends MSet {

    constructor(random, atomics = [FiniteSet.empty()], depth = 1, depthCap = 3) {
        super();
        const elementCount = random instanceof Random ? random.nextInt(0, Math.round(6 - depth)) : undefined;
        this.elements = new FiniteTuple(random, elementCount, atomics, depth, depthCap).elements;
    }

    static empty() {
        return new FiniteSet([], []);
    }

    size() {
        return this.simplify().elementLength();
    }

    elementLength() {
        return this.elements.length;
    }

    toString() {
        if (this.size() === 0) return "\\varnothing";
        return '\\{' + this.elements.join(' , ') + '\\}';
    }

    simplify() {
        const arr = this.elements.map(a => a instanceof Collection ? a.simplify() : a);
        removeDeepDuplicates(arr);
        arr.sort((a, b) => FiniteSet.compare(a, b));
        return new FiniteSet(arr);
    }

    static compare(a, b) {
        if (a instanceof MSet && b instanceof MSet) {
            const asize = a.size(), bsize = b.size();
            if (asize < bsize) return -1;
            if (bsize < asize) return 1;
            if (a instanceof FiniteSet && b instanceof FiniteSet) {
                // TODO Replace with iterator for general MSets
                for (let i = 0; i < a.elements.length; i++) {
                    if (a.elements[i] < b.elements[i]) return -1;
                    if (b.elements[i] < a.elements[i]) return 1;
                }
            }
            return 0;
        }
        else if (!(a instanceof MSet) && b instanceof MSet) return b.isEmpty() ? 1 : -1;
        else if (a instanceof MSet && !(b instanceof MSet)) return a.isEmpty() ? -1 : 1;
        else return a < b ? -1
                  : a > b ? 1
                  : 0;
    }

    union(other) {
        const res = [...this.elements, ...other.elements];
        return new FiniteSet(res).simplify();
    }

    intersect(other) {
        const res = [];
        for (const element in this.elements) {
            if (other.contains(element)) {
                res.push(element);
            }
        }
        return new FiniteSet(res).simplify();
    }

    crossProduct(other) {
        const res = [];
        for (const e1 of this.elements) {
            for (const e2 of other.elements) {
                res.push(new FiniteTuple([e1, e2]));
            }
        }
        return new FiniteSet(res);
    }

    nthSubSet(n) {
        const res = [];
        for (let i = 0; i < this.elements.length; i++) {
            if ((n >> i & 1) === 1) res.push(this.elements[i]);
        }
        return new FiniteSet(res).simplify();
    }

    anySubSet(random, sizeMax = this.size()) {
        const res = [];
        sizeMax = Math.min(sizeMax, this.size());
        const size = random.nextInt(sizeMax + 1);
        for (let i = 0; i < size; i++) {
            res.push(random.nextElement(this.elements));
        }
        return new FiniteSet(res);
    }

    contains(possibleElement) {
        return this.elements.some(a => deepEquals(a, possibleElement));
    }

    isSubSetOf(other) {
        if (!(other instanceof MSet)) return false;
        return this.elements.every(a => other.contains(a));
    }

    isSuperSetOf(other) {
        if (!(other instanceof MSet)) return false;
        return other.isSubSetOf(this);
    }

    equals(other) {
        if (!(other instanceof FiniteSet)) return false;
        return this.isSubSetOf(other) && this.isSuperSetOf(other);
    }

}


export class FiniteTuple extends Collection {

    constructor(random, elementCount, atomics = [FiniteSet.empty()], depth = 1, depthCap = 3) {
        super();
        if (Array.isArray(random)) {
            this.elements = random;
        } else {
            this.elements = [];
            for (let i = 0; i < elementCount; i++) {
                if (random.chance(depth/depthCap)) {
                    this.elements[i] = random.nextElement(atomics);
                } else {
                    this.elements[i] = new FiniteSet(random, atomics, depth + 1, depthCap);
                }
            }
        }
    }

    size() {
        return this.elements.length;
    }

    toString() {
        return '(' + this.elements.join(' , ') + ')';
    }

    simplify() {
        return new FiniteTuple(this.elements.map(a => a instanceof Collection ? a.simplify() : a));
    }

    equals(other) {
        if (!(other instanceof FiniteTuple)) return false;
        if (this.size() !== other.size()) return false;

        for (let i = 0; i < this.elements.length; i++) {
            if (!deepEquals(this.elements[i], other.elements[i])) return false;
        }
        return true;
    }

}

