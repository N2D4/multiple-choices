import Random from '../../../Random.js';
import { createArray, range, removeDeepDuplicates, deepEquals } from '../../../utils.js';

export class Formula {
    constructor(random, atomics, depth = 0, depthCap = 5) {
        if (random instanceof Random && atomics.length <= 0) {
            random = random.chance(0.5) ? Formula.tautology() : Formula.unsatisfiable();
        }

        if (random instanceof Formula) {
            this.type = random.type;
            this.atomic = random.atomic;
            this.child = random.child;
            this.left = random.left;
            this.right = random.right;
            this.children = random.children === undefined ? undefined : [...random.children];
            Object.assign(this, atomics || {});
        } else if (typeof random === 'string') {
            this.type = random;
            Object.assign(this, atomics || {});
        } else {
            if (random.chance(depth/depthCap)) {
                this.type = "atomic";
                this.atomic = random.nextElement(atomics);
            } else {
                switch (random.nextInt(4)) {
                    case 0:
                        this.type = "neg";
                        this.child = new Formula(random, atomics, depth + 0.25, depthCap);
                        break;
                    case 1:
                        this.type = random.chance(3/4) ? "imply" : "imply2";
                        this.left = new Formula(random, atomics, depth + 1.5, depthCap);
                        this.right = new Formula(random, atomics, depth + 1.5, depthCap);
                        break;
                    case 2: case 3:
                        this.type = random.chance(1/2) ? "and" : "or";
                        const num = random.chance(1/16) ? 0 : random.binomialInt(2, 2.3, Math.max(atomics.length, 3));
                        this.children = createArray(num).map(a => new Formula(random, atomics, depth + 1, depthCap));
                        break;
                }
            }
        }
    }

    getSlightlyModified(random) {
        let newf = this;
        if (random.chance(1/4)) {
            newf = newf.getSlightlyModified(random);
        }
        const other = new Formula(random, [...newf.freeVariables()], 0, 1.5);
        newf = new Formula(random.chance(1/2) ? "and" : "or", {children: [newf, other]});
        const simplified = newf.simplifyFull(random.chance(1/2));
        return simplified;
    }

    negated() {
        return new Formula("neg", {child: this});
    }

    implies(formula) {
        const freeVariables = [...this.freeVariables(), ...formula.freeVariables()];
        removeDeepDuplicates(freeVariables);
        const thistt = this.getTruthTable(freeVariables);
        const formulatt = formula.getTruthTable(freeVariables);
        return thistt.map((a, i) => !a || formulatt[i]).every(a => a);
    }

    isEquivalent(formula) {
        return this.implies(formula) && formula.implies(this);
    }

    isLiteral() {
        return this.type === "atomic" || (this.type === "neg" && this.child.type === "atomic");
    }

    static tautology() {
        return new Formula("and", {children: []})
    }

    static unsatisfiable() {
        return new Formula("or", {children: []})
    }

    isTautology() {
        return this.isEquivalent(Formula.tautology());
    }

    isUnsatisfiable() {
        return this.isEquivalent(Formula.unsatisfiable());
    }

    isSatisfiable() {
        return !this.isUnsatisfiable();
    }

    isCNF() {
        return this.isClause(false, 2);
    }

    isDNF() {
        return this.isClause(true, 2);
    }

    isClause(dnf, depth = 1) {
        if (depth <= 0) return this.isLiteral();
        return this.isClause(!dnf, depth - 1) || ((this.type === (dnf ? "or" : "and")) && this.children.every(a => a.isClause(!dnf, depth - 1)));
    }


    simplifyFull(dnf = true) {
        let cur = this;
        let last = undefined;
        while (cur !== undefined) {
            last = cur;
            cur = cur.simplify(dnf);
        }
        return last;
    }

