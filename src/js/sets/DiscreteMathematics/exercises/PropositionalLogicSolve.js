import createExercise from '../../../createExercise.js';
import { range, removeDeepDuplicates } from '../../../utils.js';
import { Formula } from '../logic/PropositionalLogic.js';

export default (random) => {

    const atomicCount = random.binomialInt(2, 3, 5);
    const atomics = [...range(atomicCount)].map(i => String.fromCharCode(['A'.charCodeAt(0) + i]));

    const formula = new Formula(random, atomics);
    const freeVariableCount = formula.freeVariables().length;
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
            score: 1,
        });
        interpretationAnswers.push({
            caption: `\\(\\mathcal{A}_{${i + 1}}\\) is a model for \\(F\\)`,
            tip: `An interpretation is a model for a formula if and only if it is suitable and the corresponding entry in the truth table evaluates to 1.${noModelReason}`,
            correct: isSuitable && isModel,
            score: isSuitable ? 2 : 1,
        });
        interpretationAnswers.push('---');
    }






    return createExercise(random, {
        question: `
                    Consider the following ${showTruthTable ? `truth table` : `formula`} and interpretation${interpretations.length > 1 ? 's' : ''} in propositional logic:<br>
                    \\[
                        \\begin{gather}
                            ${showTruthTable ? formula.getTruthTable(`F`)
                                             : `F \\equiv ${formula}`
                            }
                            \\\\
                            \\begin{aligned}
                                ${interpretations.map((a, i) => `\\mathcal{A}_{${i + 1}} &= ${renderInterpretation(a)}`).join(` \\\\ \n`)}
                            \\end{aligned}
                        \\end{gather}
                    \\]<br>
                    Which of the following statements apply?
                  `,
        method: showTruthTable ? ``
                               : `\\[${formula.getTruthTable(`F`)}\\]`,
        answerType: 'checkbox',
        answers: [...interpretationAnswers],
    });
};