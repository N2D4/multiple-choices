import createExercise from '../../../createExercise.js';
import { range, removeDeepDuplicates } from '../../../utils.js';
import { gcd, lcm, eulerPhi, multiplicativeOrder, modularPow, modularInverse, primeFactors, extendedEuclidTable, extendedEuclid } from '../NumberTheory.js';

export default (random) => {
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


    return createExercise(random, {
        question: `Calculate: \\[R_{${m}}(${a}^{${b}})\\]`,
        answerType: 'radio',
        answers: [
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
                        ${multord < phim ? `Note: Knowing that \\( ${a % m}^{${multord}} \\equiv_{${m}} 1\\) (we notice that \\(${multord}\\) is the multiplicative order of \\(${a}\\) modulo \\(${m}\\)), we can find a solution even faster.` : ``}
                     `),
                correct: result === r,
                appearChance: result === r ? 1 : 6 / posResults.length,
                score: result === r,
            }))
        ]
    });
};