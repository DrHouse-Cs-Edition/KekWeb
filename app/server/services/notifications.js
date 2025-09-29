const Event = require('../mongoSchemas/Event.js');
const Subscription = require('../mongoSchemas/Subscription.js');
const User = require('../mongoSchemas/UserSchemas.js');
const { RRule, rrulestr } = require('rrule');
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
      subject: `Promemoria: ${evento.title}`,
      text: `Ricordati del tuo evento${evento.description? (": " + evento.description) : ""}\norario di notifica:${alertTime}`
  };
  
  try{
    await transporter.sendMail(mailOptions);
  }
  catch(e){
    console.log("ERRORE!: "+e);
  }

}

async function sendPush(evento, alertTime){

  const payload = JSON.stringify({ title: evento.title, body: evento.description, time: alertTime });

  const subscription = await Subscription.find( {user: evento.user} ).lean();

  subscription.forEach( async (sub) => {
      try{
        await webpush.sendNotification({endpoint: sub.endpoint, expirationTime: sub.expirationTime, keys: sub.keys}, payload);
      }
      catch(err){ // se c'è errore (iscrizione client eliminata -> la elimino da DB)
        if (err.statusCode === 400 || err.statusCode === 403 || err.statusCode === 410 || err.statusCode === 404) { // se permesso scaduto
          try{
            await Subscription.deleteOne({_id: sub._id});
          }
          catch(e){
            console.err(e.message);
          };
        }
        else
          console.err("Errore push:", err);
      }
  });
}

async function notify(utente, evento, alertTime){
  const localDate = new Date(evento.nextAlarm);
  if(utente.notifications == "push"){
      sendPush(evento, alertTime);
    }
  else if (utente.notifications == "email" && utente.email){
    sendEmail(utente, evento, alertTime);
  }
  // else if(utente.notifications == "disabled") { do nothing }
}

function getNextAlarm(event, now){
  let nextAlarm = null;
  if(event.alarm && event.alarm.repeat_times > 0){
    // evento con rrule
    if (event.recurrenceRule){
      const rule = rrulestr(event.recurrenceRule);
      if (rule){
        let next = rule.after(now);
        while (subMinutes(next, event.alarm.earlyness) < now){ // se abbiamo superato orario notifica -> vado avanti
          next = rule.after(next);
        }
        nextAlarm = subMinutes(next, event.alarm.earlyness);
      }
    }
    // evento senza rrule
    else{
      let next = subMinutes(event.start, event.alarm.earlyness);
      if(next > now) // se l'orario di notifica non è ancora passato
        nextAlarm = next;
      else  
        nextAlarm = null; // per chiarezza, ma dovrebbe essere già null
    }
  }
  return nextAlarm;
}

// aggiorna nextAlarm
function updateAlarmAndGetNotificationTimes(event, now){
  let notificationTimes = ``;

  do{
    notificationTimes = notificationTimes + ` ${event.nextAlarm.toLocaleString('it-IT', { hour: '2-digit', minute: '2-digit' })} |`;
    event.repeated = event.repeated + 1;
    event.nextAlarm = addMinutes(event.nextAlarm, event.alarm.repeat_every);

  // per TM: se ho superato più ripetizioni, le unisco in un'unico messaggio (in tal caso fa dei loop, e no solo 1)
  }while( event.repeated < event.alarm.repeat_times // se devo ancora ripeterlo
    && addMinutes(event.nextAlarm, event.alarm.repeat_every) < now) // e la prossima sveglia è nel passato)

  // se ho finito con le ripetizioni
  if(event.repeated >= event.alarm.repeat_times){
    event.nextAlarm = null;
    if (event.recurrenceRule){
      const rule = rrulestr(event.recurrenceRule);
      if (rule){ // possibile controllo se ricorrenza è finita?
        const next = rule.after(now);

        event.nextAlarm = subMinutes(next, event.alarm.earlyness);
        event.repeated = 0;
      }
    }
  }

  return (notificationTimes);
}

// exports:

async function notifications(now){

  const today= new Date(now.getFullYear(), now.getMonth(), now.getDate()); // cancella orario -> mezzanotte
  // Cerca eventi da notificare
  const eventi = await Event.find({
    nextAlarm: { $lte: now, $gte: today }, //tutte notifiche di oggi di cui è giunto/superato momento
  });

  eventi.forEach(async (evento) => { // Invia notifiche
    
    const utente = await User.findById(evento.user).lean();

    // Segna come notificato o cambia data prossima notificas
    const alertTimes = updateAlarmAndGetNotificationTimes(evento,now); // aggiorna con prossima data alarm (e num repetizioni) + se uso TM mi da messaggio su tutte le volte che avrebbe dovuto suonare a quest'ora
    notify(utente, evento, alertTimes); // mail o push
    // aggiorno nuovo nextaAlarm su DB
    await Event.findByIdAndUpdate(evento.id, evento);
  });
}

