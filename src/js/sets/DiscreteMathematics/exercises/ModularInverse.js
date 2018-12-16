import createExercise from '../../../createExercise.js';
import { range, removeDeepDuplicates } from '../../../utils.js';
import { gcd, lcm, eulerPhi, multiplicativeOrder, modularPow, modularInverse, primeFactors, extendedEuclidTable, extendedEuclid } from '../NumberTheory.js';

export default (random) => {
    const a1 = random.nextInt(2, 100);
    const b1 = random.nextInt(2, 100);
    const a = random.chance(4/5) ? a1 / gcd(a1, b1) : a1;
    const m = random.chance(4/5) ? b1 / gcd(a, b1) : b1;

    const [, u, v,] = extendedEuclid(a, m);
    const result = gcd(a, m) === 1 ? modularInverse(a, m) : undefined;
    const posResults = [...[...range(20)].map(_ => random.nextInt(0, m))];
    if (result !== undefined) posResults.push(result);
    removeDeepDuplicates(posResults.sort((a, b) => a - b));


    return createExercise(random, {
        question: `
                    \\[
                        \\begin{gathered}
                            ${a} \\cdot x \\equiv_{${m}} 1, \\\\
                            0 \\leq x < ${m}
                        \\end{gathered}
                    \\]
                  `,
        answerType: 'radio',
        answers: [
            {
                caption: `No such \\(x\\) exists`,
                tip: `The modular inverse of a number exists if and only if the number is relatively prime to the modulo, in other words, \\(\\textrm{gcd}(${a}, ${m}) = 1\\).`,
                correct: result === undefined,
                score: result === undefined,
            },
            ...posResults.map(r => ({
                caption: `\\(${r}\\)`,
                tip: `
                        Using the euclidean algorithm, we find that \\( ${a} \\cdot u + ${m} \\cdot v = 1 \\) with \\( u = ${u}, v = ${v} \\). We get \\(${a} \\cdot u + ${m} \\cdot v \\equiv_{${m}} ${a} \\cdot u \\equiv_{${m}} 1\\), therefore \\(x \\equiv_{${m}} ${u}\\). The unique number \\(x\\) is also called the modular inverse of \\(${a}\\) modulo \\(${m}\\) and exists if and only if \\(\\textrm{gcd}(a, m) = 1\\).
                        \\[
                            ${extendedEuclidTable(a, m)}
                        \\]
                     `,
                correct: result === r,
                appearChance: result === r ? 1 : 5 / posResults.length,
                score: result === r,
            })),
        ]
    });
};