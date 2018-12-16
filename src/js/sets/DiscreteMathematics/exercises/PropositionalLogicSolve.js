import createExercise from '../../../createExercise.js';
import { charRange, removeDeepDuplicates } from '../../../utils.js';
import { Formula } from '../logic/PropositionalLogic.js';

export default (random) => {

    const atomicCount = random.binomialInt(2, 3, 5);
    const atomics = [...charRange(atomicCount)];

    const formula = new Formula(random, atomics);
    const freeVariables = formula.freeVariables();
    const freeVariableCount = freeVariables.size;
    const showTruthTable = freeVariableCount >= 2 && freeVariableCount <= 4 && random.chance(1/3);






    let interpretationCount = random.binomialInt(1, 2.5, 4);
    const interpretations = [];
    for (let i = 0; i < interpretationCount; i++) {
        let interpretation;
        do {
            interpretation = {};
            for (const atomic of atomics) {
                if (!random.chance(1/(3 *atomicCount))) {
                    interpretation[atomic] = random.chance(1/2);
                }
            }
        } while (showTruthTable && !formula.isSuitable(interpretation));    // don't allow insuitable interpretations if we only have the truth table
        interpretations.push(interpretation);
    }
    removeDeepDuplicates(interpretations);
    interpretationCount = interpretations.length;

    function renderInterpretation(interpretation) {
        return "\\{" + Object.entries(interpretation).sort().map(a => a[0] + " = " + Number(a[1])).join(', ') + "\\}";
    }





    const interpretationAnswers = [];
    for (let i = 0; i < interpretations.length; i++) {
        const interpretation = interpretations[i];
        const isSuitable = formula.isSuitable(interpretation);
        const isModel = formula.evaluate(interpretation);
        const noModelReason = isSuitable ? `` : ` \\(F\\) is not suitable.`;
        interpretationAnswers.push({
            caption: `\\(\\mathcal{A}_{${i + 1}}\\) is suitable for \\(F\\)`,
            tip: `An interpretation is suitable for a formula if and only if it contains all its freely occuring variables (and possibly more).`,
            correct: isSuitable,
            appearChance: showTruthTable ? 0 : 1/2,
            score: 0.5,
        });
        interpretationAnswers.push({
            caption: `\\(\\mathcal{A}_{${i + 1}}\\) is a model for \\(F\\)`,
            tip: `An interpretation is a model for a formula if and only if it is suitable and the corresponding entry in the truth table evaluates to 1.${noModelReason}`,
            correct: isSuitable && isModel,
            score: isSuitable ? 1 : 0.5,
        });
        interpretationAnswers.push('---');
    }


    let simplifiedFormulaDNF = formula;
    const simplifySteps = [];
    while (simplifiedFormulaDNF !== undefined) {
        simplifySteps.push(simplifiedFormulaDNF);
        simplifiedFormulaDNF = simplifiedFormulaDNF.simplify(true);
    }
    simplifiedFormulaDNF = simplifySteps[simplifySteps.length - 1];

    const simplifiedFormulaCNF = simplifiedFormulaDNF.simplifyFull(false);




    const similarFormulas = [
        simplifiedFormulaDNF,
        simplifiedFormulaCNF,
        formula.getSlightlyModified(random),
        formula.getSlightlyModified(random),
        formula.getSlightlyModified(random),
        formula.getSlightlyModified(random),
        formula.getSlightlyModified(random),
        formula.getSlightlyModified(random),
    ];
    removeDeepDuplicates(similarFormulas);

    random.shuffle(similarFormulas);


    const possibleCNFDNFFormulas = [];
    while (possibleCNFDNFFormulas.length < 5) {
        const form = new Formula(random, [...charRange('A', 6)]).simplifyFull(random.chance(1/2));
        function contZeroL(form) {
            switch (form.type) {
                case "atomic": return false;
                case "neg": return contZeroL(form.child);
                case "and": case "or": return form.children.length <= 0 || form.children.some(a => contZeroL(a));
                case "imply": case "imply2": return contZeroL(form.left) || contZeroL(form.right);
            }
        }
        if (!contZeroL(form)) possibleCNFDNFFormulas.push(form);
    }


    return createExercise(random, {
        question: `
                    Consider the following ${showTruthTable ? `truth table` : `formula`} and interpretation${interpretations.length > 1 ? 's' : ''} in propositional logic:<br>
                    \\[
                        ${showTruthTable ? formula.renderTruthTable(`F`)
                                            : `F \\equiv ${formula}`
                        }
                    \\]
                    \\[
                        \\begin{aligned}
                            ${interpretations.map((a, i) => `\\mathcal{A}_{${i + 1}} &= ${renderInterpretation(a)}`).join(` \\\\ \n`)}
                        \\end{aligned}
                    \\]
                    Which of the following statements apply?
                  `,
        method: showTruthTable ? ``
                               : `
                                    \\[
                                        \\begin{aligned}
                                            F &\\equiv ${simplifySteps.join(` \\\\ \n &\\equiv `)}
                                        \\end{aligned}
                                    \\]
                                    \\[
                                        ${formula.renderTruthTable(`F`)}
                                    \\]
                                  `,
        answerType: 'checkbox',
        answers: [
            ...interpretationAnswers,
            '---',
            {
                caption: `\\(F\\) is unsatisfiable`,
                tip: `A formula is satisfiable if and only if no single truth table entry is 1.`,
                correct: formula.isUnsatisfiable(),
                appearChance: 2/3,
                score: 1,
            },
            {
                caption: `\\(F\\) is satisfiable`,
                tip: `A formula is satisfiable if and only if at least one truth table entry is 1.`,
                correct: formula.isSatisfiable(),
                appearChance: 2/3,
                score: 1,
            },
            {
                caption: `\\(F\\) is ${random.chance(1/2) ? `a tautology` : `valid`}`,
                tip: `A formula is a tautology/valid if and only if every truth table entry is 1.`,
                correct: formula.isTautology(),
                appearChance: 2/3,
                score: 1,
            },
            '---',
            {
                caption: `\\(F \\equiv F \\land (Y \\lor \\neg Y)\\) whereas \\(Y\\) is an atomic formula`,
                tip: `A formula is equivalent to another formula if and only if they evaluate to the same value for any interpretation. Additional free atomic variables do not matter.`,
                correct: true,
                appearChance: 1/3,
                score: 0.5,
            },
            ...similarFormulas.map(similar => ({
                caption: `\\(F \\equiv ${similar}\\)`,
                tip: `A formula is equivalent to another formula if and only if they evaluate to the same value for any interpretation.`,
                correct: formula.isEquivalent(similar),
                appearChance: 1/similarFormulas.length,
                score: 1,
            })),
            {
                caption: `\\(F \\vDash F \\land Y\\) for all formulas \\(Y\\)`,
                tip: `Any conjunction (but not necessarily disjunction!) is a logical consequence of its operands.`,
                correct: true,
                appearChance: 1/6,
                score: 0.25,
            },
            {
                caption: `\\(F \\vDash ${Formula.tautology()}\\)`,
                tip: `Any tautology is a logical consequence of every formula.`,
                correct: true,
                appearChance: 1/4,
                score: 0.5,
            },
            '---',
            ...similarFormulas.map(similar => ({
                caption: `\\(F \\vDash ${similar}\\)`,
                tip: `A formula is a logical consequence of another if and only if it evaluates to true for any interpretation for which the other formula evaluates to true. No requirement for the right-hand side is given if the left-hand side evaluates to false for a given interpretation.`,
                correct: formula.implies(similar),
                appearChance: 1/similarFormulas.length,
                score: 1,
            })),
            {
                caption: `\\(F \\lor Y \\vDash F\\) for all formulas \\(Y\\)`,
                tip: `Any operand of a disjunction (but not necessarily conjunction!) is a logical consequence of the entire disjunction.`,
                correct: true,
                appearChance: 1/6,
                score: 0.25,
            },
            '---',
            {
                caption: `\\(${Formula.unsatisfiable()} \\vDash F\\)`,
                tip: `Any formula is a logical consequence of every unsatisfiable formula.`,
                correct: true,
                appearChance: 1/4,
                score: 0.5,
            },
            ...similarFormulas.map(similar => ({
                caption: `\\(${similar} \\vDash F\\)`,
                tip: `A formula is a logical consequence of another if and only if it evaluates to true for any interpretation for which the other formula evaluates to true. No requirement for the right-hand side is given if the left-hand side evaluates to false for a given interpretation.`,
                correct: similar.implies(formula),
                appearChance: 1/similarFormulas.length,
                score: 1,
            })),
            '---',
            ...possibleCNFDNFFormulas.map(f => ({
                caption: `\\(${f}\\) is in CNF`,
                tip: `A formula is in conjunctive normal form if it is a conjunction of disjunctions of literals. Note that a single literal is also considered a disjunction of literals, and a single disjunction is also considered a conjunction of disjunctions.`,
                correct: f.isCNF(),
                appearChance: 1/possibleCNFDNFFormulas.length,
                score: 1,
            })),
            ...possibleCNFDNFFormulas.map(f => ({
                caption: `\\(${f}\\) is in DNF`,
                tip: `A formula is in disjunctive normal form if it is a disjunction of conjunctions of literals. Note that a single literal is also considered a conjunctions of literals, and a single conjunction is also considered a disjunction of conjunction.`,
                correct: f.isDNF(),
                appearChance: 1/possibleCNFDNFFormulas.length,
                score: 1,
            })),
            '---'
        ],
    });
};