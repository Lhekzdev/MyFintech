
const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
    {
        email: { type: String, required:true},
        firstName: { type: String, default:"" },
        password: { type: String, required:true ,select:false},
        lastName: { type: String , default:""},
        
    },
     {timestamps:true}

    
)

const User = new mongoose.model("User", userSchema)

module.exports = User