    /**
     * I wrote this at 3am so don't blame me
     */
    simplify(dnf = true) {
        let newf;
        switch (this.type) {
            case "atomic":
                return undefined;
            case "neg":
                if (this.child.type === "neg") return new Formula(this.child.child.simplify(dnf) || this.child.child);

                newf = new Formula(this);
                if ((newf.child = this.child.simplify(dnf)) !== undefined) return newf;

                newf = new Formula(this.child);
                if (newf.type === "and" || newf.type === "or") {
                    newf.type = newf.type === "and" ? "or" : "and";
                    newf.children = newf.children.map(a => new Formula("neg", {child: a}));
                    return newf;
                }

                return undefined;
            case "and": case "or":
                const inv = this.type === "and" ? "or" : "and";

                if (this.children.length === 1) return new Formula(this.children[0].simplify(dnf) || this.children[0]);

                // ~A|A / ~A&A is tautology/unsatisfiable
                newf = new Formula(inv, {children: []});
                for (const child of this.children) {
                    if (child.type === "neg") {
                        for (const child2 of this.children) {
                            if (deepEquals(child.child, child2)) return newf;
                        }
                    } else if (child.type === inv) {      // Distributivity already does this, but much later
                        if (child.children.length === 0) return newf;
                    }
                }

                // Check if any children is simplifiable
                newf = new Formula(this);
                let canBeSimplified = false;
                for (let i = 0; i < this.children.length; i++) {
                    const simplified = this.children[i].simplify(dnf);
                    if (simplified !== undefined) {
                        newf.children[i] = simplified;
                        canBeSimplified = true;
                    }
                }
                if (canBeSimplified) return newf;

                // Remove duplicates and empty formulas
                newf = new Formula(this);
                const oldchildrenc = newf.children.length;
                removeDeepDuplicates(newf.children);
                if (newf.children.length !== oldchildrenc) return newf;

                // Associativity: (A & B) & C == A & B & C
                canBeSimplified = false;
                newf = new Formula(this, {children: []});
                for (const child of this.children) {
                    if (child.type === this.type) {
                        newf.children = [...newf.children, ...child.children];
                        canBeSimplified = true;
                    } else {
                        newf.children.push(child);
                    }
                }
                if (canBeSimplified) return newf;

                // Absorption: A & (A | B) == A
                canBeSimplified = false;
                newf = new Formula(this);
                outer: for (let i = 0; i < newf.children.length; i++) {
                    const child = newf.children[i];
                    if (child.type === inv) {
                        for (const compTo of newf.children) {
                            if (compTo === child) continue;
                            switch (compTo.type) {
                                case "atomic": case "neg":
                                    if (child.children.some(a => compTo.isEquivalent(a))) {
                                        newf.children.splice(i--, 1);
                                        canBeSimplified = true;
                                        continue outer;
                                    }
                                    break;
                                case inv:
                                    if (compTo.children.every(a => child.children.some(b => a.isEquivalent(b)))) {
                                        newf.children.splice(i--, 1);
                                        canBeSimplified = true;
                                        continue outer;
                                    }
                            }
                        }
                    }
                }
                if (canBeSimplified) return newf;

                // Negated absorption: ~A & (A | B) == ~A & B
                canBeSimplified = false;
                newf = new Formula(this);
                for (let i = 0; i < newf.children.length; i++) {
                    let child = newf.children[i];
                    if (child.type === inv) {
                        for (const compTo of newf.children) {
                            if (compTo.isLiteral()) {
                                const newch = child.children.filter(a => !(a.isLiteral() && compTo.negated().isEquivalent(a)));
                                if (newch.length < child.children.length) {
                                    child = newf.children[i] = new Formula(child, {children: newch});
                                    canBeSimplified = true;
                                }
                            }
                        }
                    }
                }
                if (canBeSimplified) return newf;

                // Distributivity: A & (B | C) == (A & B) | (A & C)
                if (this.type === (dnf ? "and" : "or")) {
                    for (const child of this.children) {
                        if (child.type === inv) {
                            newf = new Formula(child.type, {children: []});
                            for (const childchild of child.children) {
                                const newfchild = new Formula(this.type, {children: [childchild]});
                                for (const child2 of this.children) {
                                    if (child !== child2) {
                                        newfchild.children.push(child2);
                                    }
                                }
                                newf.children.push(newfchild);
                            }
                            return newf;
                        }
                    }
                }

                // Literal burning: (A | B | C) & (A | B | ~C) = (A | B)
                canBeSimplified = false;
                newf = new Formula(this);
                outer: for (let i = 0; i < newf.children.length; i++) {
                    let child = newf.children[i];
                    if (child.type !== inv) continue;
                    middle: for (let j = i + 1; j < newf.children.length; j++) {
                        let compTo = newf.children[j];
                        if (compTo.type !== inv) continue;
                        if (compTo.children.length !== child.children.length) continue;
                        let foundNegated = undefined;
                        for (const childchild of child.children) {
                            if (!childchild.isLiteral()) continue outer;
                            if (compTo.children.some(a => a.isLiteral() && a.isEquivalent(childchild))) {
                                continue;
                            } else {
                                if (foundNegated !== undefined) continue middle;
                                const neg = compTo.children.filter(a => a.isLiteral() && a.negated().isEquivalent(childchild));
                                if (neg.length >= 1) {
                                    foundNegated = childchild;
                                } else {
                                    continue middle;
                                }
                            }
                        }
                        if (foundNegated === undefined) continue middle;
                        child = newf.children[i] = new Formula(child, {children: child.children.filter(a => !a.isEquivalent(foundNegated))});
                        newf.children.splice(j--, 1);
                        canBeSimplified = true;
                    }
                }
                if (canBeSimplified) return newf;

                // Can't be simplified further!
                return undefined;


            case "imply": case "imply2":
                newf = new Formula(this);
                let canBeSimplifiedB = false;
                let simplified = this.left.simplify(dnf);
                if (simplified !== undefined) {
                    newf.left = simplified;
                    canBeSimplifiedB = true;
                }
                simplified = this.right.simplify(dnf);
                if (simplified !== undefined) {
                    newf.right = simplified;
                    canBeSimplifiedB = true;
                }
                if (canBeSimplifiedB) return newf;

                if (this.type === "imply") {
                    return new Formula("or", {children: [
                        new Formula("neg", {child: this.left}),
                        this.right,
                    ]});
                } else {
                    return new Formula("or", {children: [
                        new Formula("and", {children: [new Formula("neg", {child: this.left}), new Formula("neg", {child: this.right})]}),
                        new Formula("and", {children: [this.left, this.right]}),
                    ]});
                }
        }
    }


