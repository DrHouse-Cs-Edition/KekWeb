const Event = require('../mongoSchemas/Event.js');
const Subscription = require('../mongoSchemas/Subscription.js');
const User = require('../mongoSchemas/UserSchemas.js');
const { RRule } = require('rrule');
const { subDays, addDays, subMinutes, addMinutes } = require('date-fns');
const nodemailer = require("nodemailer");

const webpush = require('web-push');
const publicVapidKey = 'BCYGol-mf-Dw5Ns46eA-yK5XgtF0sPGloXOjHLzaqA3RhsO9BONM-D1LNA7-iPHD-eY9KWb_7xD7mV12WfVwE2c';
const privateVapidKey = 'LcjK9-6NYWYDZ9_SKPpy1nELIj0o_ANqYkNQ0rjoDNg';
webpush.setVapidDetails(
    'mailto:selfieapp17@gmail.com',
    publicVapidKey,
    privateVapidKey
);


// gestione notifiche (2.0) disattivate per testing

async function sendEmail(utente, evento, alertTime) {// MAIL V 2.0
  console.log("PROVO MAIL");
  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'selfieapp17@gmail.com',
        pass: 'scmp mgon qppf qtuw'
      }
  });

  const mailOptions = {
      from: 'selfieapp17@gmail.com',
      to: utente.email,
      subject: `Promemoria Evento: ${evento.titolo}`,
      text: `Ricordati del tuo evento: ${evento.descrizione}\norario di notifica:${alertTime}`
  };
  
  try{
    await transporter.sendMail(mailOptions);
    console.log("mail inviata? mail:" + utente.email)
  }
  catch(e){
    console.log("ERRORE!: "+e);
  }

}

async function sendPush(evento, alertTime){

  const payload = JSON.stringify({ title: evento.title, body: evento.description, time: alertTime });

  const subscription = await Subscription.find( {user: evento.user} ).lean();

  subscription.forEach( async (sub) => {
      console.log("subscription found!");
      try{
          await webpush.sendNotification({endpoint: sub.endpoint, expirationTime: sub.expirationTime, keys: sub.keys}, payload) // .catch(console.error) //.then( out => {console.log(out)});
        }
      catch(e){ // se c'è errore (iscrizione client eliminata -> la elimino da DB)
          try{
              //console.log(e)
              await Subscription.deleteOne({_id: sub._id});
          }
          catch(e){
              console.log(e.message);
          };
      }
  })  
}

async function notify(utente, evento, alertTime){
  const localDate = new Date(evento.nextAlarm);
  if(utente.notifichePush){ // != null && true
      console.log("notifica push?");
      sendPush(evento, alertTime);
    }
    else if (utente.email){
      console.log("notifica mail?");
      sendEmail(utente, evento, alertTime);
    }
}

// aggiorna nextAlarm
function updateAlarm(event, now){
  console.log("upd alarm")
  const localDate = new Date(evento.last_alarm);
  let orario = `\n${localDate}`;

  // per TM: se ho superato più ripetizioni, le unisco in un'unico messaggio (in tal caso fa dei llop, e no solo 1)
  do{
    event.nextAlarm = addMinutes(event.nextAlarm, event.alarm.repeat_every);
    event.repeated = event.repeated + 1;
    localDate = new Date(evento.nextAlarm);
    orario = orario + `\n${localDate}`;
    console.log("unfinished busy penguin!");
  }while( event.repeated < event.alarm.repeat_times // se devo ancora ripeterlo
    && addMinutes(event.nextAlarm, event.alarm.repeat_every) < now) // e la prossima sveglia è nel passato)

  // se ho finito con le ripetizioni
  if(event.repeated == event.alarm.repeat_times){
    event.nextAlarm = null;
    // e se l'evento è ricorrente
    if (event.rrule){
      regola = { freq: event.rrule.match(/FREQ=([A-Z]+)/)?.[1], dtStart: recurrenceRule.match(/DTSTART=([A-Z]+)/)?.[1]}
      if (regola.freq && regola.dtStart){
        const rule = new RRule( regola );
        const next = rule.after(now);
        //if (...){ // possibile controllo se ricorenza è finita?
          console.log("Da next")
          event.nextAlarm = subMinutes(next, event.alarm.earlyness);
          event.repeated = 0;
        //}
      }
    }
  }
  console.log(event.nextAlarm, "\n")
  return(orario);
}

// exports:

