import SomeClass from './js/SomeClass.js';

SomeClass.say("hi");


let question = document.getElementById("question");
question.innerText = "Some math: \\(x\\), \\[x = 69\\]";
MathJax.Hub.Typeset(question);
