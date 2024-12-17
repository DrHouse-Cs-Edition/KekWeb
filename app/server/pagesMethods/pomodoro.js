const mongoose = require ('mongoose');
const path = require ('path');
const {Pomodoro} = require ("../mongoSchemas.js");

//*SAVE POMODORO SETTINGS
exports.saveP = async function (req, res){   
    const tmpPomodoro = new Pomodoro ({
        user: req.body.user,
        title : req.body.title,
        study : req.body.study,
        break : req.body.break,
        cycles : req.body.cycles,
    })

    try{
        await tmpPomodoro.save();
        res.json({
            success : true,
            message : "pomodoro saved succesfully"
        })
    }catch(e){
        console.log("addPomodoroSettings was unsuccesfull");
        res.json({
            success : false,
            message : "error saving pomodoro"
        })
    }
}