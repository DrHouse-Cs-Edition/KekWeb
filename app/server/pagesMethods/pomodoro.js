const { request } = require("http");
const Pomodoro = require ("../mongoSchemas/PomodoroSchema.js");
const Event = require ("../mongoSchemas/Event.js");
const { title } = require("process");
const { accessSync } = require("fs");


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

exports.getP = async function (req, res){
    Pomodoro.find({}).lean()
    .then(result => {
        try{
            res.status(200).json({
                success : true,
                message : "Pomodoros sent succesfully",
                body : result
            })
        }
        catch(e) {
            res.status(400).json({
                success : false,
                message : "Error retrieving Pomodoro",
            })
        }
    })
}

exports.renameP = async function (req, res){
    const body = req.body;
    console.log("renaming server side to ", body.title, " and id ", body.id);
    Pomodoro.findByIdAndUpdate(body.id,{
        title: body.title,
        studyTime: body.studyTime,
        breakTime: body.breakTime,
        cycles : body.cycles
    }, {new: false})
    .then( (e)=>{
        console.log(e);
    })
    res.json({
        success: true,
        message: "Pomodoro aggiornato"
    });
}

exports.deleteP = async function (req,res) {
    console.log("deleting id ", req.params.id);
    Pomodoro.deleteOne({_id : req.params.id}).then(result => console.log(result))
    res.json({
        success: true,
        message: "Pomodoro eliminato"
    });
}


exports.subCycles = async function (req, res){
    const {id, cycles} = req.body;
    Pomodoro.findById(id)
    .then(async p => {
        if(p.cycles == 1)
        {
            let foundEvent =  await Event.deleteMany({"pomodoro" : p.title});
            console.log("found ", foundEvent);
            Pomodoro.findByIdAndDelete(id)
            .then(res.json({ success: true, message: "Pomodoro eliminato"}))
        }else if (p.cycles > 1){
            p.cycles --;
            return p.save() // Save the updated document
            .then((updatedP) => {
            res.status(200).json(updatedP);
          })
        }else{
            console.log("error in subCycles");
        }
    })
}
//*ALLOWS FOR UPDATES OF SINGLE FIELDS
//fields without a value will be kept to the previous values
exports.updateP = function (req, res ){
    const body = req.body;
    console.log(
        body.studyTime ? "caterpillar" : "magno"
    );
    //function updates the fields of the body based on wheter they have been provided or not
    //id is mandatory
    const {id, title, studyTime, breakTime, cycles} = body;
    Pomodoro.findById(id)
    .then(p =>
        {
            if(p){
                title ? p.title=title : "";
                studyTime ? p.studyTime=studyTime : "";
                breakTime ? p.breakTime=breakTime : "";
                cycles ? p.cycles=cycles : "";
                console.log(p);
                p.save() // Save the updated document
                .then(
                    res.status(200).json({
                        success: true,
                        message: "Pomodoro updated",
                    })
                )
            }else{
                res.status(400).json({
                    success: false,
                    message: "Pomodoro non trovato",
                })
            }
        }
    )
}
