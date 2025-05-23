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

// gestione notifiche (2.0) disattivate per testing
/*
const cron = require('node-cron');
const Event = require('./mongoSchemas/Event.js');
const { RRule } = require('rrule');
const { subMinutes, addMinutes } = require('date-fns');

async function sendEmail(descrizione) {
  const mailOptions = {
      from: 'selfieapp17@gmail.com',
      to: 'lucamarangon2001@gmail.com', // invece dovrai recupere la mail dell'utente dal database
      subject: 'Promemoria Evento',
      text: `Ricordati del tuo evento: ${descrizione}`
  };
  
  await transporter.sendMail(mailOptions);
}

// aggiorna nextAlarm
function updateAlarm(event, now){
  event.repeated = event.repeated + 1;
  event.nextAlarm = null;
  if(event.repeated < event.alarm.repeat){ // se non ho finito di ripetere l'avviso all'utente
    event.nextAlarm = addMinutes(now, event.alarm.repeat_every);
  }
  else{
    const rule = new RRule(event.rrule);
    const next = rule.after(now);
    if (next) // se ho finito di avvisare l'utente ma l'evento si ripete nel tempo
      event.nextAlarm = subMinutes(next, event.alarm.earlyness);
      event.repeated = 0;
  }
  return(event);
}

cron.schedule('* * * * *', async () => { // /5 per controllare ogni 5 minuti invece
  const now = new Date();
  
  // Cerca eventi da notificare
  const eventi = await Event.find({
    nextAlarm: { $lte: now }, //$lte now = ricerca Less Than or Equal to now
  });

  eventi.forEach(async (evento) => { // Invia notifiche
    // MAIL V 1.0
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'selfieapp17@gmail.com',
          pass: 'scmp mgon qppf qtuw'
        }
    });
      
    sendEmail(evento.description)

    // Segna come notificato o cambia data prossima notifica
    evento = updateAlarm(evento, now); // aggiorna con prossima data alarm (e num repetizioni)
    await Event.findByIdAndUpdate(evento.id, evento);
  });

});
*/
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

//************* POMODORO METHODS **************************** */

app.post("/api/Pomodoro/saveP", pomodoroRoutes.saveP);

//************* User METHODS ******************************* */
app.post("/api/user/reqLogin", UserRoutes.login);
app.post("/api/user/sendRegistration", UserRoutes.registration);
app.delete("/api/user/logout", UserRoutes.logout);
app.get("/api/user/getData", UserRoutes.userData );
app.put("/api/user/updateUData", UserRoutes.updateData);
//*********************************************************** */

app.get('*', (req, res) => { // richiesta pagine -> reindirizza richiesta a index (che ha i percorsi delle pagine)
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => { // per mettere il server in ascolto di richieste
    console.log(`Server is running on port ${PORT}`);
});