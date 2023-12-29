const express = require("express");
require('dotenv').config();
const cors = require('cors')
const {connection} = require("./Config/db");
const { userRouter } = require("./Routes/userRoutes");

const app = express();
app.use(cors())
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use("/users",userRouter)

app.get("/", (req,res)=>{

    res.status(200).send({message:"Welcome to the backend!"})
})






app.listen(PORT,async () => {
    try{
        await connection
        console.log("connected to Database")
        console.log(`App is listening on port ${PORT}`);
    }
    catch(err){
         console.log(err)
    }
    
});




