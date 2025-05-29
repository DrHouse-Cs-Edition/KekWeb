import React, { useState } from 'react';

function TimeMachine(){
    const [days, setDays] = useState(0);

    const submit = (e) => {
        e.preventDefault();

        fetch('http://localhost:5000/api/timeMachine/travel', {
            method: 'PUT',
            credentials: 'include',
            headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({days: days})
        })
        .then(response => response.json())
        .then(json => {
            if (json.success)
                alert(`Hai hai viaggiato nel tempo di: ${days} giorni`);
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

    return(
        <>
            <header>VIAGGIA NEL TEMPO</header>
            
            <div>
                <form onSubmit={submit}>
                    <input
                    type="number"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    placeholder="Inserisci un numero"
                    />
                    <button type="submit">Invia</button>
                </form>
            </div>

        </>
    )
}

export default TimeMachine;