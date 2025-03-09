const Pomodoro = require ("../mongoSchemas/PomodoroSchema.js");


//*SAVE POMODORO SETTINGS
exports.saveP = async function (req, res){
    const newPomodoroBody = req.body;
    try{
        Pomodoro.find({title: newPomodoroBody.title}, {projection : {title : 1}})
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