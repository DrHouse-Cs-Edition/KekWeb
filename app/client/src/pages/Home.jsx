import style from './Home.module.css';
import ListaEventiGiornalieri from '../components/listeEventi/ListaEventiGiornalieri';
import TodoList from '../components/toDoList/TodoList';
import PomodoroDisplayer from '../components/PomodoroDisplayer/PomodoroDisplayer'

function Home(){
    return(
        <div className={style.container}>
            <div className={style.layout}>
                <div className={style.eventsSection}>
                    <ListaEventiGiornalieri />
                </div>
                <div>
                    <PomodoroDisplayer/>
                </div>
                <div className={style.todoSection}>
                    <TodoList />
                </div>
            </div>
        </div>
    )
}
export default Home;
