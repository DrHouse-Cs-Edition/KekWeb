import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();

app.get('/', (request,response)=>{
    response.sendFile( path.join(__dirname,'note','note_page.html') );
});

app.listen(PORT);