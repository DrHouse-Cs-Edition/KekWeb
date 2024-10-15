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
const Note = require ("./Note.js");

//*************************************************************

app.use(express.text(), express.json()); // IMPORTANTE PER RICEVERE JSON
//app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('/', (request,response)=>{
    response.sendFile( path.join(__dirname,'../client/build/index.html') );
});

app.post('/api/notes/save',  (request,response)=>{
    const note = request.body;
    //mongoDB mongoose => attualmente ne salva di più con stesso nome -> usare id? !!!!!!!!!
    async function save(ttl,txt) {
        const nota1 = new Note({
            title: ttl,
            text: txt,
            date: Date.now(),
        });
        try{
            await nota1.save();
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
    }
    save(note.title,note.text);

});

app.post('/api/notes/remove',  (request,response)=>{
    //mongoDB mongoose
    async function remove(ttl) { // Remove the file  -> meglio usare id? !!!!!!!!!!
        try{ 
            await Note.deleteOne({title: ttl});
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
    remove(request.body);

});

app.get('/api/notes/load', (request,response)=>{ // richiesta: api/notes/load?noteName=NOTA1 ->dopo ? è una query
    //mongoDB mongoose
    async function load(ttl) {
        try{
            const nota = await Note.where("title").equals(ttl).lean(); // lean() fa ritornare oggetti js anziché documenti mongoose (più veloce)
            // nota: mongoose ritorna un ARRAY
            console.log(nota[0].title)
            response.json({
                success: true,
                title: nota[0].title,
                text: nota[0].text,
                date: nota[0].date,
            });
        }
        catch(e){
            console.log(e.message);
            response.json({
                success: false,
                message: "Errore durante il caricamento dal DB",
            });
        }
    }
    load(request.query.noteName);

});

app.get('/api/notes/all', (request,response)=>{ // richiesta: api/notes/load?noteName=NOTA1 ->dopo ? è una query
    //mongoDB mongoose
    async function load() {
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
    }
    load();

});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});