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
        lastAnswer = answer;
    }

    exercise.answers = newAnswers;
    return exercise;
}
