const express = require('express')
const { UserModal } = require('../Models/UserModal')
require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { BlacklistModel } = require('../Models/BlackListModal')
const saltRounds = parseInt(process.env.saltrounds) || 10;
const userRouter = express.Router()


userRouter.post("/signup", async (req,res) =>{
   try{
     const {name,username,email,password,phone} = req.body
     
        if(!name || !username || !email || !password || !phone){
           res.status(200).send({message:"All Input fields are required!"})
        }
        else{
            const existingUser = await UserModal.findOne({email})
            
            if(existingUser){
                res.status(200).send({message:"User with this Email Already Exists!"})
            }
            else{
                bcrypt.hash(password, saltRounds, async function(err, hash) {
                    if(err){
                        console.log(err.message)
                        res.status(500).send({message:"An Error Occured",error:err})
                    }else{
                       const newUser = new UserModal({name,username,email,password:hash,phone})
                       await newUser.save()
                       res.status(201).send({ message: "User created successfully" });
                    }
                });
            }
        }

    }
    catch(err){
        console.log(err)
        res.status(500).send({ message: "Internal Server Error" });
    }  
})

userRouter.post("/signin", async (req,res) =>{
  try{
    const {email,password} = req.body
    if(!email || !password){
        res.status(200).send({message:"All Input fields are required!"})
     }else{
        const user = await UserModal.findOne({email})
        if(!user){
            res.status(202).send({message:"User Does Not Exist!"})
        }else{
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                const token = jwt.sign({ user }, process.env.SecretKey,{ expiresIn: 1*60 });
                res.status(200).send({ message: "Login successful!", token });
            } else {
                res.status(200).send({ message: "Incorrect password!" });
            }
        }
     }

  }
  catch(err){
    console.log(err)
    res.status(500).send({ message: "Internal Server Error" });
} 
})


userRouter.get("/logout", async (req, res) => {
    const token = req.headers.authorization;
    try {
      if (token) {
        await BlacklistModel.updateMany({}, { $push: { blacklist: [token] } });
        res.status(200).json({ msg: "User has been logged out" });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });


module.exports= {
    userRouter
}