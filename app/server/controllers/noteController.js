const Note = require('../mongoSchemas/Note.js');

const saveNote = async (request,response)=>{ // app.metodo('url_aggiuntivo') gestisce richiesta fatta all'url del server + url_aggiuntivo
    //                                                       es: 'localhost3000/api/notes/save' 
    const notaInput = request.body;
    const notaDB = new Note({
        // user: note.user, = possibile altro parametro
        title: notaInput.title,
        categories: notaInput.categories,
        text: notaInput.text,
        createdAt: notaInput.createdAt,
        lastModified: notaInput.lastModified
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
            id: notaDB._id,
            message: "Nota salvata"
        });
    }
    catch(e){
        console.log(e.message);
        response.json({
            success: false,
            message: "Errore durante il salvataggio sul DB: "+e,
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
            categories: notaInput.categories,
            text: notaInput.text,
            lastModified: notaInput.lastModified,
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
            message: "Errore durante il salvataggio sul DB: "+e,
        });
    }

}


const removeNote = async (request,response)=>{
    id = request.params.id;

    try{
        await Note.deleteOne({_id: id});
        response.json({
            success: true,
            message: "Nota eliminata",
        });
    }
    catch(e){
        console.log(e.message);
        response.json({
            success: false,
            message: "Errore durante la rimozione dal DB: "+e,
        });
    }

}


const loadNote = async (request,response)=>{
    id = request.params.id;

    try{
        const nota = await Note.findById(id).lean(); // lean() fa ritornare oggetti js anziché documenti mongoose (più veloce)
        // annota: find ritorna un ARRAY ma findById solo un elemento
        // Note.find({user:"Gino"})    =    ritornrebbe le note scritte dall'urtente Gino
        response.json({
            success: true,
            id: nota.id,
            tilte: nota.title,
            categories: nota.categories,
            text: nota.text,
            createdAt: nota.createdAt,
            lastModified: nota.lastModified,
        });
    }
    catch(e){
        response.json({
            success: false,
            message: "Errore durante il caricamento dal DB: "+e,
        });
    }

}


const allNote = async (request,response)=>{
    const sort = request.query.sort || false;

    try {
        let listaNote;
        if(!sort){
            listaNote = await Note.find({}).lean(); // Prende tutte le note (come oggetti)
        }
        else{
            switch (sort){ // in mongoose: 1 = crescente  e  -1 = decrescente
                case "asc":
                    listaNote = await Note.find({}).sort({ title: 1 }).collation({ locale: 'it'}).lean(); // collation = per definire come ordinare (regole lingua it)
                    break;
                case "desc":
                    listaNote = await Note.find({}).sort({ title: -1 }).collation({ locale: 'it'}).lean(); 
                    break;
                case "date":
                    listaNote = await Note.find({}).sort({ lastModified: -1 }).lean(); // da piu recente
                    break;
                case "length":
                    listaNote = await Note.aggregate([ // query avanzata che usa l'Aggregation Pipeline
                        {
                            $addFields: { // aggiungiamo campi temporanei (qui solo 1)
                                stringLength: { $strLenCP: "$text" } // $strLenCP è un aggregation operator che calcola lunghezza stringa
                            }
                        },
                        {
                            $sort: { stringLength: -1 }
                        }
                    ])
                    break;
            }
            
        }
        
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
            message: "Errore durante il caricamento dal DB: "+e,
        });
    }

}

module.exports = { saveNote, updateNote, removeNote, loadNote, allNote };