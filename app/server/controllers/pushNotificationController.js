// NOTIFICHE PUSH 1.0 ************************************************************************

const webpush = require('web-push');
const publicVapidKey = 'BCYGol-mf-Dw5Ns46eA-yK5XgtF0sPGloXOjHLzaqA3RhsO9BONM-D1LNA7-iPHD-eY9KWb_7xD7mV12WfVwE2c';
const privateVapidKey = 'LcjK9-6NYWYDZ9_SKPpy1nELIj0o_ANqYkNQ0rjoDNg';
webpush.setVapidDetails(
    'mailto:selfieapp17@gmail.com',
    publicVapidKey,
    privateVapidKey
);
const Subscription = require('../mongoSchemas/Subscription.js');

const subscribe = async (req,res) => {
    inputSub = req.body;
    console.log(inputSub)
    const sub = new Subscription({
        user: req.user,
        endpoint: inputSub.endpoint,
        expirationTime: inputSub.expirationTime,
        keys: inputSub.keys
    });
    try{
        await sub.save(); // comunicazione con mongoDB
        res.json({success:true})
    }
    catch(e){
        console.log(e.message);
        response.json({
            success: false,
            message: "Errore durante il salvataggio dell'iscrizione sul DB: "+e,
        });
    }
}

const testNotication = async (req,res) => {
    const payload = JSON.stringify({ title: 'Notifica!', body: "prova prova" });

    const subscription = await Subscription.find( {user: req.user} ).lean();

    if(subscription)
        res.json({success: true, message: "sending notification"});
    else{
        res.json({success: false, message: "no permission for push notification"})
        console.log("nhu")
    }

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

    //sub = subscription[sub.length - 1]
    //webpush.sendNotification({endpoint: sub.endpoint, expirationTime: sub.expirationTime, keys: sub.keys}, payload).catch(console.error)
    
}

module.exports = { subscribe, testNotication };