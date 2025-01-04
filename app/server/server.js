const express = require ('express');
const path = require ('path');
//const { fileURLToPath } = require ('url');
const bodyParser = require('body-parser');
const fs = require('fs')

// Get the directory name of the current module
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const PORT = 5000;
const app = express();

//mongoDB*************************************************************

const mongoose = require ('mongoose');
mongoose.connect("mongodb://127.0.0.1/test1") //"mongodb://localhost:2017/test1" NON funziona
const Note = require ("./mongoSchemas/Note.js");
const User = require ("./mongoSchemas/User.js");

//*************************************************************

//*IMPORTING ROUTES WRITTEN IN OTHER FILES
let pomodoroRoutes = require("./pagesMethods/pomodoro.js");

app.use(express.text(), express.json()); // IMPORTANTE PER RICEVERE JSON
//app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('/', (request,response)=>{
    response.sendFile( path.join(__dirname,'../client/build/index.html') );
    console.log("connection perhaps created idk");
});

app.post('/api/notes/save', async (request,response)=>{
    const note = request.body;
    const nota1 = new Note({
        title: note.title,
        text: note.text,
        date: note.date,
        // user: 'aaaaaaaaaaaaaaaaaa', // se user è REQUIRED e non c'é il campo user o se l'_id non corrisoponde a quello di uno User nel server mongoDB dà errore
    });
    /*
    const user1 = new User({
        name: "Gino",
        password: "psw!", // per ora tipo String, poi vediamo cosa fanno le librerie "password1!" -> "2ashvd&%fewf&//°Lè&"
        email: "gino@io.com",
        bio: "sono Gino",
        birthday: note.date,
    });*/

    try{
        await nota1.save();
        //await user1.save();
        response.json({
            success: true,
            message: "Note saved"
        });
    }
    catch(e){
        console.log(e.message);
        response.json({
            success: false,
            message: "Errore durante il salvataggio sul DB",
        });
    }

});

app.put('/api/notes/update/:id', async (request,response)=>{
    const id = request.params.id;
    const note = request.body;

    try{
        await Note.findByIdAndUpdate(id,{
            title: note.title,
            text: note.text,
            date: note.date,
        });
        response.json({
            success: true,
            message: "Nota aggiornata"
        });
    }
    catch(e){
        console.log(e.message);
        response.json({
            success: false,
            message: "Errore durante il salvataggio sul DB",
        });
    }

});

app.delete('/api/notes/remove/:id',  (request,response)=>{
    id = request.params.id;

    async function remove(id) { // Remove the file
        try{ 
            await Note.deleteOne({_id: id});
            response.json({
                success: true,
                message: "Note removed",
            });
        }
        catch(e){
            console.log(e.message);
            response.json({
                success: false,
                message: "Errore durante la rimozione dal DB",
            });
        }
    }
    remove(request.params.id);

});

app.get('/api/notes/load/:id', async (request,response)=>{ // richiesta: api/notes/load?noteName=NOTA1 ->dopo ? è una query
    id = request.params.id;

    try{
        const nota = await Note.findById(id).lean(); // lean() fa ritornare oggetti js anziché documenti mongoose (più veloce)
        // nota: find ritorna un ARRAY ma non findById
        response.json({
            success: true,
            id: nota.id,
            title: nota.title,
            text: nota.text,
            date: nota.date,
        });
    }
    catch(e){
        console.log("errore load:" + e.message);
        response.json({
            success: false,
            message: "Errore durante il caricamento dal DB:"+e,
        });
    }

});

app.get('/api/notes/all', async (request,response)=>{ // richiesta: api/notes/load?noteName=NOTA1 ->dopo ? è una query

    try {
        const note = await Note.find({}).lean();  // Prende tutte le note (come oggetti)
        
        if (note.length > 0) { // Se sono presenti delle note, le restituisce nel JSON
            response.json({
                success: true,
                list: note, // Restituisce l'intero array di note
            });
        } else {
            // Se nessuna nota viene trovata, restituisce 404
            response.status(404).json({
                success: false,
                message: "Nessuna nota trovata",
            });
        }
    } catch (e) {
        console.log(e.message);
        response.status(500).json({
            success: false,
            message: "Errore durante il caricamento dal DB",
        });
    }

});

//************* POMODORO METHODS **************************** */

app.post("/api/Pomodoro/saveP", pomodoroRoutes.saveP);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

//* BASIC METHOD FOR LISTENING TO THE RIGHT PORT
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});