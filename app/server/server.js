const express = require ('express');
const path = require ('path');
const bodyParser = require('body-parser');

const PORT = 5000;
const app = express();

// connessione a server mongoDB
const connectDB = require('./config/database.js');
connectDB();

//*IMPORTING ROUTES WRITTEN IN OTHER FILES
let pomodoroRoutes = require("./pagesMethods/pomodoro.js");
const eventRoutes = require('./routes/events');
const noteRoutes = require('./routes/notes');

app.use(express.text(), express.json()); // IMPORTANTE PER RICEVERE JSON
//app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// pagina di default
app.get('/', (request,response)=>{
    response.sendFile( path.join(__dirname,'../client/build/index.html') );
    console.log("connection perhaps created idk");
});

// gestione api eventi
app.use('/api/events', eventRoutes);
// gestione api note
app.use('/api/notes', noteRoutes);
// ************* POMODORO METHODS ****************************
app.post("/api/Pomodoro/saveP", pomodoroRoutes.saveP);

// richiesta pagine -> reindirizza richiesta a index (che ha i percorsi delle pagine)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// per far partire il server in ascolto di richieste
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});