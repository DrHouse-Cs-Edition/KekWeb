const express = require ('express');
const path = require ('path');
const { fileURLToPath } = require ('url');

const fs = require('fs')

// Get the directory name of the current module
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();

app.use(express.text(), express.json()); // IMPORTANTE PER RICEVERE JSON

app.get('/', (request,response)=>{
    response.sendFile( path.join(__dirname,'src/note','note_editor.html') );
});

app.post('/api/notes/save',  (request,response)=>{
    const note = request.body;
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
                message: "Note saved"});
    });
});

app.post('/api/notes/remove',  (request,response)=>{
    const filePath = './src/note/notesJSON/' + request.body + '.JSON'; // Replace with the actual path to your file

    // Remove the file
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
                message: "Note removed"});
    });
});

app.get('/api/notes/load', (request,response)=>{ // richiesta: api/notes/load?noteName=NOTA1 ->dopo ? è una query
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
    });
});

app.listen(PORT);