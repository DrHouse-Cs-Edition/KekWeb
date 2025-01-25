const Pomodoro = require ("../mongoSchemas/PomodoroSchema.js");
const { error } = require('console');
const { exitCode } = require('process');

//*SAVE POMODORO SETTINGS
exports.saveP = async function (req, res){
    const newPomodoroBody = req.body;
    console.log(newPomodoroBody);
    try{
        Pomodoro.find({title: newPomodoroBody.title}, {projection : {title : 1}})
        .then(result => {
            console.log("result is ", result);
            if(result.length){
                console.log("Pomodoro already exists : ", result);
                res.json({
                    success : false,
                    message : "Pomodoro already exists",
                })
                //throw new Error("Pomodoro duplicate", 400);
            }else {
                console.log("Pomodoro does not exist");
                Pomodoro.create(newPomodoroBody);
                res.json({
                    success : true,
                    message : "Pomodoro saved succesfully"
                });
            }
        })
    }catch(e){
        console.log("pomodoro.js->saveP ERRORL: ", e);
    }
}