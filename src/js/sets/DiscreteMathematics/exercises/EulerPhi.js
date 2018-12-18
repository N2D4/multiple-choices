import createExercise from '../../../createExercise.js';
import { range, removeDeepDuplicates, spreadNumbersModulo } from '../../../utils.js';
import { gcd, lcm, eulerPhi, multiplicativeOrder, modularPow, modularInverse, primeFactors, extendedEuclidTable, extendedEuclid } from '../NumberTheory.js';

export default (random) => {
    const r = random.nextInt(1, 11);
    const a = random.chance(1/2) ? random.nextInt(2, 22) * r*r : random.nextInt(2, 200);
    const factors = primeFactors(a);
    const facstr = factors.join(` \\cdot `);
    const showZ = random.chance(1/2);
    const result = eulerPhi(a);
    const posResults = spreadNumbersModulo(random, a, ...[result, a, factors.map(a => a - 1).reduce((a, b) => a * b), factors.reduce((a, b) => a + b), random.nextInt(a), random.nextInt(a), Math.sqrt(random.nextInt(a))]);


    return createExercise(random, {
        question: `Calculate:
                    \\[
                        \\begin{gathered}
                            ${showZ ? `| \\mathbb{Z}_{${a}}^* |` : `\\varphi (${a})`} \\\\
                            ${a} ${factors.length <= 1 ? `\\textrm{ is prime}` : `= ${facstr}`}
                        \\end{gathered}
                    \\]
                  `,
        answerType: 'radio',
        answers: [
            ...posResults.map(r => ({
                caption: `\\(${r}\\)`,
                tip: `
                        To calculate the euler phi function, we decrement the first occurence of each prime factor by one. If \\(p\\) is prime, then \\(\\varphi (p) = p - 1\\).
                        \\[
                            \\begin{aligned}
                                \\varphi (${a}) &= ${factors.length <= 1 ? `${result}` : `
                                    \\varphi (${facstr}) \\\\
                                    &= ${factors.reduce((a, b) => [[...a[0], (b === a[1] ? b : b - 1)], b], [[], 0])[0].join(` \\cdot `)} \\\\
                                    &= ${result}
                                `}
                            \\end{aligned}
                        \\]
                     `,
                correct: result === r,
                appearChance: result === r ? 1 : 6 / posResults.length,
                score: result === r,
            }))
        ]
    });
};