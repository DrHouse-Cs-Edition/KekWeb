import style from './Home.module.css';
import ListaEventiGiornalieri from '../components/listeEventi/ListaEventiGiornalieri';
import TodoList from '../components/toDoList/TodoList';

function Home(){
    return(
        <div className={style.container}>
            <div className={style.layout}>
                <div className={style.eventsSection}>
                    <ListaEventiGiornalieri />
                </div>
                <div className={style.todoSection}>
                    <TodoList />
                </div>
            </div>
        </div>
    )
}
export default Home;
