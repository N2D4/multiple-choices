import Random from './Random.js';
import { range } from './utils.js';
import { Formula as PropositionalFormula } from './sets/DiscreteMathematics/logic/PropositionalLogic.js';

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
        console.log("Successfully ran test " + curTest + "! (" + (end - start) / 1000 + "s)");
    }

    function assert(val, ...args) {
        if (!val) {
            console.error("Test " + curTest + " failed", ...args);
            throw new Error("Test " + curTest + " failed" + (args.length >= 1 ? " with arguments: " + args : ""));
        }
    }

    const startOfAllTests = performance.now();




    // TODO check if simplified formula is actually in CNF/DNF
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
    }, 1000);


    runTest(function propositionalTruthTables(prog) {
        const atomicCount = Math.round(1 + 3 * prog * prog);
        const atomics = [...range(atomicCount)].map(i => String.fromCharCode(['A'.charCodeAt(0) + i]));

        const formula = new PropositionalFormula(random, atomics);
        const freeVariables = formula.freeVariables();
        const atomicsTable = formula.getTruthTable(atomics);
        const table = formula.getTruthTable();

        let newf = PropositionalFormula.fromTruthTable(atomicsTable, atomics, false);
        assert(newf.isEquivalent(formula), formula, "CNF:", newf, "table:", table);

        newf = PropositionalFormula.fromTruthTable(table, freeVariables, false);
        assert(newf.isEquivalent(formula), formula, "CNF:", newf, "table:", table, "only free variables");

        newf = PropositionalFormula.fromTruthTable(atomicsTable, atomics, true);
        assert(newf.isEquivalent(formula), formula, "DNF:", newf, "table:", table);

        newf = PropositionalFormula.fromTruthTable(table, freeVariables, true);
        assert(newf.isEquivalent(formula), formula, "DNF:", newf, "table:", table, "only free variables");


    }, 500);





    


    const endOfAllTests = performance.now();
    console.log("Successfully ran all tests! (" + (endOfAllTests - startOfAllTests) / 1000 + "s)");
}
