const express = require ('express');
const path = require ('path');
//const { fileURLToPath } = require ('url');

const fs = require('fs')

// Get the directory name of the current module
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();

//mongoDB*************************************************************

const mongoose = require ('mongoose');
mongoose.connect("mongodb://127.0.0.1/test1") //"mongodb://localhost:2017/test1" NON funziona
const Note = require ("./Note.js");

//*************************************************************

app.use(express.text(), express.json()); // IMPORTANTE PER RICEVERE JSON

app.get('/', (request,response)=>{
    response.sendFile( path.join(__dirname,'src/note','note_editor.html') );
});

app.post('/api/notes/save',  (request,response)=>{
    const note = request.body;
    /* versione con file locali
    console.log(note);
    const filePath = './src/note/notesJSON/' + note.title + '.JSON';
    fs.writeFile('./src/note/notesJSON/' + note.title + '.JSON', JSON.stringify(note), (err)=>{ // salvo in un file
        if(err) {
            console.log(err);
            response.json({
                success: false,
                message: "Error"});
            }
        else
            response.json({
                success: true,
                message: "Note saved"
            });
    });*/

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
    /* versione con file locali
    const filePath = './src/note/notesJSON/' + request.body + '.JSON';
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err);
            response.json({
                success: false,
                message: "Error"});
        }
        else
            response.json({
                success: true,
                message: "Note removed"
            });
    });*/

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
    /* versione con file locali
    const filePath = './src/note/notesJSON/' + request.query.noteName + '.JSON';
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            response.json({
                success: false,
                message: "Error"});
        }
        else{
            json = JSON.parse(data);
            response.json({
                success: true,
                title: json.title,
                text: json.text,
                date: json.date,
            });
        }
        console.log('Contenuto del file:', data);
    });*/

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

app.listen(PORT);