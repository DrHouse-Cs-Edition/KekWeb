const Note = require('../mongoSchemas/Note.js');

const saveNote = async (request,response)=>{ // app.metodo('url_aggiuntivo') gestisce richiesta fatta all'url del server + url_aggiuntivo
    //                                                       es: 'localhost3000/api/notes/save' 
    const notaInput = request.body;
    const notaDB = new Note({
        // user: note.user, = possibile altro parametro
        title: notaInput.title,
        text: notaInput.text,
        date: notaInput.date,
        // user: 'aaaaaaaaaaaaaaaaaa', // se user è REQUIRED e non c'é il campo user o se l'_id non corrisoponde a quello di uno User nel server mongoDB dà errore
    });
    /*
    const user1 = new User({
        name: "Gino",
        password: "psw!", // per ora tipo String, poi vediamo cosa fanno le librerie "password1!" -> "2ashvd&%fewf&//°Lè&"
        email: "gino@io.com",
        bio: "sono Gino",
        birthday: note.date,
    });*/

    try{
        await notaDB.save(); // comunicazione con mongoDB
        response.json({
            success: true,
            id: notaDB._id, // può servire(?)
            message: "Note saved"
        });
    }
    catch(e){
        console.log(e.message);
        response.json({
            success: false,
            message: "Errore durante il salvataggio sul DB",
        });
    }

}


const updateNote = async (request,response)=>{
    const id = request.params.id;
    const notaInput = request.body;

    try{
        await Note.findByIdAndUpdate(id,{
            // user non va cambiato
            title: notaInput.title,
            text: notaInput.text,
            date: notaInput.date,
        });
        response.json({
            success: true,
            message: "Nota aggiornata"
        });
    }
    catch(e){
        console.log(e.message);
        response.json({
            success: false,
            message: "Errore durante il salvataggio sul DB",
        });
    }

}


const removeNote = async (request,response)=>{
    id = request.params.id;

    async function remove(id) { // Remove the file
        try{ 
            await Note.deleteOne({_id: id});
            response.json({
                success: true,
                message: "Note removed",
            });
        }
        catch(e){
            console.log(e.message);
            response.json({
                success: false,
                message: "Errore durante la rimozione dal DB",
            });
        }
    }
    remove(request.params.id);

}


const loadNote = async (request,response)=>{
    id = request.params.id;

    try{
        const nota = await Note.findById(id).lean(); // lean() fa ritornare oggetti js anziché documenti mongoose (più veloce)
        // nota: find ritorna un ARRAY ma non findById
        // Note.find({user:"Gino"})    =    ritornrebbe le note scritte dall'urtente Gino
        response.json({
            success: true,
            id: nota.id,
            title: nota.title,
            text: nota.text,
            date: nota.date,
        });
    }
    catch(e){
        console.log("errore load:" + e.message);
        response.json({
            success: false,
            message: "Errore durante il caricamento dal DB:"+e,
        });
    }

}


const allNote = async (request,response)=>{

    try {
        const listaNote = await Note.find({}).lean();  // Prende tutte le note (come oggetti)
        
        if (listaNote.length > 0) { // Se sono presenti delle note, le restituisce nel JSON
            response.json({
                success: true,
                list: listaNote, // Restituisce l'intero array di note
            });
        } else {
            response.json({
                success: false,
                message: "Nessuna nota trovata",
            });
        }
    } catch (e) {
        console.log(e.message);
        response.json({
            success: false,
            message: "Errore durante il caricamento dal DB",
        });
    }

}

module.exports = { saveNote, updateNote, removeNote, loadNote, allNote };