async function timeTravelNotificationsUpdate(now){

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // cancella orario -> mezzanotte
  const tomorrow = new Date( subDays(today,1) );
  let operations = [];

  // aggiorno orario di notifica per eventi con rrule
  const eventiRrule = await Event.find({ alarm: { $ne: null }, recurrenceRule: { $ne: null } });
  eventiRrule.forEach((event) => {
    if(alarm.repeat_times > 0){ // se richiede notifica
      const rule = rrulestr(event.recurrenceRule);
      if (rule){
        // calcolo quando sarebbe prossima notifica con nuova data (NOTA: PER TM non controllo che orario non sia ancora passato -> puo essere ne passato)
        const next = rule.after(today);
        const alarmDate = subMinutes(next, event.alarm.earlyness);
        // carico sul DB
        operations.push({
          updateOne: {
            filter: { _id: event._id },
            update: { $set: { nextAlarm: alarmDate, repeated: 0 } }
          }
        });
      }
    }
  });

        

  // riattivo Alarm che dovrebbero suonare (se faccio viaggio nel passato)
  const eventi = await Event.find({ alarm: { $ne: null }, recurrenceRule: null, start: { $gte: now } });
  eventi.forEach( (event) => {
    if(alarm.repeat_times > 0){ // se richiede notifica
      const alarmDate = subMinutes( event.start, event.alarm.earlyness);
      if( alarmDate >= now && alarmDate!=event.nextAlarm ){
        operations.push({
          updateOne: {
            filter: { _id: event._id },
            update: { $set: { nextAlarm: alarmDate, repeated: 0 } }
          }
        });
      }
    }
  })

  // invio tutte le operazioni in una sola volta
    if(operations.length > 0 )
      await Event.bulkWrite(operations);
}

async function timeTravelNotificationsReset(now){
  
  let operations = [];

  // aggiorno orario di notifica per eventi con rrule
  const eventiRrule = await Event.find({ recurrenceRule: { $ne: null } });
  eventiRrule.forEach((event) => {
    if(alarm.repeat_times > 0){ // se richiede notifica
      const rule = rrulestr(event.recurrenceRule);
      if (rule){
        // calcolo prossima notifica
        let next = rule.after(now);
        while (subMinutes(next, event.alarm.earlyness) < now){ // se abbiamo superato orario notifica -> vado avanti
          next = rule.after(next);
        }
        const alarmDate = subMinutes(next, event.alarm.earlyness);

        if( alarmDate!=event.nextAlarm ){ // solo eventi che necessitano aggiornamento sul DB
          operations.push({
            updateOne: {
              filter: { _id: event._id },
              update: { $set: { nextAlarm: alarmDate, repeated: 0 } }
            }
          });
        }
      }
    }
  });

  // resetto Alarm suonati dopo viaggio nel tempo ($gte: now)
  const eventi = await Event.find({ alarm: { $ne: null }, recurrenceRule: null,/* start: { $gte: now }*/ });
  eventi.forEach( (event) => {
    if(event.alarm.repeat_times > 0){ // se l'allarme originariamente suonava
      let alarmDate = subMinutes( event.start, event.alarm.earlyness);
      if(alarmDate < now) // se alarm è nel passato -> lo disattivo
        alarmDate = null;
      if(alarmDate!=event.nextAlarm){ // solo se necessita aggiornamento sul DB
        operations.push({
          updateOne: {
            filter: { _id: event._id },
            update: { $set: { nextAlarm: alarmDate, repeated: 0 } }
          }
        });
      }
    }
  })

  /*
  // elimino Alarm settati dopo viaggio nel tempo ma non più rilevanti ($lt: now)
  const res = await Event.updateMany(
    { nextAlarm:{ $lt: now } }, // filter
    { $set: {nextAlarm: null} } // update
  );*/

  //sposto indietro Attività e Pomodori
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const toMove = await Event.find({ type: {$in: ["activity", "pomodoro"]}, start: {$gt: today}, completed: {$ne: true} }) // attivita non completate successive ad adesso
  toMove.forEach( (event) => {
    if( event.activityDate && event.activityDate < event.start ){ // se data originaria era piu indietro di quella attualmente salvata
      const newDate = (today > event.activityDate)? today : event.activityDate; // lo sposto a data attuale o originale, in base a quella più futura
      operations.push({
        updateOne: {
          filter: { _id: event._id },
          update: { $set: { start: newDate, end: addDays(newDate,1) } }
        }
      });
    }
  })

  // invio tutte le operazioni in una sola volta
  if(operations.length > 0 )
    await Event.bulkWrite(operations);
}

module.exports = { notifications, timeTravelNotificationsUpdate, timeTravelNotificationsReset, 
  getNextAlarm};