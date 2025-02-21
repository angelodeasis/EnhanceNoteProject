const express = require("express"); // express model imported
const pasth = require("path"); // built-in path module imported
const bcrypt = require("bcrypt"); // bcrypt model imported
const collection = require("./config"); 

const app = express(); // Creates express application

// JSON Data conversion
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Use EJS as view engine
app.set('view engine', 'ejs');

app.use(express.static("./images")); // must declare static folder in order to use (images)

// Static file (Linking CSS sheet to our EJS files)
app.use(express.static("public"));

app.get('/', (req, res) => {
    res.render("home");
}); //(THIS WILL BE USED LATER)

app.get('/login', (req, res) => { // Login request/respond function
    res.render("login");
});

app.get('/signup', (req, res) => { // Sign-up request/respond function
    res.render("signup");
});

app.get('/pricing', (req, res) => { // Sign-up request/respond function
    res.render("pricing");
});


// Registering User
app.post('/signup', async (req, res) => {
    const data = {
        name: req.body.username, // Requests the username string from our EventListener in the body of HTML
        password: req.body.password // Requests password ^  
    }
    // Security 
    const existingUser = await collection.findOne({name: data.name});
    if(existingUser){
        res.send("User already exists.") // Sends a notification to the user if name is found in database
        return; // Required to catch THRW-HEADER error, since we need the user to be able to return to the previous page
    } else {
        const saltRounds = 10 // Number of hashing rounds bcrypt does on password
        const hashedPassword = await bcrypt.hash(data.password, saltRounds) // Hashes password to encrypt it

        data.password = hashedPassword; // Replaces password with hashed verison.

        const userdata = await collection.insertMany(data); // For await command, make sure function is asynchoronous
        console.log(userdata);  // Collecting userdata
    }

   
});

// Login Setup
app.post("/login", async (req, res) => {
    try{
        const check = await collection.findOne({name: req.body.username}); // Checks for username in database   
        if(!check){ // If check fails...
            res.send("Username cannot be found.");
            return;
        }
        // Check regular String password with Hashed password:
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if(isPasswordMatch) {
            res.render("Home"); // We will route this to the next page after Eldad/David's parts are done
        }else {
            req.send("Incorrect Password.");
            return;
        }
    } catch{
        res.send("Wrong credentials!");
        return;
    }

});



app.post('/home', async (req, res) => {
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
});






const port = 8000;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`); // Listener
})