    toString(showBraces = false) {
        switch (this.type) {
            case "atomic":
                return this.atomic;
            case "neg":
                return "\\neg " + this.child.toString(true);
            case "and": case "or":
                if (this.children.length <= 0) return this.type == "and" ? "\\top" : "\\bot";
                const formula = this.children.map(c => c.toString(true)).join(" \\l" + this.type + " ");
                return showBraces ? '(' + formula + ')' : formula;
            case "imply": case "imply2":
                const formulaI = this.left.toString(true) + " \\" + (this.type === "imply" ? '' : 'left') + "rightarrow " + this.right.toString(true);
                return showBraces ? '(' + formulaI + ')' : formulaI;
        }
    }


    freeVariables() {
        switch (this.type) {
            case "atomic":
                return new Set([this.atomic]);
            case "neg":
                return this.child.freeVariables();
            case "and": case "or":
                return new Set(this.children.map(c => c.freeVariables()).reduce((a, b) => [...a, ...b], []));
            case "imply": case "imply2":
                return new Set([...this.left.freeVariables(), ...this.right.freeVariables()]);
        }
    }


    isSuitable(interpretation) {
        for (const freeVariable of this.freeVariables()) {
            if (interpretation[freeVariable] === undefined) return false;
        }
        return true;
    }


    evaluate(interpretation) {
        switch (this.type) {
            case "atomic":
                return interpretation[this.atomic];
            case "neg":
                return !this.child.evaluate(interpretation);
            case "and":
                return this.children.every(a => a.evaluate(interpretation));
            case "or":
                return this.children.some(a => a.evaluate(interpretation));
            case "imply":
                return !this.left.evaluate(interpretation) || this.right.evaluate(interpretation);
            case "imply2":
                return this.left.evaluate(interpretation) === this.right.evaluate(interpretation);
        }
    }

    static fromTruthTable(truthTable, atomics, dnf = true) {
        atomics = [...atomics].sort();
        atomics = atomics || [...this.freeVariables()].sort();
        const newf = new Formula("or", {children: []});
        for (let i = 0; i < truthTable.length; i++) {
            if (truthTable[i]) {
                const newchild = new Formula("and", {children: []});
                for (let j = 0; j < atomics.length; j++) {
                    const atomicc = new Formula("atomic", {atomic: atomics[j]});
                    const ist = (i >> (atomics.length - j - 1) & 1) === 1;
                    if (ist) {
                        newchild.children.push(atomicc);
                    } else {
                        newchild.children.push(new Formula("neg", {child: atomicc}));
                    }
                }
                newf.children.push(newchild);
            }
        }
        return newf.simplifyFull(dnf);
    }

    getTruthTable(atomics = undefined) {
        atomics = [...(atomics || this.freeVariables())].sort();
        const result = [];
        for (let i = 0; i < (1 << atomics.length); i++) {
            const interpretation = {};
            for (let j = 0; j < atomics.length; j++) {
                interpretation[atomics[j]] = (i >> (atomics.length - j - 1) & 1) === 1;
            }
            const evalres = Number(this.evaluate(interpretation));
            result.push(evalres);
        }
        return result;
    }

    renderTruthTable(formulaName) {
        const freeVariables = [...this.freeVariables()].sort();
        const truthTable = this.getTruthTable(freeVariables);
        const rows = [];
        for (let i = 0; i < truthTable.length; i++) {
            const varMaps = freeVariables.map((a, ind) => (i >> (freeVariables.length - ind - 1)) & 1);
            rows.push(`${varMaps.join(' & ')} & ${truthTable[i]}`);
        }

        function makeTable(rows) {
            return `\\begin{array}{${'c'.repeat(freeVariables.length)} | c}
                        ${freeVariables.join(` & `)} & ${formulaName} \\\\ \\hline
                        ${rows.join(' \\\\ \n')}
                    \\end{array}`;
        }

        if (rows.length > 8) {
            return makeTable(rows.slice(0, rows.length / 2)) + ` \\qquad ` + makeTable(rows.slice(rows.length / 2, rows.length));
        } else {
            return makeTable(rows);
        }
    }
}


