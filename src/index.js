import Random from './js/Random.js';
import QuestionSet, {SetName, SetIdentifier} from './js/sets/DiscreteMathematics.js';
import runTests from './js/runTests.js';

window.runTests = runTests;

// Game constants
const numberOfQuestionsInScore = 15;
const currentSet = QuestionSet;
const dataPrefix = "multiplechoices_v1___" + SetIdentifier + "___";


// Initialize local storage
const allDataKinds = new Set();
const storageFallback = new Map();
const data_init_state = "init_state";
const data_state = "state";
const data_scores = "scores";
const data_total_answered = "total_answered";
const data_darkmode = "darkmode";
setStoredItemIfNotPresent(data_init_state, (Math.random() * 4294967296) >>> 0);
setStoredItemIfNotPresent(data_state, getStoredItem(data_init_state));
setStoredItemIfNotPresent(data_scores, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
setStoredItemIfNotPresent(data_total_answered, {});
setStoredItemIfNotPresent("darkmode", matchMedia("(prefers-color-scheme: dark)").matches);

// Initialize Random instance
const random = new Random(getStoredItem(data_state));


main();
async function main() {
    setContent(document.getElementsByTagName("title")[0], SetName + " - Multiple Choices");

    const progresstransform = getElement("progresstransform");
    progresstransform.innerHTML = "";
    updateProgressBar();

    updateDarkMode();
    getElement("progressbar").addEventListener('click', toggleDarkMode);

    document.addEventListener("keypress", function(event) {
        if (event.keyCode === 13) {
          getElement("done").click();
          event.preventDefault();
        }
      });

    const curSetEntries = currentSet;
    while (true) {
        const nextExerciseR = random.nextElementWeighted(curSetEntries, a => a.weight);
        const nextExercise = Object.entries(nextExerciseR).find(a => a[0] !== 'weight');
        const nE = nextExercise[1](random);
        if (nE.answers.length > 0) await showExercise(nextExercise[0], nE);
    }
}



function toggleDarkMode() {
    setStoredItem(data_darkmode, !getStoredItem(data_darkmode));
    updateDarkMode();
}

function updateDarkMode() {
    const html = getElement("html");
    if (getStoredItem("darkmode")) {
        console.log("ewwwww, darkmode");
        html.classList.add("darkmode");
    } else {
        html.classList.remove("darkmode");
    }
}



async function showExercise(exerciseid, exercise) {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    });

    setContent("question", exercise.question);
    setContent("method", ``);

    // Display answers
    let separatorCount = 0;
    removeCheckboxElements();
    for (const answer of exercise.answers) {
        const answerType = answer.answerType || exercise.answerType;
        const isRadio = answerType === 'radio';
        if (answer === '---') {
            createSeparator();
            separatorCount++;
        } else if (typeof answer === 'string') {
            createTextAdditional(answer);
        } else {
            createCheckboxElement(answer.caption, answer.tip || "", isRadio, separatorCount);
        }
    }

    await ask();

    setContent("method", exercise.method || ``);

    // Evaluate answers
    let score = 0;
    let possibleScore = 0;
    const anseles = getElement("answers").children;
    for (let i = 0; i < exercise.answers.length; i++) {
        const answer = exercise.answers[i];
        const ele = anseles[i];
        if (typeof answer === 'string') {
            // Nothing
        } else {
            const isCorrect = ele.children[0].children[0].checked === !!answer.correct;
            ele.classList.add(isCorrect ? "correct" : "incorrect");
            if ((answer.answerType || exercise.answerType) === 'radio') {
                if (!answer.correct && !ele.children[0].children[0].checked) ele.classList.add("silent");
                if (!answer.correct) ele.classList.add("noexplain");
            }
            if (answer.score) {
                possibleScore += answer.score;
                score += isCorrect ? answer.score : -answer.score;
            }
            ele.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
            });
        }
    }

    score = Math.max(score, 0);

    // Register the score
    registerScore(exerciseid, score / possibleScore * 100);

    await waitForNext();
}




function registerScore(exerciseid, percentile) {
    percentile = Math.round(percentile);
    if (percentile <= 20) percentile = 0;

    // Store data
    setStoredItem(data_state, random.getState());

    const scores = getStoredItem(data_scores);
    while (scores.length < numberOfQuestionsInScore - 1) scores.unshift(0);
    while (scores.length > numberOfQuestionsInScore - 1) scores.shift();
    scores.push(percentile);
    setStoredItem(data_scores, scores);

    const totalAnswered = getStoredItem(data_total_answered);
    const tolan = [...(totalAnswered[exerciseid] || [0, 0])];
    tolan[0] = tolan[0] + 100;
    tolan[1] = tolan[1] + percentile;
    totalAnswered[exerciseid] = tolan;
    setStoredItem(data_total_answered, totalAnswered);

    try {
        const req = new XMLHttpRequest();
        req.open('POST', 'submitscore.php');
        req.setRequestHeader('Content-type', 'application/json');
        req.onreadystatechange = () => {
            if (req.readyState == 4 && req.status == 200) {
                if (req.responseText === "") return;
                if (req.responseText.startsWith("<?php")) return;     // in case our web server doesn't support PHP
                if (req.responseText.startsWith("/*v1*/")) return;    // in case the response is an update script
                createElement("head", 'script', req.responseText);
            }
        }
        req.send(JSON.stringify(getAllStoredItems()));
    } catch (e) {
        // no internet connection, but that's fine
    }

    // Update progress bar
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




function getAllStoredItems() {
    const result = {};
    for (const name of allDataKinds) {
        result[name] = getStoredItem(name);
    }
    return result;
}

function getStoredItem(name) {
    allDataKinds.add(name);
    let g = null;
    try {
        g = localStorage.getItem(dataPrefix + name);
    } catch (e) {}
    if (g === null) return storageFallback.get(name);
    return JSON.parse(g);
}

function setStoredItem(name, value) {
    allDataKinds.add(name);
    try {
        localStorage.setItem(dataPrefix + name, JSON.stringify(value));
    } catch (e) {}
    storageFallback.set(name, value);
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

function createTextAdditional(content) {
    const text = createElement("answers", 'div', content);
    text.classList.add("additional");
    return text;
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
    renderMathInElement(element);
}


