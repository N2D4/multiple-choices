import createExercise from '../../../createExercise.js';


export default (random) => {

    


    return createExercise(random, {
        question: `Sample question \\[5 = 2 + 3\\]`,
        method: `\\[2 + 3 = 3 + 2 = 4 + 1 = 5 + 0 = 5\\]`,
        answerType: 'radio',
        answers: [
            {
                caption: `Yes`,
                tip: `you bad if you didn't know this`,
                correct: true,
                score: 10,
            },
            {
                caption: `No`,
                tip: `you even worse if you didn't know this`,
            },
            '---',
            {
                caption: `Maybe`,
                tip: `why would you even select this one`,
                answerType: 'checkbox',
                appearChance: 1/3,
                score: 5,
            },
        ],
    });
};