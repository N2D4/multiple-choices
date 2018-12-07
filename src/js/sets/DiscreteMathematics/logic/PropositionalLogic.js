import { createArray, range } from '../../../utils.js';


export class Formula {
    constructor(random, atomics, depth = 0) {
        this.depth = depth;

        if (random.chance(depth/4)) {
            this.type = "atomic";
            this.atomic = random.nextElement(atomics);
            return;
        }

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


    toString() {
        switch (this.type) {
            case "atomic":
                return this.atomic;
            case "neg":
                return "\\neg " + this.child;
            case "and": case "or":
                const formula = this.children.join(" \\l" + this.type + " ");
                return this.depth > 0 ? '(' + formula + ')' : formula;
            case "imply": case "imply2":
                const formulaI = this.left + " \\" + (this.type === "imply" ? '' : 'left') + "rightarrow " + this.right;
                return this.depth > 0 ? '(' + formulaI + ')' : formulaI;
        }
    }


    freeVariables() {
        switch (this.type) {
            case "atomic":
                return new Set([this.atomic]);
            case "neg":
                return this.child.freeVariables();
            case "and": case "or":
                return new Set(this.children.map(c => c.freeVariables()).reduce((a, b) => [...a, ...b]));
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
                interpretation[freeVariables[j]] = (i >> (freeVariables.length - j - 1) & 1);
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