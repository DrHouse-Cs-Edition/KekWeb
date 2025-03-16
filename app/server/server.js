const express = require ('express');
const path = require ('path');
const bodyParser = require('body-parser');
const fs = require('fs')

const cookieParser = require("cookie-parser");
//const { fileURLToPath } = require ('url');
// Get the directory name of the current module
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

//*MODULE IMPORTS
// import path from 'path';
// import express from 'express';
// import fs from 'fs'
// import bodyParser from 'body-parser';
// import React, { useState } from 'react';

const PORT = 5000;
const app = express();

// connessione a server mongoDB
const connectDB = require('./config/database.js');
connectDB();

//*IMPORTING ROUTES WRITTEN IN OTHER FILES
let pomodoroRoutes = require("./pagesMethods/pomodoro.js");
const eventRoutes = require('./routes/events');
const noteRoutes = require('./routes/notes');

const UserRoutes = require ("./pagesMethods/Users.js");
require("dotenv").config();
// altro login ma con cookies:
const loginCookies =  require ("./controllers/cookiesLogin.js");

app.use(express.text(), express.json()); // IMPORTANTE PER RICEVERE JSON
//app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client/build')));
console.log("envvar_Server:", process.env.JWT_KEY);

app.use(cookieParser());

app.get('/',(request,response)=>{
    response.sendFile( path.join(__dirname,'../client/build/index.html') );
    console.log("connection perhaps created idk");
});

//************* login API ******************************* */
app.post("/api/user/reqLogin", loginCookies.login);
app.post("/api/user/sendRegistration", loginCookies.registration);
app.delete("/api/user/logout", loginCookies.logout);
//*********************************************************** */

app.use( loginCookies.authToken); // Protegge tutte le API

// gestione api eventi
app.use('/api/events', eventRoutes);
// gestione api note
app.use('/api/notes', noteRoutes);

//************* POMODORO METHODS **************************** */

app.post("/api/Pomodoro/saveP", UserRoutes.authToken, pomodoroRoutes.saveP);


// richiesta pagine -> reindirizza richiesta a index (che ha i percorsi delle pagine)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// per far partire il server in ascolto di richieste
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});