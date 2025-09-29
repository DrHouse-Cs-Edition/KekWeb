const { title } = require('process');
const Event = require('../mongoSchemas/Event.js');
const { subMinutes, addHours } = require('date-fns');
const Pomodoro = require('../mongoSchemas/PomodoroSchema.js')
const { getNextAlarm } = require('../services/notifications.js');

// Salva un nuovo evento nel database
const saveEvent = async (request, response, now) => {
    try {
        const eventInput = request.body;
        
        // Verifica se l'utente è autenticato
        if (!request.user) {
            return response.status(401).json({
                success: false,
                message: "Utente non autenticato"
            });
        }

        // Crea nuovo evento con i dati ricevuti
        const eventDB = new Event({
            user: request.user,
            title: eventInput.title,
            description: eventInput.description,
            location: eventInput.location,
            type: eventInput.type,
            pomodoro: eventInput.pomodoro,
            activityDate: eventInput.activityDate ? new Date(eventInput.activityDate) : null,
            start: eventInput.start ? new Date(eventInput.start) : null,
            end: eventInput.end ? new Date(eventInput.end) : null,
            recurrenceRule: eventInput.recurrenceRule,
            urgencyLevel: eventInput.urgencyLevel || 0,
            completed: eventInput.completed || false,
            alarm: eventInput.alarm,
            nextAlarm: null,
            repeated: 0,
        });

        // Calcola il prossimo allarme solo se l'allarme è configurato
        if (eventDB.alarm) {
            eventDB.nextAlarm = getNextAlarm(eventDB, now);
        }

        await eventDB.save();
        
        response.json({
            success: true,
            id: eventDB._id,
            message: "Evento salvato"
        });
    }
    catch(e){
        response.status(500).json({
            success: false,
            message: "Errore durante il salvataggio sul DB: " + e.message
        });
    }
};

// Aggiorna un evento esistente
const updateEvent = async (request, response) => {
    const id = request.params.id;
    const eventInput = request.body;
  
    try {
      await Event.findByIdAndUpdate(id, {
        title: eventInput.title,
        description: eventInput.description,
        location: eventInput.location,
        type: eventInput.type,
        pomodoro: eventInput.pomodoro,
        activityDate: eventInput.activityDate ? new Date(eventInput.activityDate) : null,
        start: eventInput.start ? new Date(eventInput.start) : null,
        end: eventInput.end ? new Date(eventInput.end) : null,
        recurrenceRule: eventInput.recurrenceRule,
        urgencyLevel: eventInput.urgencyLevel,
        completed: eventInput.completed,
        alarm: eventInput.alarm
      });
      
      response.json({
        success: true,
        message: "Evento aggiornato"
      });
    }
    catch(e) {
      response.json({
        success: false,
        message: "Errore durante l'aggiornamento: " + e.message
      });
    }
};

// Cambia rapidamente lo stato di completamento di un'attività
const toggleComplete = async (request, response) => {
    const id = request.params.id;
    const { completed } = request.body;
  
    try {
      const updatedEvent = await Event.findByIdAndUpdate(
        id, 
        { completed: completed },
        { new: true } // Restituisce il documento aggiornato
      );
      
      if (!updatedEvent) {
        return response.status(404).json({
          success: false,
          message: "Evento non trovato"
        });
      }
      
      response.json({
        success: true,
        message: "Stato completamento aggiornato",
        event: updatedEvent
      });
    }
    catch(e) {
      response.status(500).json({
        success: false,
        message: "Errore durante l'aggiornamento: " + e.message
      });
    }
};

// Rimuove un evento dal database
const removeEvent = async (request, response) => {
    id = request.params.id;

    try{ 
        await Event.deleteOne({_id: id});
        response.json({
            success: true,
            message: "Evento rimosso",
        });
    }
    catch(e){
        response.json({
            success: false,
            message: "Errore durante la rimozione dal DB: " + e
        });
    }
};

