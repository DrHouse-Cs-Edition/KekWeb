import React, { useState } from 'react';

function TimeMachine(){
    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);

    const submit = (e) => {
        e.preventDefault();

        fetch('http://localhost:5000/api/timeMachine/travel', {
            method: 'PUT',
            credentials: 'include',
            headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({minutes: (days*1440 + hours*60 + minutes) })
        })
        .then(response => response.json())
        .then(json => {
            if (json.success)
                alert(`Hai hai viaggiato nel tempo di: ${days} giorni, ${hours} ore e ${minutes} minuti`);
            else
                console.error(json.message);
        })
        .catch(err => console.error('Failed to travel in time:', err));

        setDays(''); // Resetta l'input


        // (TEST) richiedo data dal server
        fetch('http://localhost:5000/api/timeMachine/date', {
            method: 'GET',
            credentials: 'include',
        })
        .then(response => response.json())
        .then(json => {
            alert(`ora la data è: ${json.date}`);
        })
        .catch(err => console.error('Failed to get new date from server:', err));
    };

    const reset = (e) => {
        e.preventDefault();

        fetch('http://localhost:5000/api/timeMachine/reset', {
            method: 'PUT',
            credentials: 'include',
        })
        .then(response => response.json())
        .then(json => {
            if (json.success)
                alert(`data resettata al valore normale`);
            else
                console.error(json.message);
        })
        .catch(err => console.error('Failed to reset time:', err));


        // (TEST) richiedo data dal server
        fetch('http://localhost:5000/api/timeMachine/date', {
            method: 'GET',
            credentials: 'include',
        })
        .then(response => response.json())
        .then(json => {
            alert(`ora la data è: ${json.date}`);
        })
        .catch(err => console.error('Failed to get new date from server:', err));
    };

// PUSH NOTIFICATIONS
const publicVapidKey = 'BCYGol-mf-Dw5Ns46eA-yK5XgtF0sPGloXOjHLzaqA3RhsO9BONM-D1LNA7-iPHD-eY9KWb_7xD7mV12WfVwE2c';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

const handleSubscribe = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) { // serviceWorker = registra lo script di background | PushManager = crea il "canale" per inviare notifiche 
      try {
        // 1. Richiesta permesso all'utente
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          alert('Permesso negato!');
          return;
        }

        // 2. Registrazione Service Worker
        const register = await navigator.serviceWorker.register('/sw.js', { // registra service worker (salvato in public)
          scope: '/', // scope = tutto il sito
        });

        // 3. Iscrizione al Push Manager
        const subscription = await register.pushManager.subscribe({
          userVisibleOnly: true, // le mostra all'utente (obbligatorio)
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey), // public key per riconoscere server
        });

        // 4. Invio iscrizione al server
        await fetch('http://localhost:5000/api/pushNotifications/subscribe', {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify(subscription),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        alert('Notifiche attivate!');
      } catch (err) {
        console.error('Errore iscrizione:', err);
      }
    } else {
      alert('Il browser non supporta le notifiche push.');
    }
};

const receiveNotification = async () => {
  console.log("prova");
  await fetch('http://localhost:5000/api/pushNotifications/notify', {
    method: 'PUT',
    credentials: 'include',
  });
}

    return(
        <>
            <header>VIAGGIA NEL TEMPO</header>
            
            <div>
                <form onSubmit={submit}>
                    <input
                    name="days"
                    type="number"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    />
                    <label for="days"> giorni</label>
                    <br />

                    <input
                    name="hours"
                    type="number"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    />
                    <label for="hour"> ore</label>
                    <br />

                    <input
                    name="minutes"
                    type="number"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    />
                    <label for="minutes"> minuti</label>
                    <br />

                    <button onClick={submit}>Invia</button>

                    <button onClick={reset}>Resetta</button>
                </form>
            </div>

            <div>
                <h1>Notifiche Push in React</h1>
                <button onClick={handleSubscribe}>Attiva Notifiche</button>
                <button onClick={receiveNotification}>Ricevi Notifica</button>
            </div>

        </>
    )
}

export default TimeMachine;