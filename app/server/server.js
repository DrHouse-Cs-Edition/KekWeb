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

app.post('/api/notes/save', async (request,response)=>{ // app.metodo('url_aggiuntivo') gestisce richiesta fatta all'url del server + url_aggiuntivo
//                                                       es: 'localhost3000/api/notes/save' 
    const notaInput = request.body;
    const notaDB = new Note({
        // user: note.user, = possibile altro parametro
        title: notaInput.title,
        text: notaInput.text,
        date: notaInput.date,
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
        await notaDB.save(); // comunicazione con mongoDB
        response.json({
            success: true,
            id: notaDB._id, // può servire(?)
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
    const notaInput = request.body;

    try{
        await Note.findByIdAndUpdate(id,{
            // user non va cambiato
            title: notaInput.title,
            text: notaInput.text,
            date: notaInput.date,
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
        // Note.find({user:"Gino"})    =    ritornrebbe le note scritte dall'urtente Gino
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
        const listaNote = await Note.find({}).lean();  // Prende tutte le note (come oggetti)
        
        if (listaNote.length > 0) { // Se sono presenti delle note, le restituisce nel JSON
            response.json({
                success: true,
                list: listaNote, // Restituisce l'intero array di note
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