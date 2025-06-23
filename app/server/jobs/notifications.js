const Event = require('../mongoSchemas/Event.js');
const User = require('../mongoSchemas/UserSchemas.js');
const { RRule } = require('rrule');

// gestione notifiche (2.0) disattivate per testing
async function sendEmail(descrizione, userID) {// MAIL V 2.0
  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'selfieapp17@gmail.com',
        pass: 'scmp mgon qppf qtuw'
      }
  });

  const user = await User.findById(userID).lean();

  const mailOptions = {
      from: 'selfieapp17@gmail.com',
      to: user.email,
      subject: 'Promemoria Evento',
      text: `Ricordati del tuo evento: ${descrizione}`
  };
  
  await transporter.sendMail(mailOptions);
}

async function notify(descrizione, userID){

  const user = await User.findById(userID).lean();

  const payload = JSON.stringify({ title: 'Notifica!', body: descrizione });

  const subscription = await Subscription.find( {user: userID} ).lean();

  subscription.forEach( async (sub) => {
      try{
          await webpush.sendNotification({endpoint: sub.endpoint, expirationTime: sub.expirationTime, keys: sub.keys}, payload) // .catch(console.error) //.then( out => {console.log(out)});
      }
      catch(e){ // se c'è errore (iscrizione client eliminata -> la elimino da DB)
          try{
              console.log(sub)
              await Subscription.deleteOne({_id: sub._id});
          }
          catch(e){
              console.log(e.message);
          };
      }
  })  
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
    sendEmail(evento.description, evento.user)

    // Segna come notificato o cambia data prossima notifica
    evento = updateAlarm(evento); // aggiorna con prossima data alarm (e num repetizioni)
    await Event.findByIdAndUpdate(evento.id, evento);
  });
}

module.exports = { notifications};