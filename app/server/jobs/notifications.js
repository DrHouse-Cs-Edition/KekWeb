const Event = require('../mongoSchemas/Event.js');
const Subscription = require('../mongoSchemas/Subscription.js');
const User = require('../mongoSchemas/UserSchemas.js');
const { RRule } = require('rrule');
const { subDays, subMinutes, addMinutes } = require('date-fns');

const webpush = require('web-push');
const publicVapidKey = 'BCYGol-mf-Dw5Ns46eA-yK5XgtF0sPGloXOjHLzaqA3RhsO9BONM-D1LNA7-iPHD-eY9KWb_7xD7mV12WfVwE2c';
const privateVapidKey = 'LcjK9-6NYWYDZ9_SKPpy1nELIj0o_ANqYkNQ0rjoDNg';
webpush.setVapidDetails(
    'mailto:selfieapp17@gmail.com',
    publicVapidKey,
    privateVapidKey
);


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

function timeMachineDealer(event, now){

  while(addMinutes(event.nextAlarm, event.alarm.repeat_every) < now // se prossima sveglia è nel passato
        && event.repeated+1 < event.alarm.repeat_times){ // e non l'ho ripetuto al massimo (+1 perché devo )
    event.nextAlarm = addMinutes(event.nextAlarm, event.alarm.repeat_every);
    event.repeated = event.repeated + 1;
  }

  return (event);
}

async function notify(evento){

  const payload = JSON.stringify({ title: evento.title, body: evento.description });

  const subscription = await Subscription.find( {user: evento.user} ).lean();

  subscription.forEach( async (sub) => {
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


// aggiorna nextAlarm
function updateAlarm(event, now){
  console.log("upd alarm")
  last_alarm = event.nextAlarm;
  event.repeated = event.repeated + 1;
  event.nextAlarm = null;
  if(event.repeated < event.alarm.repeat_times){ // se non ho finito di ripetere l'avviso all'utente
    console.log("unfinished busy penguin!")
    event.nextAlarm = addMinutes(last_alarm, event.alarm.repeat_every);
  }/*
  else{
    const rule = new RRule(event.rrule);
    const next = rule.after(now);
    if (next) // se ho finito di avvisare l'utente ma l'evento si ripete nel tempo
      console.log("Da next")
      event.nextAlarm = subMinutes(next, event.alarm.earlyness);
      event.repeated = 0;
  }*/
  console.log(event.nextAlarm, "\n")
  return(event);
}

async function notifications(now){
  // Cerca eventi da notificare
  const eventi = await Event.find({ //})
    nextAlarm: { $lte: now, $gte: subDays(now,1) }, //tutte notifiche di oggi di cui è giunto/superato momento
  });

  eventi.forEach(async (evento) => { // Invia notifiche
    const utente = User.findById(evento.user)

    // evento = timeMachineDealer(evento,now) // per evitare spam se uso time machine
    //if(utente.push)
      notify(evento);
    //else
    //  sendEmail(evento.description, evento.user)

    // Segna come notificato o cambia data prossima notifica
    evento = updateAlarm(evento,now); // aggiorna con prossima data alarm (e num repetizioni)
    await Event.findByIdAndUpdate(evento.id, evento);
  });
}

module.exports = { notifications};