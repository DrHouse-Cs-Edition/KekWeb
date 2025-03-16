const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const noteSchema = new mongoose.Schema({
    title: String,
    categories: Array, // di stringhe
    text: String,
    createdAt: Date,
    lastModified: Date,
    user: { 
        type: Schema.Types.ObjectId, // Specifica che è un ObjectId
        ref: 'User', // Nome del modello a cui fa riferimento
        // required: true, // OBBLIGA ad avere un campo user alle note
    },
});

module.exports = new mongoose.model("Note", noteSchema);