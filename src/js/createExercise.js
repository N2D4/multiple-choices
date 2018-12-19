export default function createExercise(random, exercise) {
    let newAnswers = [];
    let lastAnswers = [];
    for (let i = 0; i < exercise.answers.length; i++) {
        const answer = exercise.answers[i];
        if (typeof answer !== 'string') {
            if (!random.chance(answer.appearChance === undefined ? 1 : answer.appearChance)) continue;
            newAnswers = [...newAnswers, ...lastAnswers, answer];
            lastAnswers = [];
        } else {
            if (answer === '---') lastAnswers = [];
            if (newAnswers.length > 0 || answer !== '---') lastAnswers.push(answer);
        }
    }

    exercise.answers = newAnswers;
    return exercise;
}


export function createProofExercise(random, proof) {
    return createExercise(random, {
        question: proof.question,
        method: proof.method,
        weight: proof.weight,
        answerType: 'radio',
        answers: proof.proof.map(parray => typeof parray === 'string' ? parray
                                         : random.shuffle(parray.map((p, i) => ({
                                                                    caption: p,
                                                                    correct: i === 0,
                                                                    score: i === 0 ? 1 : 0,
                                                                }))))
                            .reduce((a, p) => [...a, '---', ...p], [])
    });
}