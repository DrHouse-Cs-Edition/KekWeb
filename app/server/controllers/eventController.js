const Event = require('../mongoSchemas/Event.js');

const saveEvent = async (request, response) => {
  const eventInput = request.body;
  const eventDB = new Event({
      title: eventInput.title,
      description: eventInput.description,
      location: eventInput.location,
      start: eventInput.start,
      end: eventInput.end,
      recurrenceRule: eventInput.recurrenceRule,
      alarms: eventInput.alarms,
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
          message: "Errore durante il salvataggio sul DB"+e
      });
  }
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
            message: "Errore durante il salvataggio sul DB"+e
        });
    }
};


const removeEvent = async (request, response) => {
    id = request.params.id;

    try{ 
        await Event.deleteOne({_id: id});
        response.json({
            success: true,
            message: "Event removed",
        });
    }
    catch(e){
        console.log(e.message);
        response.json({
            success: false,
            message: "Errore durante la rimozione dal DB"+e
        });
    }

};


const getEvent = async (request,response) => { // serve?
    id = request.params.id;
    
    try{
        const event = await Event.findById(id).lean();
        response.json({
            success: true,
            id: event.id,
            title: event.title,
            text: event.text,
            date: event.date,
        });
    }
    catch(e){
        console.log("errore load:" + e.message);
        response.json({
            success: false,
            message: "Errore durante il caricamento dal DB:"+e,
        });
    }

}


const allEvent = async (request,response)=>{

    try {
        const eventList = await Event.find({}).lean();  // Prende tutte le note (come oggetti)
        
        if (eventList.length > 0) {
            response.json({
                success: true,
                list: eventList, // Restituisce l'intero array di note
                message: "trovati eventi"
            });
        } else {
            response.json({
                success: false,
                message: "Nessun evento trovato"
            });
        }
    } catch (e) {
        console.log(e.message);
        response.json({
            success: false,
            message: "Errore durante il caricamento dal DB"+e
        });
    }

}

module.exports = { saveEvent, updateEvent, removeEvent, getEvent, allEvent };