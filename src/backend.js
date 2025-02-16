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
  let output;
  //console.log(typeof input)
  while (input.includes("Q:")){
   string = input.split("Q: ");
   question = string[1].split("\n");
   qArray.push(question[0]);
   input = question[1];
   //console.log(typeof input)
  }
  //console.log(typeof input)
  input = str;
  while (input.includes("A:")){
    //console.log(input + "\n This is the end of input 1.")
    string = input.split("A: ");
    answer = string[1].split("\n", 2);
    aArray.push(answer[0]);
    input = answer[1];
    console.log(answer[0])
    console.log("\n" + input + "\n")
   }
  output = [qArray, aArray]
  return output;
}

let inputString = "Here are the study questions and answers based on the notes:\nQ: How does the film portray the human cost of war, particularly through the lens of children?\nA: The film portrays the human cost of war brutally and realistically, showing the intense shock and trauma of losing family at a young age.\nQ: What do we see through the lens of children in the film?\nA: We see the unnecessary death toll of war, as well as the possibility of losing family without warning or preparation, which is life-changing for young children."
let qList;
let aList;
let arrayOut;
arrayOut = qna(inputString)
qList = arrayOut[0];
aList = arrayOut[1];
console.log(arrayOut);
console.log(qList);
console.log(aList);