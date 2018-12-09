import createExercise from '../../../createExercise.js';
import { FiniteSet } from '../settheory/Sets.js';
import { createArray, range, removeDeepDuplicates, deepEquals, spreadNumbers as spreadNumbersR } from '../../../utils.js';


export default (random) => {

    let S = new FiniteSet(random, [...range(4)]);
    if (random.chance(1/3)) S = S.simplify();
    const Ssize = S.size();

    let T = new FiniteSet(random, [...range(4)]).union(S.anySubSet(random, random.nextInt(Ssize))).simplify();
    const Tsize = T.size();

    const powerSet = S.powerSet();
    const union = S.union(T);
    const intersect = S.intersect(T);
    const cross = S.crossProduct(T);

    const setSelec = [...S.simplify().elements];
    for (let i = 0; i < Ssize; i++) {
        setSelec.push(S.nthSubSet(random.nextInt(0, powerSet.size())));
    }
    removeDeepDuplicates(setSelec);
    random.shuffle(setSelec);

    const powerSetSelec = [...setSelec];
    for (let i = 0; i < Ssize; i++) {
        powerSetSelec.push(powerSet.anySubSet(random, 4));
    }
    removeDeepDuplicates(powerSetSelec);
    random.shuffle(powerSetSelec);


    const spreadNumbers = (...nums) => spreadNumbersR(random, ...nums);

    console.log("ok");
    return createExercise(random, {
        question: `
                    Consider the following sets:
                    \\[
                        S = ${S} \\\\
                        T = ${T}
                    \\]
                    Which of the following statements apply?<br>
                    <i style="font-size: 80%;">Note: Here, we define numbers as atomic elements, and not as sets like in chapter 3.1.7.</i>
                  `,
        method: `
                    \\[
                        S \\cup T = ${union} \\\\
                        S \\cap T = ${intersect}
                    \\]
                `,
        answerType: 'checkbox',
        answers: [
            ...spreadNumbers(S.size, S.atomicCount(false), S.atomicCount(true)).filter(n => n > 0).map((n, _, arr) => ({
                caption: `\\(|S| = ${n}\\)`,
                tip: `The cardinality of a set is the number of elements it contains, not counting duplicates. If one of the elements is another set, which then again contains elements, this does not matter; the entire inner set counts only as one element.`,
                correct: Ssize === n,
                answerType: 'radio',
                appearChance: Ssize === n ? 1 : 3/(arr.length - 1),
                score: Ssize === n ? 2 : 0,
            })),
            '---',
            ...setSelec.map((a, _, arr) => ({
                caption: `\\(${a} \\in S\\)`,
                tip: `An object is an element of a set if and only if it is contained in that set. If the object itself is a set, that means it is an element if and only if there's a set in the original set that contains the exact same elements as the object.`,
                correct: S.contains(a),
                appearChance: 1.5/arr.length,
                score: 1,
            })),
            ...setSelec.map((a, _, arr) => ({
                caption: `\\(${a} \\subseteq S\\)`,
                tip: `An object is a subset of a set if and only if it is a set itself, and each of its elements is also in the original set. This means the cardinality of the superset is always larger, and that the subset is an element of the superset's power set.`,
                correct: S.isSuperSetOf(a),
                appearChance: 1.5/arr.length,
                score: 1,
            })),
            '---',
            ...powerSetSelec.map((a, _, arr) => ({
                caption: `\\(${a} \\in \\mathcal{P}(S)\\)`,
                tip: `An object is an element of a set's power set if and only if it is a subset of the original set.`,
                correct: powerSet.contains(a),
                appearChance: 1/arr.length,
                score: 1,
            })),
            ...powerSetSelec.map((a, _, arr) => ({
                caption: `\\(${a} \\subseteq \\mathcal{P}(S)\\)`,
                tip: `An object is a subset of a set's power set if and only if it is a set and it consists only of subsets of the original set.`,
                correct: powerSet.isSuperSetOf(a),
                appearChance: 1/arr.length,
                score: 1,
            })),
            '---',
            ...spreadNumbers(union.size(), Ssize + Tsize).filter(n => n > 0).map((n, _, arr) => ({
                caption: `\\(|S \\cup T| = ${n}\\)`,
                tip: `The cardinality of a set is the number of elements it contains, not counting duplicates. If one of the elements is another set, which then again contains elements, this does not matter; the entire inner set counts only as one element.`,
                correct: union.size() === n,
                appearChance: 1/arr.length,
                score: 1,
            })),
            ...spreadNumbers(intersect.size(), Ssize + Tsize).filter(n => n > 0).map((n, _, arr) => ({
                caption: `\\(|S \\cap T| = ${n}\\)`,
                tip: `The cardinality of a set is the number of elements it contains, not counting duplicates. If one of the elements is another set, which then again contains elements, this does not matter; the entire inner set counts only as one element.`,
                correct: intersect.size() === n,
                appearChance: 1/arr.length,
                score: 1,
            })),
            ...spreadNumbers(cross.size(), Ssize + Tsize).filter(n => n > 0).map((n, _, arr) => ({
                caption: `\\(|S \\times T| = ${n}\\)`,
                tip: `The cardinality of a set is the number of elements it contains, not counting duplicates. If one of the elements is another set, which then again contains elements, this does not matter; the entire inner set contacountsins only as one element.`,
                correct: cross.size() === n,
                appearChance: 1/arr.length,
                score: 1,
            })),
            '---',
            ...spreadNumbers(powerSet.size(), Math.pow(Ssize, 2)).filter(n => n > 0).map((n, _, arr) => ({
                caption: `\\(|\\mathcal{P}(S)| = ${n}\\)`,
                tip: `The cardinality of a set's power set is always exactly two to the power of the set's cardinality. This number is equal to the number of subsets the set has.`,
                correct: powerSet.size() === n,
                appearChance: 1/arr.length,
                score: 1,
            })),
            ...[Math.pow(2, powerSet.size()), Math.pow(4, Ssize), Math.pow(Ssize, 4)].map((n, _, arr) => ({
                caption: `\\(|\\mathcal{P}(\\mathcal{P}(S))| = ${n}\\)`,
                tip: `The cardinality of a set's power set is always exactly two to the power of the set's cardinality. Therefore, the power set of the power set of a set is equal to two to the power of two to the power of the set's cardinality (note that the power operation is right-associative).`,
                correct: Math.pow(2, powerSet.size()) === n,
                appearChance: 0.5/arr.length,
                score: 1,
            })),
            '---',
        ],
    });
};