async function notifications(now){

  const today= new Date(now.toDateString()); // cancella orario -> mezzanotte
  // Cerca eventi da notificare
  const eventi = await Event.find({ //})
    nextAlarm: { $lte: now, $gte: today }, //tutte notifiche di oggi di cui è giunto/superato momento
  });

  eventi.forEach(async (evento) => { // Invia notifiche
    
    const utente = await User.findById(evento.user).lean();
    console.log("notifica individuata, mail:" + utente);

    // Segna come notificato o cambia data prossima notificas
    const alertTime = updateAlarm(evento,now); // aggiorna con prossima data alarm (e num repetizioni) + se uso TM mi da messaggio su tutte le volte che avrebbe dovuto suonare a quest'ora
    notify(utente, evento, alertTime); // mail o push
    // aggiorno nuovo nextaAlarm su DB
    await Event.findByIdAndUpdate(evento.id, evento);
  });
}

async function timeTravelNotificationsUpdate(now){

  const today = new Date(now.toDateString()); // cancella orario -> mezzanotte
  const tomorrow = new Date( subDays(today,1) );
  const operations = [];

  // aggiorno orario di notifica per eventi con rrule
  const eventiRrule = await Event.find({ alarm: { $ne: null }, rrule: { $ne: null } });
  eventiRrule.forEach((event) => {
    const regola = { freq: event.rrule.match(/FREQ=([A-Z]+)/)?.[1], dtStart: recurrenceRule.match(/DTSTART=([A-Z]+)/)?.[1]}
    if (regola.freq && regola.dtStart){
      const rule = new RRule( regola );
      const next = rule.after(now);
      // calcolo quando sarebbe prossima notifica con nuova data
      const alarmDate = subMinutes(next, event.alarm.earlyness);
      if( alarmDate>=today && alarmDate<tomorrow && alarmDate!=event.nextAlarm ) // limito per maggior efficienza nell'update
        ops.push({
          updateOne: {
            filter: { _id: event._id },
            update: { $set: { nextAlarm: alarmDate, repeated: 0 } }
          }
        });
    }
  });

  // setto Alarm suonati che dovrebbero suonare (se faccio viaggio nel passato)
  const eventi = await Event.find({ alarm: { $ne: null }, rrule: null, start: { $gte: now } });
  eventi.forEach( (event) => {
    const alarmDate = subMinutes( event.start, event.alarm.earlyness);
    if( alarmDate >= now && alarmDate!=event.nextAlarm )
      ops.push({
        updateOne: {
          filter: { _id: event._id },
          update: { $set: { nextAlarm: alarmDate, repeated: 0 } }
        }
    });
  })

  // invio tutte le operazioni in una sola volta
    if(operations.length > 0 )
      await Event.bulkWrite(operations);
}

async function timeTravelNotificationsReset(now){
  
  const today = new Date(now.toDateString()); // giorno ma cancella orario -> ora =  mezzanotte
  const operations = [];

  // aggiorno orario di notifica per eventi con rrule
  const eventiRrule = await Event.find({ rrule: { $ne: null } });
  eventiRrule.forEach((event) => {
    const regola = { freq: event.rrule.match(/FREQ=([A-Z]+)/)?.[1], dtStart: recurrenceRule.match(/DTSTART=([A-Z]+)/)?.[1]}
    if (regola.freq && regola.dtStart){
      const rule = new RRule( regola );
      const next = rule.after(now);
      // calcolo quando sarebbe prossima notifica con nuova data
      const alarmDate = subMinutes(next, event.alarm.earlyness);
      if( alarmDate!=event.nextAlarm ) // solo eventi che necessitano aggiornamento sul DB
        ops.push({
          updateOne: {
            filter: { _id: event._id },
            update: { $set: { nextAlarm: alarmDate, repeated: 0 } }
          }
      });
    }
  });

  // resetto Alarm suonati dopo viaggio nel tempo
  const eventi = await Event.find({ alarm: { $ne: null }, rrule: null, start: { $gte: now } });
  eventi.forEach( (event) => {
    const alarmDate = subMinutes( event.start, event.alarm.earlyness);
    if( alarmDate!=event.nextAlarm ) // solo eventi che necessitano aggiornamento sul DB
      ops.push({
        updateOne: {
          filter: { _id: event._id },
          update: { $set: { nextAlarm: alarmDate, repeated: 0 } }
        }
    });
  })

  // elimino Alarm settati dopo viaggio nel tempo ma non più rilevanti
  const eventiPassati = await Event.find({ nextAlarm:{ $lt: now } });
  Event.updateMany({
    filter: { nextAlarm:{ $lt: now } },
    update: { $set: {nextAlarm: null} }
  });

  // invio tutte le operazioni in una sola volta
  if(operations.length > 0 )
    await Event.bulkWrite(operations);
}

module.exports = { notifications, timeTravelNotificationsUpdate, timeTravelNotificationsReset};