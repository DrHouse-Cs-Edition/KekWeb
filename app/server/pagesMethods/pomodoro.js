const { request } = require("http");
const Pomodoro = require ("../mongoSchemas/PomodoroSchema.js");


//*SAVE POMODORO SETTINGS
exports.saveP = async function (req, res){
    const newPomodoroBody = req.body;
    newPomodoroBody.user = req.user; // salvo id dell'utente
    try{
        Pomodoro.find({title: newPomodoroBody.title, user:request.user}, {projection : {title : 1}}) // cerco se esiste già pomodoro creato dall'utente con stesso nome
        .then(result => {
            if(result.length){
                res.status(400).json({
                    success : false,
                    message : "Pomodoro already exists",
                })
                //throw new Error("Pomodoro duplicate", 400);
            }else {
                Pomodoro.create(newPomodoroBody);
                res.status(200).json({
                    success : true,
                    message : "Pomodoro saved succesfully"
                });
            }
        })
    }catch(e){
        console.log("pomodoro.js->saveP ERRORL: ", e);
    }
}