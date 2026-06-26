const express = require("express"); // express model imported
const path = require("path"); // built-in path module imported
const bcrypt = require("bcryptjs"); // bcryptjs model imported
const collection = require("./config"); 
const multer = require("multer");
const app = express(); // Creates express application
const Groq = require('groq-sdk');
const pdfIn = require('pdfjs-dist');

// IMPORTANT: Set up Groq using Environment Variables for security
// Make sure to add GROQ_API_KEY to your Vercel Dashboard -> Project Settings -> Environment Variables
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY 
});

// JSON Data conversion
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Use EJS as view engine
app.set('view engine', 'ejs');

// Static folders
app.use(express.static("./images")); 
app.use(express.static("public"));

app.get('/', (req, res) => {
    res.render("home");
}); 

app.get('/login', (req, res) => { 
    res.render("login");
});

app.get('/signup', (req, res) => { 
    res.render("signup");
});

app.get('/pricing', (req, res) => { 
    res.render("pricing");
});
  
// VERCEL FIX: Use Memory Storage instead of Disk Storage because serverless platforms are Read-Only
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        let ext = path.extname(file.originalname);
        if (ext !== '.pdf') {
            return callback(new Error('Only pdf files are allowed'), false);
        }
        callback(null, true);
    }
}).single('userFile');

// Read PDF directly from RAM buffer instead of local disk
async function readPdfFromBuffer(buffer) {
    try {
        // Convert the Node buffer into a Uint8Array for pdfjs-dist
        const uint8Array = new Uint8Array(buffer);
        const pdf = await pdfIn.getDocument({ data: uint8Array }).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(" ");
            fullText += pageText + "\n";
        }

        return fullText;
    } catch (error) {
        console.error("Error reading PDF buffer:", error);
        throw error;
    }
}

app.post('/', function (req, res) {
    upload(req, res, async function (err) {
        if (err) {
            return res.status(500).send("Error uploading file: " + err.message);
        }

        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }

        try {
            // Convert PDF buffer directly to text
            let pdfString = await readPdfFromBuffer(req.file.buffer);
            console.log("Extracted Text from PDF successfully.");

            // Send extracted text to AI model
            const chatCompletion = await groq.chat.completions.create({
                model: 'mixtral-8x7b-32768',
                messages: [{ role: 'user', content: `Create a list of study questions and answers from this text: ${pdfString}` }]
            });

            let qnaString = chatCompletion.choices[0].message.content;

            // Parser logic
            function parseQnA(text) {
                let qArray = [];
                let aArray = [];
                let lines = text.split("\n");
                
                let currentQuestion = null;
                let currentAnswer = [];
            
                lines.forEach(line => {
                    line = line.trim();
                    
                    if (/^\d+\./.test(line)) {  
                        if (currentQuestion && currentAnswer.length > 0) {
                            qArray.push(currentQuestion);
                            aArray.push(currentAnswer.join(" "));  
                        }
                        currentQuestion = line.replace(/^\d+\.\s*/, "");  
                        currentAnswer = [];
                    } else if (currentQuestion) {
                        currentAnswer.push(line.replace(/^A:\s*/, "").trim()); 
                    }
                });
            
                if (currentQuestion && currentAnswer.length > 0) {
                    qArray.push(currentQuestion);
                    aArray.push(currentAnswer.join(" "));
                }
            
                return qArray.map((q, index) => ({
                    question: q,
                    answer: aArray[index] || "No answer available"
                }));
            }
            
            let flashcards = parseQnA(qnaString);
            res.render("flashcards", { flashcards: flashcards });

        } catch (error) {
            console.error("Error processing PDF:", error);
            res.status(500).send("Error processing file.");
        }
    });
});

// VERCEL FIX: Added missing leading slash ('/flashcards')
app.post('/flashcards', function(req, res) {
    function qna(str) {
        let qArray = [];
        let aArray = [];
        let string = str.replaceAll("Q:", "").replaceAll("A:", "").split("\n");
        
        for (let i = 0; i < string.length; i++) {
          if (string[i].includes("?")){
            qArray.push(string[i]);
          } else {
            aArray.push(string[i]);
          }
        }
        aArray.splice(0, 1);
        return [qArray, aArray];
    }

    async function runModel(pdf) {
      try {
        const chatCompletion = await groq.chat.completions.create({
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: `Create a list of study questions and answers from the provided text: ${pdf}` }],
        });
        return chatCompletion.choices[0].message.content;
      } catch (error) {
        console.error('Error:', error);
      }
    }

    // Logic implementation safely contained
    if(typeof pdfString == "string") {
        runModel(pdfString).then(pdfOut => {
            let arrayOut = qna(pdfOut);
            let qList = arrayOut[0];
            let aList = arrayOut[1];
            res.json({ qList, aList });
        }).catch(err => res.status(500).send(err.message));
    } else {
        res.status(400).send("Error: No PDF detected");
    }
});

// Registering User
app.post('/signup', async (req, res) => {
    const data = {
        name: req.body.username, 
        password: req.body.password   
    };
    
    const existingUser = await collection.findOne({name: data.name});
    if(existingUser){
        res.send("User already exists.");
        return; 
    } else {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds); 

        data.password = hashedPassword; 
        const userdata = await collection.insertMany(data); 
        console.log("User registered successfully.");
        res.redirect("/login"); // Clean user flow routing
    }
});

// Login Setup
app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({name: req.body.username});   
        if(!check){ 
            res.send("Username cannot be found.");
            return;
        }
        
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if(isPasswordMatch) {
            res.render("home"); 
        } else {
            // VERCEL FIX: Changed 'req.send' to 'res.send' to prevent runtime crash
            res.send("Incorrect Password.");
            return;
        }
    } catch (e) {
        res.send("Wrong credentials!");
        return;
    }
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`); 
});