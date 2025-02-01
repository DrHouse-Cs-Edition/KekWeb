import React, { useState, useEffect } from 'react';
//import Style from "./GetEvent.module.css";
import { useParams } from 'react-router-dom'; //per permettere di avere id come Parametro di percorso
import { useNavigate } from "react-router-dom";

import Calendario from '../components/calendario/Calendario.jsx';
import GetEvent from '../components/calendario/GetEvent.jsx';

function Calendar() {

    return(
        <>
            <Calendario>

            </Calendario>

            <GetEvent>

            </GetEvent>

        </>

    )

}

export default Calendar;