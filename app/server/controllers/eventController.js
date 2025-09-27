const { title } = require('process');
const Event = require('../mongoSchemas/Event.js');
const { subMinutes, addDays } = require('date-fns');
const Pomodoro = require('../mongoSchemas/PomodoroSchema.js')
const { getNextAlarm } = require('../jobs/notifications.js');

// chiamate

const saveEvent = async (request, response, now) => {
    console.log("received backend event: ", request.body);
    console.log("user from request: ", request.user);
    
    try {
        const eventInput = request.body;
        
        // Check if user is authenticated
        if (!request.user) {
            return response.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

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

        // Calculate nextAlarm only if alarm is provided
        if (eventDB.alarm) {
            eventDB.nextAlarm = getNextAlarm(eventDB, now);
        }

        console.log("Event to save: ", eventDB);

        await eventDB.save();
        
        console.log("Event saved successfully with ID: ", eventDB._id);
        
        response.json({
            success: true,
            id: eventDB._id,
            message: "Event saved"
        });
    }
    catch(e){
        console.error("Error saving event: ", e);
        response.status(500).json({
            success: false,
            message: "Errore durante il salvataggio sul DB: " + e.message
        });
    }
};

const updateEvent = async (request, response) => {
    console.log("recieved backend event for UPDATE: ", request.body);
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
        // alarm MANCANTE
      });
      
      response.json({
        success: true,
        message: "Event updated"
      });
    }
    catch(e) {
      console.log(e.message);
      response.json({
        success: false,
        message: "Error updating event: " + e.message
      });
    }
};

// NEW METHOD: Quick update for completion status
const toggleComplete = async (request, response) => {
    const id = request.params.id;
    const { completed } = request.body;
  
    try {
      const updatedEvent = await Event.findByIdAndUpdate(
        id, 
        { completed: completed },
        { new: true } // Return the updated document
      );
      
      if (!updatedEvent) {
        return response.status(404).json({
          success: false,
          message: "Event not found"
        });
      }
      
      response.json({
        success: true,
        message: "Event completion status updated",
        event: updatedEvent
      });
    }
    catch(e) {
      console.log(e.message);
      response.status(500).json({
        success: false,
        message: "Error updating completion status: " + e.message
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

const allEvent = async (request, response) => {
    try {
        const eventList = await Event.find({ user: request.user }).lean(); // user filtering

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
                    alarm: event.alarm // Add alarm field to response
                })),
                message: "Events found"
            });
        } else {
            response.json({
                success: false,
                message: "No events found"
            });
        }
    } catch (e) {
        console.log(e.message);
        response.status(500).json({
            success: false,
            message: "Error loading events"
        });
    }
};

const isPomodoroScheduled = (req, res, next)=>{
    const userId = req.user;
    const {title} = req.body;
    console.log("pomodoro scheduling verification for: ", title);
    Event.find({ user: userId, pomodoro : title}).lean()
    .then( (events) =>{
      console.log("pomodoro events found: ", events.length);
      if(events.length > 0){
        console.log("found pomodoro")
        next();
      }else{
        console.log("no pomodoro found")
        return res.status(404).json({ message: "Nessun pomodoro trovato" });
      }
    }) 
}

const movePomodoros = (date)=>{
  console.log("proceding to move pomodoros");
  let datePlus = new Date(date);
  datePlus.setDate(datePlus.getDate() + 1)
  Event.find({type : "pomodoro"})
  .then(p => {
    p.forEach( (evento)=>{
      if (evento.end < date && evento.completed == false){
        
        evento.start = date;
        evento.end = datePlus;
        evento.save();
    }})
  })
}

const latestP = async function (req, res){
  const userId = req.user;
  try {
    const foundEV = await Event.findOne({ user: userId, type: "pomodoro" }).sort("end")
    if(!foundEV){
      console.log("no EV")
      res.status(200).json({ // non dà errore (caso in cui utente non ha ancora un pomodoro)
        success: false,
        message: "no pomodoro event found"
      })
      return;
    }

    const foundP = await Pomodoro.findOne({title : foundEV.pomodoro}) // cerco pomodoro associato all'evento

    if(!foundP){
      console.log("no foundP")
      res.status(404).json({
        success: false,
        message: "no pomodoro connected to the event"
      })
      return;
    }
    

    // console.log("pomodoro found: ", foundP, "\n event found ", foundEV);   //dovrebbero essere trovati
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
      message: "pomodoro event has been found"
    })
    
  }catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "error retrieving pomodoro",
      error: e,
    })
  }  
}

const moveActivities = async (newDate)=>{
  let newEndDate = addDays(newDate,1);
  let operations = [];

  activities = await Event.find({type : "activity"})
  
  activities.forEach( (evento)=>{
    if (evento.end < newDate && evento.completed != true){
      operations.push({
        updateOne: {
          filter: { _id: evento._id },
          update: { $set: { start: newDate, end: newEndDate, } }
        }
      });
    }
  })

  // invio tutte le operazioni in una sola volta (utile se dovessero essercene molte individuali)
  if(operations.length > 0 )
    Event.bulkWrite(operations);
}

const movePomodorosAndActivities = async (newDate)=>{ // più efficiente
  let newEndDate = addDays(newDate,1);
  let operations = [];

  activities = await Event.find({ type: {$in: ["activity", "pomodoro"]}, end: {$lte: newDate} }) // lte (e non lt) perche confronto vecchia_fine con nuovo_inizio
  
  activities.forEach( (evento)=>{
    if (evento.completed != true){
      operations.push({
        updateOne: {
          filter: { _id: evento._id },
          update: { $set: { start: newDate, end: newEndDate, } } // activityDate resta la stessa (per conoscere il ritardo)
        }
      });
    }
  })

  // invio tutte le operazioni in una sola volta (utile se dovessero essercene molte individuali)
  if(operations.length > 0 )
    Event.bulkWrite(operations);
}

module.exports = { saveEvent, updateEvent, removeEvent, getEvent, allEvent,
   toggleComplete, isPomodoroScheduled, movePomodoros, latestP, moveActivities, movePomodorosAndActivities};