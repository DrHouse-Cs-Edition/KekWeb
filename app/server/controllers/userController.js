const path = require ('path');
const Users = require ("../mongoSchemas/UserSchemas.js");
const jwt = require("jsonwebtoken");
const tokenSchema = require("../mongoSchemas/RTokenSchema.js")
require("dotenv").config();

const JWT_KEY = "004b7831a2f90448b614e40de30e2b3c"; // 32 caratteri

exports.login = async function (req, res){
    let {username, password} = req.body;
    try{ 
        const result = await Users.find({username : username, password : password}, {username : 1, password : 1})
        if(result.length){
            const token = jwt.sign({username : username, id: result[0]._id}, JWT_KEY);

            tokenSchema.create({username, token : token});

            res.cookie("accessToken", token, {
                httpOnly: true,
                sameSite: "strict",
            });
            res.status(200).json({
                message : "login successful",
                success: true,
                token: token
            })
        }else{
            res.status(401).json({
                message: "Invalid username or password",
                success: false
            })
        }
    }
    catch(e){
        console.log("error in login ", e);
    }
}

exports.registration = async function (req, res){
    let reqBody = req.body;
    let {username, password} = reqBody;

    try{
        const result = await Users.find({username : username})
        if(result.length){
            res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }else{
            Users.create(reqBody);
            res.json({
                success: true,
                message: "User created successfully"
            })
        } 
    }catch(e){
        console.log("error creating a new User: ", e);
    }
}

exports.authToken = function (req, res, next){ // middleware
    const token = req?.cookies.accessToken;
    if (!token){
        return res.status(401).json({ message: "Effettua il login!" });
    }

    jwt.verify(token, JWT_KEY, (err, decoded) => {
        if(err)
            return res.status(403).json({
                success: false,
                message: "Sessione scaduta o token invalido"
            });
        // salvare nome utente e id per API
        req.user = decoded.id; // Aggiunge username alla req passata dopo middleware
        }
    );
    next(); 
}

exports.logout = function (req, res){
    const token = req?.cookies.accessToken;
    if (!token)
        return res.send().json({ message: "Connessione già scaduta" });

    jwt.verify(token, JWT_KEY, (err, decoded) =>{ // deduco l'utente che cerca di fare il logout (decoded.username)
        tokenSchema.deleteOne({username : decoded.username})
        .then(result => {
            if(result.length === 0)
                res.status(403).json({
                    success: false,
                    message: "no token for the username found"
                })
            else{
                // faccio eliminare i cookies al client
                res.clearCookie("accessToken");
                res.clearCookie("refreshToken");
                
                res.status(200).json({
                    success: true,
                    message: "You have been logged out"
                })
            }
        })
    });
}

exports.userData = function (req, res){
    //*function uses request parameters for sending desired user data to client. Request tpye: GET
    const query = req.query;
    Users.findById(req.user).lean()
    .then(result => {
        const email = query.email ? result.email : null; // se la query richiede il valore-> lo inserisco, else null
        const bio = query.bio ? result.bio : null; 
        const birthday = query.birthday ? result.birthday : null;
        const name = query.name ? result.name : null;
        const surname = query.surname ? result.surname : null;
        const picture = query.picture ? result.picture : null;
        const notifications = query.notifications ? result.notifications : null;
        res.status(200).json({
            success: true,
            email : email,
            bio : bio, 
            birthday : birthday, 
            name : name, 
            surname : surname,
            picture : picture,
            notifications: notifications, // valore
        })
    })
}

exports.updateData = function (req, res){
    //TODO funzione da implementare
    const body = req.body;
    if(u){
        Users.updateOne({username : body.username}, { $set : body} ).then(result => {
            res.status(200).json({
                success : true,
                message : "User data updated"
            })
        })
    }else{
        res.status(403).json({
            success : false,
            message : "user not found for update"
        })
    }
}

exports.updateDataV2 = function (req, res){
    const body = req.body;
    const {username, email, bio, birthday, name, surname,  picture, pictureTile} = body;
    try {
        Users.findOne({username : username}).then((u)=>{
        if(u){
            u.username = username;
            u.email = email;
            u.bio = bio;
            u.birthday = birthday;
            u.name = name;
            u.surname = surname;
            u.picture = picture;
            u.pictureTile = pictureTile;
            u.save().then(result => {
                res.status(200).json({
                    success : true,
                    message : "User data updated"
                    })
            })
        }else{
            res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
    })} catch (error) {
        res.status(400).json({
            success: false,
            message: "general error in user data update"
        })
    }
}

exports.updateNotificationMethod = async function (req, res){
    const userId = req.user;
    try {
        await Users.findByIdAndUpdate(userId,{ notifications: req.body.notifications });
        res.status(200).json({
            success : true,
            message : "Preferenza notifiche aggiornata"
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Errore impostando preferenza notifiche"
        })
    }
}