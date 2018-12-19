import createExercise from '../../../createExercise.js';
import { range, removeDeepDuplicates } from '../../../utils.js';
import { gcd, lcm, eulerPhi, multiplicativeOrder, modularPow, modularInverse, primeFactors, extendedEuclidTable, extendedEuclid } from '../NumberTheory.js';

export default (random) => {
    const a = random.nextInt(2, 200);
    const b = random.nextInt(2, 200);
    const isGCD = random.chance(1/2);
    const result = isGCD ? gcd(a, b) : lcm(a, b);
    const posResults = [a, b, 1, a*b, gcd(a, b), lcm(a, b), 2 * result, Math.round(result / 2), 3 * result, Math.round(result / 3)];
    for (let i = 0; i < 2; i++) {
        posResults.push(primeFactors(a).filter(a => random.chance(1/2)).reduce((a, b) => a * b, 1));
        posResults.push(primeFactors(b).filter(a => random.chance(1/2)).reduce((a, b) => a * b, 1));
    }
    removeDeepDuplicates(posResults.sort((a, b) => a - b));


    return createExercise(random, {
        question: `Calculate: \\[\\textrm{${isGCD ? "gcd" : "lcm"}}(${a}, ${b})\\]`,
        answerType: 'radio',
        answers: [
            ...posResults.map(r => ({
                caption: `\\(${r}\\)`,
                tip: (isGCD ? `The greatest common divisor of two positive numbers is the largest number such that it divides both numbers. We can calculate the GCD by looking at the prime factorization or using the extended euclidean algorithm.`
                            : `The least common multiple of two positive numbers is the smallest number such that it is divided by both numbers. We can calculate the LCM by looking at the prime factorization or using the extended euclidean algorithm.`
                            ) + `
                                \\[
                                    \\begin{gathered}
                                        ${a} = ${primeFactors(a).join(` \\cdot `)} \\\\
                                        ${b} = ${primeFactors(b).join(` \\cdot `)} \\\\
                                        \\textrm{gcd}(${a}, ${b}) = ${primeFactors(gcd(a, b)).join(` \\cdot `) || "1"} \\\\
                                        \\begin{aligned}
                                            \\textrm{lcm}(${a}, ${b}) &= ${primeFactors(lcm(a, b)).join(` \\cdot `) || "1"} \\\\
                                                                      &= ${a} \\cdot ${b} / ${gcd(a, b)}
                                        \\end{aligned}
                                    \\end{gathered}
                                \\]
                                \\[
                                    ${extendedEuclidTable(a, b)}
                                \\]
                                `,
                correct: result === r,
                appearChance: result === r ? 1 : 6 / posResults.length,
                score: result === r,
            }))
        ]
    });
};