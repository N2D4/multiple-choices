import createExercise from '../../../createExercise.js';
import { charRange, removeDeepDuplicates } from '../../../utils.js';
import { Formula } from '../logic/PropositionalLogic.js';
import { gcd, primeFactors, modularInverse } from '../NumberTheory.js';

export default (random) => {

    const equationCount = random.nextInt(2, 5);
    const modulos = [];
    modulos.sort((a, b) => a - b);
    while (modulos.length < equationCount) {
        let m = random.nextInt(3, 12);
        while (modulos.some(a => gcd(m, a) !== 1)) m--;
        if (m > 1) modulos.push(m);
    }

    const M = modulos.reduce((a, b) => a * b);
    const x = random.nextInt(0, M);
    const posX = [x];
    for (let ind = 0; ind < modulos.length; ind++) {
        for (let i = 0; i < modulos[ind]; i++) {
            const nx = (x + i * M / modulos[ind]) % M;
            posX.push(nx);
        }
    }
    removeDeepDuplicates(posX.sort((a, b) => a - b));

    return createExercise(random, {
        question: `
                    Solve the following system of equations for \\(x\\).
                    \\[
                        \\begin{gathered}
                            \\begin{aligned}
                                ${modulos.map(a => `x &\\equiv_{${a}} ${x % a}`).join(` \\\\ `)}
                            \\end{aligned} \\\\
                            0 \\leq x < ${M}
                        \\end{gathered}
                    \\]
                  `,
        answerType: 'radio',
        answers: [
            ...posX.map(r => ({
                caption: `\\(${r}\\)`,
                tip: r !== x ? `` : `
                                        To solve for \\(x\\), we first need to find \\(M_i\\) for all \\(i\\).
                                        \\[
                                            \\begin{aligned}
                                                ${modulos.map((a, i) => `M_{${i}} &= ${M} / ${a} = ${M / a}`).join(` \\\\ `)}
                                            \\end{aligned}
                                        \\]
                                        Using the Euclidean algorithm, we now compute the modular inverse \\(N_i\\) of \\(M_i\\) modulo \\(m_i\\) for each of these equations.
                                        \\[
                                            \\begin{aligned}
                                                ${modulos.map((a, i) => `${M / a} \\cdot N_{${i}} &\\equiv_{${a}} 1 &\\Rightarrow N_{${i}} = ${modularInverse(M / a, a)}`).join(` \\\\ `)}
                                            \\end{aligned}
                                        \\]
                                        We note that \\(M_iN_i \\equiv_{m_k} 0\\) if \\(i \\neq k\\) (and \\(1\\) if \\(i = k\\)). This is because \\(M_i\\) divides every \\(m_k\\) but \\(m_i\\).<br>
                                        We can use this fact to construct a number \\(x\\) which fulfills all equations:
                                        \\[
                                            \\begin{aligned}
                                                x &\\equiv_{${M}} ${modulos.map((a, i) => `${x % a} \\cdot M_{${i}} N_{${i}}`).join(` + `)} \\\\
                                                &\\equiv_{${M}} ${modulos.map(a => `${x % a} \\cdot ${M / a} \\cdot ${modularInverse(M / a, a)}`).join(` + `)} \\\\
                                                &\\equiv_{${M}} ${modulos.map(a => `${(x % a) * (M / a)} \\cdot ${modularInverse(M / a, a)}`).join(` + `)} \\\\
                                                &\\equiv_{${M}} ${modulos.map(a => `${((x % a) * (M / a)) % M} \\cdot ${modularInverse(M / a, a)}`).join(` + `)} \\\\
                                                &\\equiv_{${M}} ${modulos.map(a => `${((x % a) * (M / a)) % M * modularInverse(M / a, a)}`).join(` + `)} \\\\
                                                &\\equiv_{${M}} ${modulos.map(a => `${(((x % a) * (M / a)) % M * modularInverse(M / a, a)) % M}`).join(` + `)} \\\\
                                                &\\equiv_{${M}} ${modulos.map(a => (((x % a) * (M / a)) % M * modularInverse(M / a, a)) % M).reduce((a, b) => a + b) % M}
                                            \\end{aligned}
                                        \\]
                                        We have therefore constructed one solution. By Theorem 4.20 and given the fact that all modulos are pairwise relatively prime, we know that the solution is unique.
                                    `,
                correct: r === x,
                appearChance: r === x ? 1 : 5 / (posX.length - 1),
                score: r === x ? 1 : 0,
            })),
        ]
    });
};