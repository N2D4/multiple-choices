import { createArray, range, removeDeepDuplicates, deepEquals } from '../../../utils.js';


export class Formula {
    constructor(random, atomics, depth = 0) {
        if (random instanceof Formula) {
            this.type = random.type;
            this.showBraces = random.showBraces;
            this.atomic = random.atomic;
            this.child = random.child;
            this.left = random.left;
            this.right = random.right;
            this.children = random.children === undefined ? undefined : [...random.children];
            Object.assign(this, atomics || {});
        } else if (typeof random === 'string') {
            this.type = random;
            this.showBraces = true;
            Object.assign(this, atomics || {});
        } else {
            this.showBraces = depth > 0;

            if (random.chance(depth/4)) {
                this.type = "atomic";
                this.atomic = random.nextElement(atomics);
            } else {
                switch (random.nextInt(4)) {
                    case 0:
                        this.type = "neg";
                        this.child = new Formula(random, atomics, depth + 0.25);
                        break;
                    case 1:
                        this.type = random.chance(3/4) ? "imply" : "imply2";
                        this.left = new Formula(random, atomics, depth + 1.5);
                        this.right = new Formula(random, atomics, depth + 1.5);
                        break;
                    case 2: case 3:
                        this.type = random.chance(1/2) ? "and" : "or";
                        const num = random.binomialInt(2, 2.3, atomics.length);
                        this.children = createArray(num).map(a => new Formula(random, atomics, depth + 1));
                        break;
                }
            }
        }
    }

    negate() {
        return new Formula("neg", {showBraces: this.showBraces, child: this});
    }


    isEquivalent(formula) {
        const freeVariables = [...this.freeVariables(), ...formula.freeVariables()];
        removeDeepDuplicates(freeVariables);

        for (let i = 0; i < (1 << freeVariables.length); i++) {
            const interpretation = {};
            for (let j = 0; j < freeVariables.length; j++) {
                interpretation[freeVariables[j]] = !!(i >> (freeVariables.length - j - 1) & 1);
            }

            if (this.evaluate(interpretation) !== formula.evaluate(interpretation)) return false;
        }

        return true;
    }

    isLiteral() {
        return this.type === "atomic" || (this.type === "neg" && this.child.type === "atomic");
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
                if (this.child.type === "neg") return new Formula(this.child.child.simplify() || this.child.child, {showBraces: this.showBraces});

                newf = new Formula(this);
                if ((newf.child = this.child.simplify()) !== undefined) return newf;

                newf = new Formula(this.child, {showBraces: this.showBraces});
                if (newf.type === "and" || newf.type === "or") {
                    newf.type = newf.type === "and" ? "or" : "and";
                    newf.children = newf.children.map(a => new Formula("neg", {child: a}));
                    return newf;
                }

                return undefined;
            case "and": case "or":
                const inv = this.type === "and" ? "or" : "and";

                if (this.children.length === 1) return new Formula(this.children[0].simplify() || this.children[0], {showBraces: this.showBraces});

                // ~A|A / ~A&A is tautology/unsatisfiable
                newf = new Formula(inv, {showBraces: this.showBraces, children: []});
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
                    const simplified = this.children[i].simplify();
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
                                const newch = child.children.filter(a => !(a.isLiteral() && compTo.negate().isEquivalent(a)));
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
                            newf = new Formula(child.type, {showBraces: this.showBraces, children: []});
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

                // Can't be simplified further!
                return undefined;


            case "imply": case "imply2":
                newf = new Formula(this);
                let canBeSimplifiedB = false;
                let simplified = this.left.simplify();
                if (simplified !== undefined) {
                    newf.left = simplified;
                    canBeSimplifiedB = true;
                }
                simplified = this.right.simplify();
                if (simplified !== undefined) {
                    newf.right = simplified;
                    canBeSimplifiedB = true;
                }
                if (canBeSimplifiedB) return newf;

                if (this.type === "imply") {
                    return new Formula("or", {showBraces: this.showBraces, children: [
                        new Formula("neg", {child: this.left}),
                        this.right,
                    ]});
                } else {
                    return new Formula("or", {showBraces: this.showBraces, children: [
                        new Formula("and", {children: [new Formula("neg", {child: this.left}), new Formula("neg", {child: this.right})]}),
                        new Formula("and", {children: [this.right, this.left]}),
                    ]});
                }
        }
    }


    toString(showBraces = this.showBraces) {
        switch (this.type) {
            case "atomic":
                return this.atomic;
            case "neg":
                return "\\neg " + this.child;
            case "and": case "or":
                if (this.children.length <= 0) return this.type == "and" ? "\\top" : "\\bot";
                const formula = this.children.join(" \\l" + this.type + " ");
                return showBraces ? '(' + formula + ')' : formula;
            case "imply": case "imply2":
                const formulaI = this.left + " \\" + (this.type === "imply" ? '' : 'left') + "rightarrow " + this.right;
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

    getTruthTable(formulaName) {
        const freeVariables = [...this.freeVariables()].sort();
        const rows = [];
        for (let i = 0; i < (1 << freeVariables.length); i++) {
            const interpretation = {};
            for (let j = 0; j < freeVariables.length; j++) {
                interpretation[freeVariables[j]] = !!(i >> (freeVariables.length - j - 1) & 1);
            }
            const evalres = Number(this.evaluate(interpretation));
            rows.push(`${freeVariables.map(a => Number(interpretation[a])).join(' & ')} & ${evalres}`);
        }

        function makeTable(rows) {
            return `\\begin{array}{${'c'.repeat(freeVariables.length)} | c}
                        ${freeVariables.join(` & `)} & ${formulaName} \\\\ \\hline
                        ${rows.join(' \\\\ \n')}
                    \\end{array}`
        }

        if (rows.length > 8) {
            return makeTable(rows.slice(0, rows.length / 2)) + ` \\qquad ` + makeTable(rows.slice(rows.length / 2, rows.length));
        } else {
            return makeTable(rows);
        }
    }
}