import Random from './Random.js';
import { range } from './utils.js';
import { Formula as PropositionalFormula } from './sets/DiscreteMathematics/logic/PropositionalLogic.js';
import { gcd, lcm, extendedEuclid, primeFactors, modularInverse, modularPow, eulerPhi, multiplicativeOrder } from './sets/DiscreteMathematics/NumberTheory.js';

export default function runTests(scale = 1) {
    console.log("Running tests...");
    console.log("Scale: " + scale);

    const random = new Random("doesn't really matter what we put in here, it just needs to stay constant");


    let curTest;
    function runTest(test, count) {
        count *= scale;
        curTest = test.name;
        console.log("Running test " + curTest + " " + count + " times...")
        const start = performance.now();
        for (let i = 1; i <= count; i++) {
            test((i - 1) / count);
            if ((i & i - 1) == 0) console.log("  Ran test " + curTest + " " + i + " times!");
        }
        const end = performance.now();
        console.log("Successfully ran test " + curTest + " " + count + " times! (" + (end - start) / 1000 + "s)");
    }

    function assert(val, ...args) {
        if (!val) {
            console.error("Test " + curTest + " failed", ...args);
            throw new Error("Test " + curTest + " failed" + (args.length >= 1 ? " with arguments: " + args : ""));
        }
    }

    const startOfAllTests = performance.now();




    runTest(function propositionalSimplify(prog) {
        const atomicCount = Math.round(1 + 6 * prog);
        const atomics = [...range(atomicCount)].map(i => String.fromCharCode(['A'.charCodeAt(0) + i]));

        const isDNF = random.chance(1/2);
        const formula = new PropositionalFormula(random, atomics);
        let last = undefined;
        let simplified = formula;
        while (simplified !== undefined) {
            assert(simplified.isEquivalent(formula), "formula:", formula, "last:", last, "simplified:", simplified);
            last = simplified;
            simplified = simplified.simplify(isDNF);
        }
        assert(isDNF ? last.isDNF() : last.isCNF(), "CNF/DNF test", "formula:", formula, "simplified:", last);
    }, 500);


    runTest(function propositionalTruthTables(prog) {
        const atomicCount = Math.round(1 + 3 * prog * prog);
        const atomics = [...range(atomicCount)].map(i => String.fromCharCode(['A'.charCodeAt(0) + i]));

        const formula = new PropositionalFormula(random, atomics);
        const freeVariables = formula.freeVariables();
        const atomicsTable = formula.getTruthTable(atomics);
        const table = formula.getTruthTable();

        let newf = PropositionalFormula.fromTruthTable(atomicsTable, atomics, false);
        assert(newf.isEquivalent(formula), formula, "CNF:", newf, "table:", table);
        assert(newf.isCNF(), formula, "CNF:", newf, "table:", table);

        newf = PropositionalFormula.fromTruthTable(table, freeVariables, false);
        assert(newf.isEquivalent(formula), formula, "CNF:", newf, "table:", table, "only free variables");
        assert(newf.isCNF(), formula, "CNF:", newf, "table:", table, "only free variables");

        newf = PropositionalFormula.fromTruthTable(atomicsTable, atomics, true);
        assert(newf.isEquivalent(formula), formula, "DNF:", newf, "table:", table);
        assert(newf.isDNF(), formula, "DNF:", newf, "table:", table);

        newf = PropositionalFormula.fromTruthTable(table, freeVariables, true);
        assert(newf.isEquivalent(formula), formula, "DNF:", newf, "table:", table, "only free variables");
        assert(newf.isDNF(), formula, "DNF:", newf, "table:", table, "only free variables");


    }, 300);



    runTest(function extendedEuclidTest(prog) {
        const a = random.nextInt(1, Math.round(1000 * prog));
        const b = random.nextInt(1, Math.round(1000 * prog));
        const abgcd = gcd(a, b);
        const ablcm = lcm(a, b);
        const euc = extendedEuclid(a, b);

        assert(euc[1] * a + euc[2] * b === euc[0], "extended euclid", {a, b, euc});

        assert(a % abgcd === 0 && b % abgcd === 0, "gcd not a divisor", {a, b, abgcd});
        for (let i = abgcd + 1; i < Math.min(a, b); i++) {
            assert(a % i !== 0 || b % i !== 0, "gcd not maximal", {a, b, i, abgcd});
        }

        assert(ablcm % a === 0 && ablcm % b === 0, "lcm not a multiple", {a, b, ablcm});
        for (let i = Math.max(a, b); i < ablcm; i += Math.max(a, b)) {
            assert(i % a !== 0 || i % b !== 0, "lcm not minimal", {a, b, i, ablcm});
        }
    }, 10000);



    runTest(function modularArithmetics(prog) {
        const a = random.nextInt(1, Math.round(1000000 * prog));
        const b = random.nextInt(1, Math.round(1000000 * prog));
        const s = random.nextInt(1, Math.round(100 * prog));
        const t = random.nextInt(1, Math.round(8 * prog));
        const m = random.nextInt(2, Math.round(1000 * prog));
        const p = random.nextElement(primeFactors(random.nextInt(1, Math.round(100000 * prog))));
        const a1 = a / gcd(a, b);
        const m1 = b / gcd(a, b);


        assert(gcd(a1, m1) === 1, "gcd", {a, b, s, t, m, p, a1, m1});
        if (m1 > 1) assert((a1 * modularInverse(a1, m1)) % m1 === 1, "modular inverse", {a, b, s, t, m, p, a1, m1});
        assert(modularPow(s, t, m) === Math.pow(s, t) % m, "modular pow", {a, b, s, t, m, p, a1, m1});
        if (a > 1) assert(primeFactors(a).reduce((a, b) => a * b) === a, "primefactors", {a, b, s, t, m, p, a1, m1});
    }, 10000);



    


    const endOfAllTests = performance.now();
    console.log("Successfully ran all tests! (" + (endOfAllTests - startOfAllTests) / 1000 + "s)");
}
