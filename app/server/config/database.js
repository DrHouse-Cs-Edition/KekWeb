const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1/test1");  //"mongodb://localhost:2017/test1" NON funziona
    console.log('✅ Connessione a MongoDB riuscita');
  } catch (err) {
    console.error('❌ Errore durante la connessione a MongoDB:', err.message);
  }
};

module.exports = connectDB;