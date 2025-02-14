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