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
    response.sendFile( path.join(__dirname,'note','note_editor.html') );
});

app.post('/notes/save',  (request,response)=>{
    const note = request.body;
    fs.writeFile('./src/note/notesJSON/test1.JSON', JSON.stringify(note), (err)=>{ // salvo in un file
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

app.post('/notes/remove',  (request,response)=>{
    console.log(request.body);
    const filePath = './src/note/notesJSON/' + request.body + '.JSON'; // Replace with the actual path to your file

    // Remove the file
    fs.unlink(filePath, (err) => {
        if (err) {console.error(err);
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

app.get('/notes/load', (request,response)=>{
    request.query.name;
    response.sendFile( path.join(__dirname,'note','note_editor.html') );
});

app.listen(PORT);