import createExercise from '../../../createExercise.js';
import { FiniteSet } from '../settheory/Sets.js';
import { customPow, divisors, gcd } from '../NumberTheory.js';
import { createArray, range, removeDeepDuplicates, deepEquals, spreadNumbers as spreadNumbersR, cartesian } from '../../../utils.js';

// This is pretty ugly but I got exams I should prepare for
export default (random) => {
    let G = [];
    let op = (a, b) => undefined;
    let e = undefined;
    let setRender = undefined;
    let operationRender = undefined;
    let toString = a => "" + a;
    let setBrackets = a => a;
    const stts = a => setBrackets(toString(a));
    let plausibleElements = [];
    const ord = a => divisors(G.length).find(b => customPow(a, b, op, e) === e);
    const inv = a => customPow(a, G.length - 1, op, e);
    switch (random.nextInt(4)) {
        case 0: {
            const modulo = random.nextInt(3, 16);
            setRender = `\\mathbb{Z}_{${modulo}}`;
            operationRender = ` \\oplus `;
            G = range(modulo);
            op = (a, b) => (a + b) % modulo;
            e = 0;
            break;
        }
        case 1: {
            const modulo = random.nextInt(3, 16);
            setRender = `\\mathbb{Z}_{${modulo}}^*`;
            operationRender = ` \\otimes `;
            plausibleElements = range(modulo);
            G = plausibleElements.filter(b => gcd(modulo, b) === 1);
            op = (a, b) => (a * b) % modulo;
            e = 1;
            break;
        }
        case 2: case 3: {
            const gf = random.nextInt(2, 5);
            const polydeg = gf <= 2 ? random.nextInt(2, 4) : random.binomialInt(1, 1.7, 3);
            const polymod = [1, ...range(polydeg).map(i => random.nextInt(0, gf))];
            const varname = random.nextElement(["x", "y", "z"]);
            const addr = (a, b) => range(polymod.length).map(i => (a[i] + b[i]) % gf);
            const isMultiplicative = random.chance(1/2);
            const opr = !isMultiplicative ? addr : (a, b) => {
                let sum = range(polymod.length).map(a => 0);
                for (let i = 0; i < b.length; i++) {
                    let cm = a.map(a => (a * b[polymod.length - i - 1]) % gf);
                    for (let j = 0; j < i; j++) {
                        while (cm[0] !== 0) {
                            cm = addr(cm, polymod);
                        }
                        cm.shift();
                        cm.push(0);
                    }
                    sum = addr(sum, cm);
                }
                return sum;
            };
            operationRender = isMultiplicative ? ` \\cdot ` : ` + `;
            setBrackets = a => `(${a})`;
            toString = a => [...a].reverse()
                                  .map((a, i) => a === 0 ? undefined
                                              : (a === 1 && i !== 0 ? `` : a) + (i === 0 ? ``
                                                                               : i === 1 ? `${varname}`
                                                                               : `${varname}^{${i}}`))
                                  .filter(a => a !== undefined)
                                  .reverse()
                                 .join(` + `) || `0`;
            setRender = `\\textrm{GF}(${gf})[${varname}]_{${toString(polymod)}}${isMultiplicative ? `^*` : ``}`;
            G = plausibleElements = cartesian([0], ...range(polymod.length - 1).map(a => range(gf)));
            e = G.find(a => a.every((a, i, arr) => isMultiplicative && i === arr.length - 1 ? a === 1 : a === 0));
            op = (a, b) => {
                let ad = opr(a, b);
                while (ad[0] !== 0) {
                    ad = addr(ad, polymod);
                }
                return G.find(a => deepEquals(ad, a));
            };
            G = G.filter(a => plausibleElements.some(b => op(a, b) === e));
            if (plausibleElements.length <= G.length) plausibleElements = [];
            break;
        }
    }

    const gens = G.filter(a => ord(a) === G.length);
    const elePos = random.shuffle([...random.nextElements(G, 5), ...random.nextElements(plausibleElements, 5)]);
    removeDeepDuplicates(elePos);

    function ezCalc(a, b) {
        let k = e;
        const result = [];
        while (b > 3 && a !== e) {
            if (b % 2 === 0) {
                b /= 2;
                result.push(`${k !== e ? `${stts(k)} ${operationRender}` : ``} (${stts(a)}^2)^{${b}}`);
                a = op(a, a);
            } else {
                result.push(`${k !== e ? `${stts(k)} ${operationRender}` : ``} ${stts(a)} ${operationRender} ${stts(a)}^{${b - 1}}`);
                k = op(k, a);
                b -= 1;
            }
            result.push(`${k !== e ? `${stts(k)} ${operationRender}` : ``} ${stts(a)}^{${b}}`);
        }
        if (a !== e) result.push(`${k !== e ? `${stts(k)} ${operationRender}` : ``} ${range(b).map(i => stts(a)).join(` ${operationRender} `)}`);
        result.push(`${toString(op(k, customPow(a, b, op, e)))}`);
        return result.join(` \\\\ &= `);
    }




    const graphNodes = gens.length <= 0 ? undefined : [];
    const graphEdges = [];
    const cgen = gens[0];
    if (gens.length > 0) {
        let lcur = e;
        for (let i = 0; i < G.length; i++) {
            const x = angle => 50 + 40 * Math.sin(angle);
            const y = angle => 50 - 40 * Math.cos(angle);
            const angle = i * 2 * Math.PI / G.length;
            const newAngle = (i + 1) * 2 * Math.PI / G.length;
            const angle1 = angle + 0.2;
            const angle2 = newAngle - 0.2;
            graphNodes.push(`
                <div style="position: absolute; top: ${y(angle)}%; left: ${x(angle)}%; width: 100%;">
                    <div style="position: absolute; transform: translate(-50%, -50%);">\\(${toString(lcur)}\\)</div>
                </div>
            `);
            const sq = a => a*a;
            const d = 6;
            const p = Math.min(1, d / Math.sqrt(sq(x(newAngle) - x(angle)) + sq(y(newAngle) - y(angle))));
            const x1 = (1 - p) * x(angle) + p * x(newAngle);
            const y1 = (1 - p) * y(angle) + p * y(newAngle);
            const x2 = p * x(angle) + (1 - p) * x(newAngle);
            const y2 = p * y(angle) + (1 - p) * y(newAngle);
            graphEdges.push(`<path d="M${x1},${y1} L${x2},${y2}" style="stroke: black; stroke-width: 0.5; marker-end: url(#triangle);" />`);
            lcur = op(lcur, cgen);
        }
    }




    return createExercise(random, {
        question: `
                    Consider the following group:
                    \\[
                        G = \\langle ${setRender}, ${operationRender} \\rangle
                    \\]
                    Which of the following statements apply?
                  `,
        method: `
                    \\[
                        \\begin{gathered}
                            ${setRender} = \\{${G.map(a => toString(a)).join(` , `)}\\} \\\\
                            e = ${toString(e)} \\\\
                            \\textrm{generators}(G) = \\{${gens.map(a => toString(a)).join(` , `)}\\}
                        \\end{gathered}
                    \\]
                    ${graphNodes !== undefined ? `
                        Graph for generator \\(${toString(cgen)}\\):
                        <div style="width: 300px; height: 300px; margin-left: auto; margin-right: auto; position: relative;">
                            <svg width="100%" height="100%" viewBox="0 0 100 100">
                                <defs>
                                    <marker id="triangle" viewBox="0 0 10 10" refX="7" refY="5" markerUnits="strokeWidth" markerWidth="5" markerHeight="5" orient="auto">
                                        <path d="M0,0 L10,5 L0,10 z" style="fill:black;" />
                                    </marker>
                                </defs>
                                ${graphEdges.join(` `)}
                            </svg>
                            ${graphNodes.join(` `)}
                        </div>
                    ` : ``}
                `,
        answerType: 'checkbox',
        answers: [
            ...elePos.map(a => ({
                caption: `\\(${toString(a)} \\in ${setRender}\\)`,
                tip: ``,
                correct: G.some(b => b === a),
                appearChance: plausibleElements.length <= 0 ? 0 : 3 / elePos.length,
                score: 1,
            })),
            '---',
            ...G.map(a => {
                const orda = ord(a);
                const l = random.chance(1/2) ? orda : (random.chance(1/3) ? random.nextInt(1, G.length + 1) : random.nextElement(divisors(G.length)));
                return {
                    caption: l === G.length && random.chance(1/2) ? `\\(${toString(a)}\\) is a generator`
                                                                  : `\\(\\textrm{ord}(${toString(a)}) = ${l}\\)`,
                    tip: `
                            An element's order is equal to the smallest \\(m \\geq 1\\) such that \\(a^m = e\\). In a finite group, any element's order always divides the order of the entire group. Therefore, testing \\(a^m \\stackrel{?}{=} e \\) for all divisors of \\(|G|\\) is sufficient. If the order of an element is \\(|G|\\), then we call that element a generator of \\(G\\).
                         `,
                    correct: l === orda,
                    appearChance: 3 / G.length,
                    score: 1,
                }
            }),
            '---',
            ...G.map(a => {
                const l = random.chance(1/2) ? inv(a) : random.nextElement(G);
                return {
                    caption: `\\(${setBrackets(toString(a))}^{-1} = ${toString(l)}\\)`,
                    tip: `
                            An element's inverse is the (unique) element \\(a^{-1} = a^{\\textrm{ord}(a) - 1}\\) such that \\(a ${operationRender} a^{-1} = e\\).
                         `,
                    correct: l === inv(a),
                    appearChance: 2 / G.length,
                    score: 1,
                }
            }),
            ...range(2, G.length).map(x => {
                const a = random.nextElement(G);
                const cpow = customPow(a, x, op, e);
                const l = random.chance(1/2) ? cpow : random.nextElement(G);
                return {
                    caption: `\\(${setBrackets(toString(a))}^{${x}} = ${toString(l)}\\)`,
                    tip: `
                            \\[
                                \\begin{aligned}
                                    ${setBrackets(toString(a))}^{${x}} &= ${ezCalc(a, x)}
                                \\end{aligned}
                            \\]
                         `,
                    correct: l === cpow,
                    appearChance: 2 / (G.length - 2),
                    score: 1,
                }
            }),
        ],
    });
};
