const express = require("express")
const app = express();
const db = require('./db')
require('dotenv').config();



const bodyParser = require('body-parser');
app.use(bodyParser.json()) 
const PORT = process.env.PORT || 3000

app.get("/",(req,res)=>{
    res.send("Lets Vote!!!!!")
})

const userRoutes = require("./Routes/userRoutes")
app.use("/user",userRoutes)

const candidateRoutes = require("./Routes/candidateRoutes");
const { message } = require("prompt");
app.use("/candidate",candidateRoutes)


app.listen(PORT, ()=>{
    console.log("LISTNING ON PORT : " ,PORT)
});
