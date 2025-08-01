const express = require('express');
const { saveNote, updateNote, removeNote, loadNote, allNote, lastNote } = require('../controllers/noteController');
const noteRouter = express.Router();

noteRouter.post('/save', saveNote); // gestisce richiesta fatta all'url del server + "/save"
noteRouter.put('/update/:id', updateNote);
noteRouter.delete('/remove/:id', removeNote);
noteRouter.get('/load/:id', loadNote);
noteRouter.get('/all', allNote);
noteRouter.get('/last', lastNote);

module.exports = noteRouter;