import Groq from 'groq-sdk';


let pdf = home.getElementByID("uploader");

const groq = new Groq({
  apiKey: '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',
});

async function runModel() {
  try {
    const chatCompletion = await groq.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      messages: [{ role: 'user', content: 'Tell me a joke.' }],
    });
    console.log(chatCompletion.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error);
  }
}

runModel();

function qna(str) {
  let qArray = [];
  let aArray = [];
  let string;
  let output;
  // Removing question and answer labels (python holdover)
  str = str.replaceAll("Q:", "");
  str = str.replaceAll("A:", "");
  // Splitting string at newlines
  string = str.split("\n");
  // Pushing questions to question list, other strings to answer list
  for (let i = 0; i < string.length; i++) {
    if (string[i].includes("?")){
      qArray.push(string[i]);
    }
    else {
      aArray.push(string[i])
    }
  }
  // Removing potential label strings from answer list
  aArray.splice(0, 1);
  //aArray.splice(aArray.length - 1, 1)
  output = [qArray, aArray];
  return output;
}

let inputString = "Here are the study questions and answers based on the notes:\nQ: How does the film portray the human cost of war, particularly through the lens of children?\nA: The film portrays the human cost of war brutally and realistically, showing the intense shock and trauma of losing family at a young age.\nQ: What do we see through the lens of children in the film?\nA: We see the unnecessary death toll of war, as well as the possibility of losing family without warning or preparation, which is life-changing for young children."
let qList;
let aList;
let arrayOut;
arrayOut = qna(inputString)
qList = arrayOut[0];
aList = arrayOut[1];
//console.log(arrayOut);
console.log(qList);
console.log(aList);