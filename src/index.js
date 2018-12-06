import Random from './js/Random.js';

// Game constants
const numberOfQuestionsInScore = 20;


// Initialize local storage
const data_state = "multiplechoices_dmv1_state";
const data_scores = "multiplechoices_dmv1_scores";
const data_total_answered = "multiplechoices_dmv1_total_answered";
setStoredItemIfNotPresent(data_state, (Math.random() * 4294967296) >>> 0);
setStoredItemIfNotPresent(data_scores, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
setStoredItemIfNotPresent(data_total_answered, {});

// Initialize Random instance
const random = new Random(localStorage.getItem(data_state));

// Sample exercise
const exercise = {
    question: `Is the following equation true? \\[5 = 2 + 3\\]`,
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
            score: 5
        },
    ],
};



main();
async function main() {
    const progresstransform = getElement("progresstransform");
    progresstransform.innerHTML = "";

    updateProgressBar();

    while (true) {
        await showExercise('sample', exercise);
    }
}




async function showExercise(exerciseid, exercise) {
    setContent("question", exercise.question);
    const isRadio = exercise.answerType === 'radio';

    // Display answers
    let separatorCount = 0;
    removeCheckboxElements();
    for (const answer of exercise.answers) {
        if (answer === '---') {
            createSeparator();
            separatorCount++;
        } else {
            createCheckboxElement(answer.caption, answer.tip, isRadio, separatorCount);
        }
    }


    await ask();


    // Evaluate answers
    let score = 0;
    let possibleScore = 0;
    const anseles = getElement("answers").children;
    for (let i = 0; i < exercise.answers.length; i++) {
        const answer = exercise.answers[i];
        const ele = anseles[i];
        if (answer === '---') {
            // Nothing
        } else {
            const isCorrect = ele.children[0].children[0].checked === !!answer.correct;
            ele.classList.add(isCorrect ? "correct" : "incorrect");
            if (answer.score) {
                possibleScore += answer.score;
                if (isCorrect) score += answer.score;
            }
            ele.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
            });
        }
    }

    // Register the score
    registerScore(exerciseid, score / possibleScore * 100);


    await waitForNext();
}




function registerScore(exerciseid, percentile) {
    percentile = Math.round(percentile);


    // Store data
    setStoredItem(data_state, random.getState());

    const scores = getStoredItem(data_scores);
    while (scores.length < numberOfQuestionsInScore - 1) scores.unshift(0);
    while (scores.length > numberOfQuestionsInScore - 1) scores.shift();
    scores.push(percentile);
    setStoredItem(data_scores, scores);

    const totalAnswered = getStoredItem(data_total_answered);
    totalAnswered[exerciseid] = (totalAnswered[exerciseid] || 0) + 1;
    setStoredItem(data_total_answered, totalAnswered);

    const progresstransform = getElement("progresstransform");
    while (progresstransform.children[0].style.width === "") {
        progresstransform.removeChild(progresstransform.children[0]);
    }
    progresstransform.children[0].style.width = "";
    progresstransform.children[0].style['margin-left'] = "";
    progresstransform.children[0].style['margin-right'] = "";

    updateProgressBar();
}

function updateProgressBar() {
    const scores = getStoredItem(data_scores);

    const progresstransform = getElement("progresstransform");

    let children;
    while ((children = nonDeadChildren(progresstransform)).length < scores.length) {
        const percentile = scores[children.length];
        const newel = createElement(progresstransform, 'div', ``);
        newel.style.width = percentile / numberOfQuestionsInScore / 2 + "%";
        if (percentile < 100) {
            const val = (100 - percentile) / numberOfQuestionsInScore / 2 + "%";
            const lastProgressEl = children[children.length - 1];
            if (lastProgressEl === undefined || lastProgressEl.style['margin-right'] || lastProgressEl.style.width === "0%") {
                newel.style['margin-left'] = val;
            } else {
                newel.style['margin-right'] = val;
            }
        }
        newel.classList.add("progressel");
    }

    const percentageText = getElement("progresspercentage");
    const startPercentage = parseInt(percentageText.innerText);
    const targetPercentage = Math.round(scores.reduce((a, b) => a + b) / scores.length);
    const animationTime = 50;
    for (let i = 0; i <= animationTime; i += 5) {
        setTimeout(() => {
            const curPercentage = Math.round(startPercentage + (targetPercentage - startPercentage) * i / animationTime);
            setContent(percentageText, curPercentage + "%");
        }, i);
    }
}

function nonDeadChildren(element) {
    return [...getElement(element).children].filter(a => a.style.width);
}





function getStoredItem(name) {
    const g = localStorage.getItem(name);
    if (g === null) return undefined;
    return JSON.parse(g);
}

function setStoredItem(name, value) {
    localStorage.setItem(name, JSON.stringify(value));
}

function setStoredItemIfNotPresent(name, value) {
    if (getStoredItem(name) === undefined) setStoredItem(name, value);
}




function removeCheckboxElements() {
    getElement("answers").innerHTML = ``;
}

function ask() {
    const done = createElement("answers", 'label', ``);
    done.id = "done";
    const doneli = createElement(done, 'li', `Done`);
    return new Promise(resolve => {
        done.addEventListener('click', () => {
            doneli.innerText = "Next";
            resolve();
        });
    });
}

function waitForNext() {
    const done = getElement("done");
    return new Promise(resolve => done.addEventListener('click', resolve));
}

function createCheckboxElement(caption, hint, isRadio, group) {
    const label = createElement("answers", 'label', ``);
    const li = createElement(label, 'li', ``);
    const input = createElement(li, 'input', ``);
    input.setAttribute('type', isRadio ? 'radio' : 'checkbox');
    input.setAttribute('name', 'answerGroup_' + group);
    const capt = createElement(li, 'a', caption);
    const hinte = createElement(li, 'div', hint);
    hinte.classList.add("explanation");
    return label;
}

function createSeparator() {
    const sep = createElement("answers", 'div', ``);
    sep.classList.add("sep");
    return sep;
}




function getElement(element) {
    if (typeof element === 'string') return document.getElementById(element);
    return element;
}

function createElement(parent = undefined, type, htmlContent) {
    if (htmlContent === undefined) [parent, type, htmlContent] = [htmlContent, parent, type];

    const element = document.createElement(type);
    setContent(element, htmlContent);
    if (parent !== undefined) getElement(parent).appendChild(element);
    return element;
}

function setContent(element, htmlContent) {
    element = getElement(element);
    element.innerHTML = htmlContent;
    MathJax.Hub.Typeset(element);
}


