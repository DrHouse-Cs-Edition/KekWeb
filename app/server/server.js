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
// altro login ma con cookies:
const loginCookies =  require ("./controllers/cookiesLogin.js");

app.use(express.text(), express.json()); // IMPORTANTE PER RICEVERE JSON
app.use(express.static(path.join(__dirname, '../client/build')));
app.use(cookieParser());

/*// gestione notifiche (1.0) disattivate per testing

const cron = require('node-cron');
const Event = require('./mongoSchemas/Event.js');

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
      
    async function sendEmail(descrizione) {
      const mailOptions = {
          from: 'selfieapp17@gmail.com',
          to: 'lucamarangon2001@gmail.com', // invece dovrai recupere la mail dell'utente dal database
          subject: 'Promemoria Evento',
          text: `Ricordati del tuo evento: ${descrizione}`
      };
      
      await transporter.sendMail(mailOptions);
    }
    sendEmail(evento.description)

    // Segna come notificato o cambia data prossima notifica
    evento.nextAlarm = null; // NON SARA' DA ELIMINARE MA DA AGGIORNARE CON PROSSIMA DATA ALARM
    await Event.findByIdAndUpdate(evento.id,evento); 
  });

});
*/

app.get('/',(request,response)=>{
    response.sendFile( path.join(__dirname,'../client/build/index.html') );
});

//************* login API ******************************* */
app.post("/api/user/reqLogin", loginCookies.login);
app.post("/api/user/sendRegistration", loginCookies.registration);
app.delete("/api/user/logout", loginCookies.logout);
app.get('/utente', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html')); // se utente cerca pagina di login senza token non lo blocco
});
//******************************************************* */

app.use( loginCookies.authToken); // Protegge tutte le API successive con il middleware

// gestione api eventi
app.use('/api/events', eventRoutes);
// gestione api note
app.use('/api/notes', noteRoutes);
// POMODORO METHODS
app.post("/api/Pomodoro/saveP", UserRoutes.authToken, pomodoroRoutes.saveP);


app.get('*', (req, res) => { // richiesta pagine -> reindirizza richiesta a index (che ha i percorsi delle pagine)
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => { // per mettere il server in ascolto di richieste
    console.log(`Server is running on port ${PORT}`);
});