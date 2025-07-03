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

//*IMPORTING ROUTES WRITTEN IN OTHER FILES
let pomodoroRoutes = require("./pagesMethods/pomodoro.js");
const eventRoutes = require('./routes/events');
const noteRoutes = require('./routes/notes');
const pushRoutes = require('./routes/pushNotifications');
const eventControllerRoutes = require("./controllers/eventController.js")

const UserRoutes = require ("./pagesMethods/Users.js");
require("dotenv").config();
app.get('/utente', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html')); // se utente cerca pagina di login senza token non lo blocco
}); 
// altro login ma con cookies:
const loginCookies =  require ("./controllers/cookiesLogin.js");

app.use(express.text(), express.json()); // IMPORTANTE PER RICEVERE JSON
app.use(express.static(path.join(__dirname, '../client/build')));
app.use(cookieParser());

let time_shift = 0; // minuti
const { notifications } = require ("./jobs/notifications.js");

const cron = require('node-cron');
const { addDays, addMinutes } = require('date-fns');

const check = () => {
    let  now = new Date();
    if(time_shift != 0)
        now = addMinutes(now, time_shift);

    // debugging (controlla che si attivi ogni minuto)
    if(now.getMinutes%2 === 0)
        console.log("tick")
    else
        console.log("tack")

    notifications(now);

    // controllo di mezzanotte
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        // MUOVI POMODORI
        // MUOVI ATTIVITA' SCADUTE
    }
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
app.use('/api/events', eventRoutes);
// gestione api note
app.use('/api/notes', noteRoutes);
// gestione notifiche
app.use('/api/pushNotifications', pushRoutes)
const not = require ("./controllers/pushNotificationController.js");
// app.post('api/pushNotifications/subscribe',not.subscribe)

//************* POMODORO METHODS **************************** */

app.post("/api/Pomodoro/saveP", pomodoroRoutes.saveP);
app.get("/api/Pomodoro/getP", pomodoroRoutes.getP);
app.post("/api/Pomodoro/renameP", pomodoroRoutes.renameP);
app.delete("/api/Pomodoro/deleteP/:id", pomodoroRoutes.deleteP);
app.put("/api/Pomodoro/cyclesUpdate", eventControllerRoutes.isPomodoroScheduled, pomodoroRoutes.updateCycles)

//************* User METHODS ******************************* */
app.post("/api/user/reqLogin", UserRoutes.login);
app.post("/api/user/sendRegistration", UserRoutes.registration);
app.delete("/api/user/logout", UserRoutes.logout);
app.get("/api/user/getData", UserRoutes.userData );
app.put("/api/user/updateUData", UserRoutes.updateData);
//*********************************************************** */

app.put("/api/timeMachine/travel", (req, res) => { // cambia data server
  time_shift = time_shift + Number(req.body.minutes);
  console.log(time_shift);
  // const now = new Date;
  // notifications(addMinutes(now, time_shift))
  check();
  res.json({success: true})
})

app.get("/api/timeMachine/date", (req, res) => { // restituisce data del server
  now = new Date;
  now = addMinutes(now, time_shift);
  res.json({date: now.toString(), success: true})
})

app.put("/api/timeMachine/reset", (req, res) => { // resetta data server alla normalità
  time_shift = 0;
  console.log(time_shift);
  res.json({success: true})
})

app.get('*', (req, res) => { // richiesta pagine -> reindirizza richiesta a index (che ha i percorsi delle pagine)
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => { // per mettere il server in ascolto di richieste
    console.log(`Server is running on port ${PORT}`);
});