const User = require("../../models/UserModel")

const signInService = async(req,res)=>{

   const SignInSer =  await User.findOne({ email })
return  SignInSer 
 

}


module.exports ={
signInService

}


