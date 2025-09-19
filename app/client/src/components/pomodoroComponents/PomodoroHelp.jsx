import style from "./PomodoroHelp.module.css"
import { useState } from "react";

const Help = ()=>{
    const [show, setShow] = useState(0);

    return(
        <div className={style.HelpDiv}>
            <button className={style.icon} onClick={()=>{setShow(1 ^ show)}}>
                ?
            </button>
            <div className={style.text} style={{display : show ? "grid" : "none"}}>
                <h4 className={style.creaH4}>Creare un pomodoro senza salvare</h4>
                <div className={style.creaPomodoro}>
                    <ol>
                        <li>clicca su "crea/modifica pomodoro"</li>
                        <li>
                            Se in formato normale
                            <ol>
                            <li>inserisci durata studio, durata pausa e cicli</li>
                        </ol>
                            Se in formato tempo totale
                            <ol>
                                <li>inserisci il tempo a disposizione</li>
                                <li>clicca su "vedi impostazione" </li>
                                <li>itera le impostazioni disponibili con il tasto "prossima impostazione che compare al suo posto</li>
                            </ol>
                        </li>
                        <li>clicca su "scegli questa impostazione"</li>
                        <li>clicca su "Pronti allo studio" ed avvia il pomdoro</li>
                    </ol>
                </div>
                <h4 className={style.salvaH4}>Salvare un pomodoro</h4>
                <div className={style.salvaPomodoro}>
                    <ol>
                        <li>scegli un titolo per il pomodoro</li>
                        <li>ripeti i passi per creare un pomodoro</li>
                        <li>clicca su  "Salva il pomodoro"
                            <ul>
                                <li>
                                    Se compare "Aggiorna il pomodoro" si sta modificando un altro pomodoro. In tal caso clicca su "Ripristina pomodoro" per crearne uno nuovo
                                </li>
                            </ul>
                        </li>
                    </ol>
                </div>
                
                <h4 className={style.modificaH4}>Modificare un pomodoro</h4>
                <div className={style.modificaPomodoro}>
                    <ol>
                        <li>Seleziona un pomodoro da aprire dalla lista in basso</li>
                        <li>Segui i passi per creare un pomodoro senza salvare</li>
                        <li>Impostato il nuovo pomodoro, clicca su "Aggiorna il pomdoro"</li>
                    </ol>
                </div>
                
                <h4 className={style.cancellaH4}>Cancellare un pomodoro</h4>
                <div className={style.cancellaPomodoro}><ol><li>Clicca il tasto rosso "cancella" sotto ogni pomodoro nella lista in basso</li></ol></div>

                <h4 className={style.scegliH4}>Scegliere un pomodoro</h4>
                <div className={style.scegliPomodoro}><ol><li>Clicca sul grafico a torta del pomodoro scelto dalla lista in basso</li></ol></div>

                <h4 className={style.aggiungiH4}>Aggiungere un pomodoro nel calendario</h4>
                <div className={style.aggiungiPomodoro}><ol>
                    <li>Accedi alla pagina del calendario</li>
                    <li>Scegli il giorno</li>
                    <li>dal menù a tendina, scegli il tipo di evento "pomodoro"</li>
                    <li>scegli il pomodoro dal menù a tendina comparso</li>
                    <li>clicca su "salva"</li>
                </ol></div>
            </div>
        </div>
    )
}

export default Help;