const express = require ("express");
const app = express();

const PORT = process.env.PORT || 4444;

app.listen(PORT, () => {
    console.log('running on port ${PORT}' );
});

app.get("./src/index.js", (request, response) => {
    console.log("login to src done succesfully")
});