// Ottiene un singolo evento per ID (probabilmente non più utilizzata)
const getEvent = async (request,response) => {
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
        response.json({
            success: false,
            message: "Errore durante il caricamento dal DB: " + e,
        });
    }
}

// Ottiene tutti gli eventi dell'utente corrente
const allEvent = async (request, response) => {
    try {
        // Filtra gli eventi per utente autenticato
        const eventList = await Event.find({ user: request.user }).lean();

        if (eventList.length > 0) {
            response.json({
                success: true,
                list: eventList.map(event => ({
                    _id: event._id,
                    title: event.title,
                    type: event.type,
                    start: event.start,
                    end: event.end,
                    activityDate: event.activityDate,
                    pomodoro: event.pomodoro,
                    location: event.location,
                    description: event.description,
                    recurrenceRule: event.recurrenceRule,
                    urgencyLevel: event.urgencyLevel || 0,
                    completed: event.completed || false,
                    alarm: event.alarm
                })),
                message: "Eventi trovati"
            });
        } else {
            response.json({
                success: false,
                message: "Nessun evento trovato"
            });
        }
    } catch (e) {
        response.status(500).json({
            success: false,
            message: "Errore durante il caricamento eventi"
        });
    }
};

// Verifica se un pomodoro è già programmato (middleware)
const isPomodoroScheduled = (req, res, next)=>{
    const userId = req.user;
    const {title} = req.body;
    Event.find({ user: userId, pomodoro : title}).lean()
    .then( (events) =>{
      if(events.length > 0){
        next(); // Continua con il prossimo middleware
      }else{
        return res.status(404).json({ message: "Nessun pomodoro trovato" });
      }
    }) 
}

// Trova l'ultimo pomodoro programmato dall'utente
const latestP = async function (req, res){
  const userId = req.user;
  try {
    // Cerca l'ultimo evento pomodoro dell'utente
    const foundEV = await Event.findOne({ user: userId, type: "pomodoro" }).sort("end")
    if(!foundEV){
      res.status(200).json({
        success: false,
        message: "Nessun evento pomodoro trovato"
      })
      return;
    }

    // Cerca i dettagli del pomodoro associato
    const foundP = await Pomodoro.findOne({title : foundEV.pomodoro})

    if(!foundP){
      res.status(404).json({
        success: false,
        message: "Nessun pomodoro collegato all'evento"
      })
      return;
    }
    
    // Prepara i dati del pomodoro per la risposta
    const latestPomodoro2 ={
      title: foundP.title,
      Pid:  foundP._id,
      Eid: foundEV._id,
      studyT: foundP.studyTime,
      breakT: foundP.breakTime,
      cycles: foundP.cycles,
      date : foundEV.start
    }
    res.status(200).json({
      success : true,
      pomodoro: latestPomodoro2,
      message: "Evento pomodoro trovato"
    })
    
  }catch (e) {
    res.status(500).json({
      success: false,
      message: "Errore durante il recupero del pomodoro",
      error: e,
    })
  }  
}

// Sposta sia pomodori che attività non completati alla nuova data (versione ottimizzata)
const movePomodorosAndActivities = async (newDate)=>{
  let newEndDate = addHours(newDate,1);
  let operations = [];

  // Query ottimizzata: cerca solo eventi che necessitano di essere spostati
  activities = await Event.find({ 
    type: {$in: ["activity", "pomodoro"]}, 
    end: {$lte: newDate} // Trova eventi la cui fine è <= alla nuova data
  })
  
  activities.forEach( (evento)=>{
    if (evento.completed != true){
      operations.push({
        updateOne: {
          filter: { _id: evento._id },
          update: { $set: { start: newDate, end: newEndDate, } } // activityDate resta invariata per calcolare il ritardo
        }
      });
    }
  })

  // Esegue tutte le operazioni in una sola volta per migliori performance
  if(operations.length > 0 )
    Event.bulkWrite(operations);
}

module.exports = { saveEvent, updateEvent, removeEvent, getEvent, allEvent,
   toggleComplete, isPomodoroScheduled, latestP, movePomodorosAndActivities};