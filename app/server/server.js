const express = require ('express');
const path = require ('path');
const bodyParser = require('body-parser');
const fs = require('fs')
const cookieParser = require("cookie-parser");

// connessione a server mongoDB (e DOPO tutto il resto, per evitare errori chiamate DB non pronto)
const connectDB = require('./config/database.js');
connectDB().then( () =>{
    // cron per notifiche *****************************************************************************************************
    const eventController = require("./controllers/eventController.js") // per spostare eventi a mezzanotte
    const { notifications, timeTravelNotificationsUpdate, timeTravelNotificationsReset } = require ("./services/notifications.js"); // per notifiche
    let timeShift = 0; // variabile per timeMachine

    const cron = require('node-cron');
    const { addDays, addMinutes } = require('date-fns');

    const check = () => {
        let  now = new Date();
        if(timeShift != 0)
            now = addMinutes(now, timeShift);

        // controllo di mezzanotte
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            eventController.movePomodorosAndActivities(now);
        }
        // invio notifiche
        notifications(now);new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    cron.schedule('* * * * *', async () => { // any time = ogni minuto
        check();
    });
    // ***************************************************************************************************************************

    const PORT = 5000;
    const app = express();

    app.use(express.text({limit: "50mb"}), express.json({limit: "50mb"})); // IMPORTANTE PER RICEVERE JSON
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.use(cookieParser());

    // IMPORTING ROUTES WRITTEN IN OTHER FILES
    const pomodoroRoutes = require("./routes/pomodoroRoutes.js");
    const eventRoutes = require('./routes/eventRoutes.js');
    const noteRoutes = require('./routes/noteRoutes.js');
    const pushRoutes = require('./routes/pushNotificationRoutes.js');
    const userRoutes = require ("./routes/userRoutes.js");
    const userController = require ("./controllers/userController.js"); // per login

    // percorsi
    app.get('/utente', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html')); // se utente cerca pagina di login senza token non lo blocco
    });

    app.get('/',(request,response)=>{
        response.sendFile( path.join(__dirname,'../client/build/index.html') );
    });

    //************* login API ******************************* */
    app.post("/api/user/reqLogin", userController.login);
    app.post("/api/user/sendRegistration", userController.registration);
    app.delete("/api/user/logout", userController.logout);
    //*********************************************************** */

    app.use( userController.authToken); // Protegge tutte le API successive con il middleware
    // gestione api eventi
    app.use('/api/events', eventRoutes( addMinutes(new Date(), timeShift) ) ); // passo timeShift
    // gestione api note
    app.use('/api/notes', noteRoutes);
    // gestione notifiche
    app.use('/api/pushNotifications', pushRoutes);
    // gestione api pomodoro
    app.use('/api/Pomodoro', pomodoroRoutes);
    // gestione api utente
    app.use('/api/user', userRoutes);

    // time machine API
    app.put("/api/timeMachine/travel", async (req, res) => { // cambia data server
        timeShift = timeShift + Number(req.body.minutes);
        // calcolo data attuale
        let now = new Date();
        today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        // calcolo nuova data
        now = addMinutes(now, timeShift);
        newToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        // se cambia la data attivo funzione che normalmente attivo a mezzanotte
        if(newToday > today){
            await eventController.movePomodorosAndActivities(newToday); 
        }

        await timeTravelNotificationsUpdate(now);
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

});