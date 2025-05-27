const Event = require('../mongoSchemas/Event.js');
const { RRule } = require('rrule');

// gestione notifiche (2.0) disattivate per testing
async function sendEmail(descrizione) {// MAIL V 1.0
  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'selfieapp17@gmail.com',
        pass: 'scmp mgon qppf qtuw'
      }
  });

  const mailOptions = {
      from: 'selfieapp17@gmail.com',
      to: 'lucamarangon2001@gmail.com', // invece dovrai recupere la mail dell'utente dal database
      subject: 'Promemoria Evento',
      text: `Ricordati del tuo evento: ${descrizione}`
  };
  
  await transporter.sendMail(mailOptions);
}

// aggiorna nextAlarm
function updateAlarm(event){
  last_alarm = event.nextAlarm;

  event.repeated = event.repeated + 1;
  event.nextAlarm = null;
  if(event.repeated < event.alarm.repeat){ // se non ho finito di ripetere l'avviso all'utente
    event.nextAlarm = addMinutes(now, event.alarm.repeat_every);
    // per caso time machine
    while(event.nextAlarm < now && event.repeated < event.alarm.repeat){
      event.nextAlarm = addMinutes(now, event.alarm.repeat_every);
      event.repeated = event.repeated + 1;
    }
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

async function notifications(now){
  // Cerca eventi da notificare
  const eventi = await Event.find({
    nextAlarm: { $lte: now, $gte: subDays(now,1) }, //tutte notifiche di oggi di cui è giunto/superato momento
  });

  eventi.forEach(async (evento) => { // Invia notifiche
    sendEmail(evento.description)

    // Segna come notificato o cambia data prossima notifica
    evento = updateAlarm(evento); // aggiorna con prossima data alarm (e num repetizioni)
    await Event.findByIdAndUpdate(evento.id, evento);
  });
}

async function timetravelNotifications(now){
  // Cerca eventi da notificare
  const eventi = await Event.find({
    nextAlarm: { $lte: now, $gte: subDays(now,1) }, //tutte notifiche di oggi di cui è giunto/superato momento
  });

  eventi.forEach(async (evento) => { // Invia notifiche
    sendEmail(evento.description)

    // Segna come notificato o cambia data prossima notifica
    evento = updateAlarm(evento, now); // aggiorna con prossima data alarm (e num repetizioni)
    await Event.findByIdAndUpdate(evento.id, evento);
  });
}

module.exports = { notifications, timetravelNotifications };