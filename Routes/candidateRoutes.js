const express = require("express");
const router = express.Router();
const Candidate = require("../Models/candidate");
const { jwtAuthMiddileware, generateToken } = require("../jwt");
const User = require("../Models/user");
const { message } = require("prompt");

// vote count 
router.get('/vote/count', async (req, res) => {
    try{
        // Find all candidates and sort them by voteCount in descending order
        const candidate = await Candidate.find().sort({voteCount: 'desc'});

        // Map the candidates to only return their name and voteCount
        const voteRecord = candidate.map((data)=>{
            return {
                party: data.PartyName,
                count: data.voteCount
            }
        });

        return res.status(200).json(voteRecord);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});


const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user.role === "admin";
  } catch (err) {
    return false;
  }
};

// post route to add a candidate
router.post("/", jwtAuthMiddileware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "user does not have admin role" });
    }
    const data = req.body; // coming from body-parser, assuming body contains candidate data

    const newCandidate = new Candidate(data);
    const response = await newCandidate.save();
    console.log("data saved");
    res.send(response);
  } catch (err) {
    res.status(404).json(console.log("error occured : ", err));
  }
});

router.put("/:candidateID", jwtAuthMiddileware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id)) {
      return res.status(404).json({ message: "user does not have admin role" });
    }
    const candidateID = req.params.candidateID; // extract the data from url parameter
    const updatedCandidateData = req.body;

    const response = await Candidate.findByIdAndUpdate(
      candidateID,
      updatedCandidateData,
      {
        new: true, //  return the updated document
        runValidators: true, // return mongoose validation
      }
    );
    if (!response) {
      return res.status(403).json({ error: "candidate not found" });
    }
    console.log(" candidate data updated");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json("internal server error");
  }
});
router.delete("/:candidateID", jwtAuthMiddileware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id)) {
      return res.status(403).json({ message: "user does not have admin role" });
    }
    const candidateID = req.params.candidateID; // extract the data from url parameter

    const response = await Candidate.findByIdAndDelete(candidateID);
    if (!response) {
      return res.status(404).json({ error: "candidate not found" });
    }
    console.log(" candidate deleted");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json("internal server error");
  }
});



// for voting
router.post('/vote/:candidateID', jwtAuthMiddileware, async (req, res)=>{
    // no admin can vote
    // user can only vote once
    
    candidateID = req.params.candidateID;
    userId = req.user.id;

    try{
        // Find the Candidate document with the specified candidateID
        const candidate = await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({ message: 'user not found' });
        }
        if(user.role == 'admin'){
            return res.status(403).json({ message: 'admin is not allowed'});
        }
        if(user.isVoted){
            return res.status(400).json({ message: 'You have already voted' });
        }

        // Update the Candidate document to record the vote
        candidate.votes.push({user: userId})
        candidate.voteCount++;
        await candidate.save();

        // update the user document
        user.isVoted = true
        await user.save();

        return res.status(200).json({ message: 'Vote recorded successfully' });
    }catch(err){
        console.log(err);
        return res.status(500).json({error: 'Internal Server Error'});
    }
});



// Get List of all candidates with only name and party fields
router.get("/", async (req, res) => {
  try {
    // Find all candidates and select only the name and party fields, excluding _id
    const candidates = await Candidate.find({}, "name party -_id");

    // Return the list of candidates
    res.status(200).json(candidates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
