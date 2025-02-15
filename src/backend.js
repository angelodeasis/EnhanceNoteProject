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
  let question;
  let answer;
  let input = str;

  while (input.includes("Q:")){
   string = str.split("Q: ");
   question = string[1].split("?");
   qArray.push(question[0]);
   input = question[1];
  }

  while (input.includes("A:")){
    string = str.split("A: ");
    answer = string[1].split("\n");
    aArray.push(answer[0]);
    input = answer[1];
   }

  return qArray, aArray;
}

let inputString = "Here are the study questions and answers based on the notes:\nQ: How does the film portray the human cost of war, particularly through the lens of children?\nA: The film portrays the human cost of war brutally and realistically, showing the intense shock and trauma of losing family at a young age.\nQ: What do we see through the lens of children in the film?\nA: We see the unnecessary death toll of war, as well as the possibility of losing family without warning or preparation, which is life-changing for young children."
let qList;
let aList;
qList, aList = qna(inputString)
console.log(qList)
console.log(aList)