const mongoose = require("mongoose")
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    age:{
        type: Number,
        required: true
    },
    email : {
        type: String,
    },
    mobileNumber:{
        type: String,
        required: true
    },
    work:{
        type: String,
    },
    AadharCardNumber : {
        type: Number,
        required: true
    },
    address:{
        type: String,
    },
    password:{
        type: String,
        required: true 
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    isVoted:{
        type : Boolean,
        default: false
    }
})

userSchema.pre('save', async function(next){
    const person = this;
    // generate hash password only if it has been modified
    if(!person.isModified('password')) return next();
    try{
        // hash password being generated
        const salt = await bcrypt.genSalt(10)

        // hash password    
        const hashedPassword = await bcrypt.hash(person.password,salt);
        person.password = hashedPassword;

        next();
    }catch(err){
        return next(err);
    }
})

userSchema.methods.comparePassword = async function(candidatePassword){
    try {
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch; 
    } catch (error) {
        throw err;
    }
}

const User = mongoose.model('User', userSchema)
module.exports = User


