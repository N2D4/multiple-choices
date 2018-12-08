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




    runTest(function propositionalSimplify(prog) {
        const atomicCount = Math.round(2 + 6 * prog);
        const atomics = [...range(atomicCount)].map(i => String.fromCharCode(['A'.charCodeAt(0) + i]));

        const formula = new PropositionalFormula(random, atomics);
        let simplified = formula;
        while (simplified !== undefined) {
            assert(simplified.isEquivalent(formula), "formula:", formula, "simplified:", simplified);
            simplified = simplified.simplify();
        }
    }, 1000);
    
}
