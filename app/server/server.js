const express = require ('express');
const path = require ('path');
const bodyParser = require('body-parser');
const fs = require('fs')
const cookieParser = require("cookie-parser");
const nodemailer = require('nodemailer');

const PORT = 5000;
const app = express();

// connessione a server mongoDB
const connectDB = require('./config/database.js');
connectDB();

// per timemachine
let timeShift = 0;
//*IMPORTING ROUTES WRITTEN IN OTHER FILES
const pomodoroRoutes = require("./pagesMethods/pomodoro.js");
const eventRoutes = require('./routes/events');
const noteRoutes = require('./routes/notes');
const pushRoutes = require('./routes/pushNotifications');
const eventController = require("./controllers/eventController.js")
const { notifications, timeTravelNotificationsUpdate, timeTravelNotificationsReset } = require ("./jobs/notifications.js");

const UserRoutes = require ("./pagesMethods/Users.js");
require("dotenv").config();
app.get('/utente', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html')); // se utente cerca pagina di login senza token non lo blocco
}); 
// altro login ma con cookies:
const loginCookies =  require ("./controllers/cookiesLogin.js");

app.use(express.text({limit: "50mb"}), express.json({limit: "50mb"})); // IMPORTANTE PER RICEVERE JSON
app.use(express.static(path.join(__dirname, '../client/build')));
app.use(cookieParser());

const cron = require('node-cron');
const { addDays, addMinutes } = require('date-fns');

const check = () => {
    let  now = new Date();
    if(timeShift != 0)
        now = addMinutes(now, timeShift);

    // debugging (controlla che si attivi ogni minuto)
    if(now.getMinutes()%2 === 0)
        console.log("tick");
    else
        console.log("tack");

    // controllo di mezzanotte
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        // MUOVI POMODORI
            // eventController.movePomodoros(midnight);
        // MUOVI POMODORI E ATTIVITA' SCADUTE in maniera efficiente
            // now = new Date(now.getFullYear(), now.getMonth(), now.getDate()) // per avere mezzanotte
            eventController.movePomodorosAndActivities(now);
    }
    // invio notifiche
    notifications(now);new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

cron.schedule('* * * * *', async () => { // any time = ogni minuto
    check();
});

// percorsi

app.get('/',(request,response)=>{
    response.sendFile( path.join(__dirname,'../client/build/index.html') );
});

//************* login API ******************************* */
app.post("/api/user/reqLogin", UserRoutes.login);
app.post("/api/user/sendRegistration", UserRoutes.registration);
app.delete("/api/user/logout", UserRoutes.logout);
//*********************************************************** */

app.use( loginCookies.authToken); // Protegge tutte le API successive con il middleware
// gestione api eventi
app.use('/api/events', eventRoutes( addMinutes(new Date(), timeShift) ) ); // passo timeShift
// gestione api note
app.use('/api/notes', noteRoutes);
// gestione notifiche
app.use('/api/pushNotifications', pushRoutes)
const not = require ("./controllers/pushNotificationController.js");
const { debug } = require('console');
// time machine
//app.use("/api/timeMachine", timeMachineRoutes);

//************* POMODORO METHODS **************************** */

app.post("/api/Pomodoro/saveP", pomodoroRoutes.saveP);
app.get("/api/Pomodoro/getP", pomodoroRoutes.getP);
app.post("/api/Pomodoro/renameP", pomodoroRoutes.renameP);
app.delete("/api/Pomodoro/deleteP/:id", pomodoroRoutes.deleteP);
app.post("/api/Pomodoro/cyclesUpdate", eventController.isPomodoroScheduled, pomodoroRoutes.subCycles)//, pomodoroRoutes.subCycles
app.post("/api/Pomodoro/updateP", pomodoroRoutes.updateP);

//************* User METHODS ******************************* */
app.post("/api/user/reqLogin", UserRoutes.login);
app.post("/api/user/sendRegistration", UserRoutes.registration);
app.delete("/api/user/logout", UserRoutes.logout);
app.get("/api/user/getData", UserRoutes.userData );
app.put("/api/user/updateUData", UserRoutes.updateDataV2);
app.put("/api/user/updateNotificationMethod", UserRoutes.updateNotificationMethod);
//*********************************************************** */

app.put("/api/timeMachine/travel", (req, res) => { // cambia data server
    timeShift = timeShift + Number(req.body.minutes);
    // calcolo data attuale
    let now = new Date();
    today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // calcolo nuova data
    now = addMinutes(now, timeShift);
    newToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // se cambia la data attivo funzione che normalmente attivo a mezzanotte
    if(newToday > today){
        console.log("CHANGE DAY!");
        eventController.movePomodorosAndActivities(newToday); 
    }

    timeTravelNotificationsUpdate(now);
    check();
    res.json({
        date: now.toString(),
        success: true
    });
})

app.get("/api/timeMachine/date", (req, res) => { // restituisce data del server
    const now = addMinutes(new Date(), timeShift);
    res.json({date: now.toString(), success: true});
})

app.put("/api/timeMachine/reset", (req, res) => { // resetta data server alla normalità
    timeShift = 0;
    const now = new Date();
    timeTravelNotificationsReset(now);
    res.json({
        date: now.toString(),
        success: true
    });
})

app.get('*', (req, res) => { // richiesta pagine -> reindirizza richiesta a index (che ha i percorsi delle pagine)
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => { // per mettere il server in ascolto di richieste
    console.log(`Server is running on port ${PORT}`);
});