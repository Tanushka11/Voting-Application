const mongoose = require("mongoose")
// const bcrypt = require('bcrypt');

const candidateSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    age:{
        type: Number,
        required: true
    },
    PartyName:{
        type: String,
        required: true
    },
    votes :[
        {
            user : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
            },
            votedAt: {
                type: Date,
                default: Date.now()
            }
        }
    ],
    voteCount: {
        type: Number,
        default: 0
    }

    
})


const Candidate = mongoose.model('Candidate', candidateSchema)
module.exports = Candidate


