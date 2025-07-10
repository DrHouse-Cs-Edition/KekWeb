const { title } = require('process');
const Event = require('../mongoSchemas/Event.js');
const { subMinutes } = require('date-fns');
const Pomodoro = require('../mongoSchemas/PomodoroSchema.js')

const saveEvent = async (request, response) => {
    console.log("recieved backend event: ", request.body);
    const eventInput = request.body;
    const eventDB = new Event({
      user: request.user, // Add user association
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
      alarm: eventInput.alarm // Add alarm field
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
        alarm: eventInput.alarm // Add alarm field
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
        // Add user filtering
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
    const {title} = req.body;
    console.log("pomodoro scheduling verification for: ", title);
    Event.find({pomodoro : title}).lean()
    .then(
      (events) =>{
        console.log("pomodoro events found: ", events.length);
        if(events.length > 0){
          console.log("found pomodoro")
          next();
        }else{
          console.log("no pomodoro found")
          return;
        }})      
}

const movePomodoros = ()=>{
  console.log("proceding to move pomodoros");
  let date = new Date();
  let datePlus = new Date();
  datePlus.setDate(datePlus.getDate() + 1)
  Event.find({type : "pomodoro"})
  .then(p => {
    p.forEach( (evento)=>{
      if (evento.end < Date.now() && evento.completed == false){
        
        evento.start = date;
        evento.end = datePlus;
        evento.save();
    }})
  })
}

const latestP = async function (req, res){
  try {
    const LP_ev = await Event.findOne({type: "pomodoro"}).sort("end");
    const LP_pom = await Pomodoro.find({title : LP_ev.title});
    
    const latestPomodoro ={
      title: LP_pom.title,
      Pid: LP_pom._id,
      Eid: LP_ev._id,
      studyT: LP_pom.studyTime,
      breakT: LP_pom.breakTime,
      cycles: LP_pom.cycles,
      date : LP_ev.end,
    }
    console.log("latestP: ", latestPomodoro);

    //TODO what if no event?
    if(!latestPomodoro)
      res.status(404).json({
        success: false,
        message: "no pomodoro event found"
      })
    res.status(200).json({
      success : true,
      pomodoro: latestPomodoro,
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
module.exports = { saveEvent, updateEvent, removeEvent, getEvent, allEvent, toggleComplete, isPomodoroScheduled, movePomodoros, latestP };