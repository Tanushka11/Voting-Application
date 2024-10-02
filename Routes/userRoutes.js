const express = require("express");
const router = express.Router();
const User = require('../Models/user');
const {jwtAuthMiddileware, generateToken } = require('../jwt');


router.post("/signup", async (req,res)=>{
    try{
        const data = req.body; // coming from body-parser
           // Check if there is already an admin user
           const adminUser = await User.findOne({ role: 'admin' });
           if (data.role === 'admin' && adminUser) {
               return res.status(400).json({ error: 'Admin user already exists' });
           }
   
           // Check if a user with the same Aadhar Card Number already exists
           const existingUser = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
           if (existingUser) {
               return res.status(400).json({ error: 'User with the same Aadhar Card Number already exists' });
           }
    
    const newUser = new User(data);
    const response = await newUser.save();
    console.log("data saved")

    const payload = {
        id: response.id
    }
    const token = generateToken(payload);
    console.log("token is : ", token)
    res.status(200).json({response : response, token : token})
    }
    catch(err){
       res.status(404).json(console.log("error occured : ", err))
    }
   })

   // login route
   router.post("/login", async(req,res) => {
    try{
        // extract username and password from body
        const {AadharCardNumber, password} = req.body;

        // find user by aadhar card number
        const user = await User.findOne({AadharCardNumber: AadharCardNumber});

        // if user do not exist or password do not match
        if(!user || !(await user.comparePassword(password)) ){
            return res.status(401).json({error : "Invalid userame or password"})
        }
        // generate token
        const payload = {
            id: user.id
        }
        const token = generateToken(payload);
         // return token as response
          res.json({token})
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
   })
   
   // profile route
   router.get("/profile",jwtAuthMiddileware, async(req,res,next) =>{
    try{
        const userdata = req.user
        const userId = userdata.id
        const user = await Person.findById(userId)
        res.status(200).json({user})
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
   })


    router.put("/profile/password" , jwtAuthMiddileware, async (req,res) => {
        try{
            const userId = req.user // extract the id from the token
            const {cuurPassword, newPassword} = req.body

            const updatedPersonData = req.body

            // find user by user id
        const user = await User.findById(userId);

        // if password do not match return error
        if(!user || !(await user.comparePassword(cuurPassword)) ){
            return res.status(401).json({error : "Invalid userame or password"})
        }

        // update user's password
        user.password = newPassword
        await user.save();

        console.log("password updated")

        res.status(200).json({message:"password updated"});
       

        }catch(err){
            console.log(err);
            res.status(500).json("internal server error")
        }
    })

  

    module.exports = router;