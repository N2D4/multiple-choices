import createExercise from '../../../createExercise.js';
import { range, removeDeepDuplicates } from '../../../utils.js';
import { gcd, lcm, eulerPhi, multiplicativeOrder, modularPow, modularInverse, primeFactors, extendedEuclidTable, extendedEuclid } from '../NumberTheory.js';

export default (random) => {
    return createExercise(random, {
        question: `
                    Find the value of \\(x\\).<br>
                    Note: All of these can be solved without a calculator, without brute forcing the given choices.
                  `,
        answerType: 'radio',
        answers: [...range(3)].map(a => {
            switch (random.nextInt(3)) {
                case 0: {                                   // GCD/LCD
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
                    return [
                        `\\[x = \\textrm{${isGCD ? "gcd" : "lcm"}}(${a}, ${b})\\]`,
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
                                                    \\textrm{lcm}(${a}, ${b}) = ${primeFactors(lcm(a, b)).join(` \\cdot `) || "1"}
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
                    ];
                }
                case 1: {                           // Remainders
                    let m = random.nextInt(3, 18);
                    while (!random.chance(1/primeFactors(m).length)) m--;
                    let a = random.nextInt(m, 300);
                    let b = random.nextInt(2, 1000);
                    if (random.chance(5/6)) while (gcd(a, m) !== 1) a = random.nextInt(m, 300);
                    else a = random.nextInt(1, 300 / m) * m;
                    const result = modularPow(a, b, m);
                    const posResults = [...range(m)];
                    removeDeepDuplicates(posResults.sort((a, b) => a - b));
                    const phim = eulerPhi(m);
                    const multord = multiplicativeOrder(a % m, m);
                    function ezCalc(a, b, m) {
                        let k = 1;
                        const result = [];
                        while (b > 3) {
                            if (b % 2 === 0) {
                                b /= 2;
                                result.push(`R_{${m}}(${k} \\cdot (${a}^2)^{${b}})`);
                                a = (a*a) % m;
                            } else {
                                result.push(`R_{${m}}((${k} \\cdot ${a}) \\cdot ${a}^{${b - 1}})`);
                                k = (k*a) % m;
                                b -= 1;
                            }
                            result.push(`R_{${m}}(${k} \\cdot ${a}^{${b}})`);
                        }
                        result.push(`R_{${m}}(${(k * Math.pow(a, b))})`);
                        result.push(`${(k * Math.pow(a, b)) % m}`);
                        return result.join(` \\\\ &= `);
                    }
                    return [
                        `\\[x = R_{${m}}(${a}^{${b}})\\]`,
                        ...posResults.map(r => ({
                            caption: `\\(${r}\\)`,
                            tip: `
                                    We can use Lemma 4.18 to find a solution efficiently.
                                    \\[
                                        \\begin{aligned}
                                            R_{${m}}(${a}^{${b}})
                                            &= R_{${m}}(R_{${m}}(${a})^{${b}}) \\\\
                                            &= R_{${m}}(${a % m}^{${b}})
                                            ${a % m <= 1 ? ` \\\\ &= R_{${m}}(${a % m}) \\\\ &= ${a % m}` : ``}
                                        \\end{aligned}
                                    \\]
                                 ` + (a % m <= 1 ? `` : `
                                    Since \\(\\varphi(${m}) = ${phim}\\) and therefore \\(${a % m}^{${phim}} \\equiv_{${m}} 1\\):
                                    \\[
                                        \\begin{aligned}
                                            R_{${m}}(${a % m}^{${b}})
                                            &= R_{${m}}(${a % m}^{${b - b % phim}} \\cdot ${a % m}^{${b % phim}}) \\\\
                                            &= R_{${m}}((${a % m}^{${phim}})^{${Math.floor(b / phim)}} \\cdot ${a % m}^{${b % phim}}) \\\\
                                            &= R_{${m}}(1^{${Math.floor(b / phim)}} \\cdot ${a % m}^{${b % phim}}) \\\\
                                            &= R_{${m}}(1 \\cdot ${a % m}^{${b % phim}}) \\\\
                                            &= ${ezCalc(a % m, b % phim, m)}
                                        \\end{aligned}
                                    \\]
                                    ${multord < phim ? `Note: Knowing that \\( ${a % m}^{${multord}} \\equiv_{${m}} 1\\) (we notice that \\(${multord}\\) is the multiplicative order of \\(b\\)), we can find a solution even faster.` : ``}
                                 `),
                            correct: result === r,
                            appearChance: result === r ? 1 : 6 / posResults.length,
                            score: result === r,
                        }))
                    ];
                }
                case 2: {                                   // Modular inverse
                    const a1 = random.nextInt(2, 100);
                    const b1 = random.nextInt(2, 100);
                    const a = random.chance(4/5) ? a1 / gcd(a1, b1) : a1;
                    const m = random.chance(4/5) ? b1 / gcd(a, b1) : b1;

                    const [, u, v,] = extendedEuclid(a, m);
                    const result = gcd(a, m) === 1 ? modularInverse(a, m) : undefined;
                    const posResults = [...[...range(20)].map(_ => random.nextInt(0, m))];
                    if (result !== undefined) posResults.push(result);
                    removeDeepDuplicates(posResults.sort((a, b) => a - b));
                    return [
                        `\\[
                            \\begin{gathered}
                                ${a} \\cdot x \\equiv_{${m}} 1, \\\\
                                0 \\leq x < ${m}
                            \\end{gathered}
                        \\]`,
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
                    ];
                }
            }
        }).reduce((a, b) => [...a, '---', ...b], []),
    });
};