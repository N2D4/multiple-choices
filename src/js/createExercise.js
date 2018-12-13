export default function createExercise(random, exercise) {
    const newAnswers = [];
    let lastAnswer = undefined;
    for (let i = 0; i < exercise.answers.length; i++) {
        const answer = exercise.answers[i];
        if (answer !== '---') {
            if (!random.chance(answer.appearChance === undefined ? 1 : answer.appearChance)) continue;
            if (lastAnswer === '---') newAnswers.push(lastAnswer);
            newAnswers.push(answer);
        }
        lastAnswer = lastAnswer === undefined && answer === '---' ? undefined : answer;
    }

    exercise.answers = newAnswers;
    return exercise;
}


export function createProofExercise(random, proof) {
    return createExercise(random, {
        question: proof.question,
        method: proof.method,
        answerType: 'radio',
        answers: proof.proof.map(parray => random.shuffle(parray.map((p, i) => ({
                                                                    caption: p,
                                                                    correct: i === 0,
                                                                    score: i === 0 ? 1 : 0,
                                                                }))))
                            .reduce((a, p) => [...a, '---', ...p], [])
    });
}