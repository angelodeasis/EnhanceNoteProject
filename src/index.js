const express = require("express"); // express model imported
const path = require("path"); // built-in path module imported
const bcrypt = require("bcrypt"); // bcrypt model imported
const collection = require("./config"); 
// const backend = require("./backend");
const multer = require("multer")
const app = express(); // Creates express application
const Groq = require('groq-sdk');




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


// File upload
let storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './uploads')
    },
    filename: function(req, file, callback) {
        console.log(file)
        callback(null, file.originalname);
    }
   })
 
   app.get('/', function(req, res) {
    res.render('index')
   })
 
  app.post('/', function(req, res) {
    let upload = multer({
        storage: storage,
        fileFilter: function(req, file, callback) {
            let ext = path.extname(file.originalname)
            if (ext !== '.pdf') {
                return callback(res.end('Only pdf files are allowed'), null)
            }
            callback(null, true)
        }
    }).single('userFile');
    upload(req, res, function(err) {
        if(err) {
            return res.status(500).send("Error uploading file" + err);
        }
        res.render("flashcards")
    });
  });


// Backend for Handling PDF




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





const port = 8000;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`); // Listener
})
