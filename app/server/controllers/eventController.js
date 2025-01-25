const User = require('../mongoSchemas/User.js');

const saveEvent = async (request, response) => {
  const eventInput = {title: "titoloTest", text: "just a test", start: [],} // request.body;
  const eventDB = new Event({
      title: eventInput.title,
      text: eventInput.description,
      start: eventInput.date,
  });

  try{
      await eventDB.save();
      response.json({
          success: true,
          id: eventDB._id, // può servire(?)
          message: "Event saved"
      });
  }
  catch(e){
      console.log(e.message);
      response.json({
          success: false,
          message: "Errore durante il salvataggio sul DB",
      });
  }
};

  
const getEvent = (request, response) => {
};


const removeEvent = (request, response) => {
};

  
const updateEvent = async (request, response) => {
  const id = request.params.id;
  const eventInput = request.body;

  try{
      await Note.findByIdAndUpdate(id,{
          // riconosce da id
          title: eventInput.title,
          text: eventInput.text,
          date: eventInput.date,
      });
      response.json({
          success: true,
          message: "Evento aggiornata"
      });
  }
  catch(e){
      console.log(e.message);
      response.json({
          success: false,
          message: "Errore durante il salvataggio sul DB",
      });
  }
};
  
module.exports = { saveEvent, getEvent, removeEvent, updateEvent };