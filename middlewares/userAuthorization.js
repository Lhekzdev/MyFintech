 const jwt = require ("jsonwebtoken");
const User = require("../models/UserModel");
 
const validateRegister =  (req, res, next)=>{ 
    try {
         const  { email, password, firstName, lastName, state } = req.body

const errors= []

if(!email){
    errors.push("please add email")
}

if(!password){
    errors.push("please enter password")
}

if (errors.length>0){
  return  res.status(400).json({
        message: errors,
    })
}


next()
    } catch (error) {
        res.status(404).json({
            message: error,
        })
    }

 
 }


 const Authorization =async(req,res,next)=>{

const token = req.header("Authorization")
if(!token){
    res.status(401).json({
        message: "please Login!"
    })
}

console.log(token);

const splitToken = token.split(" ")
console.log(splitToken);
const neededSplit =splitToken[1]
console.log(neededSplit);
const decodeToken = jwt.verify(neededSplit,`${process.env.ACCESS_TOKEN}`)
if (!decodeToken){
  return  res.status(401).json({
        message:"Please Login"
    })
}

const user = await User.findById(decodeToken.id)

if (!user){
  return  res.status(401).json({
        message:"User not found"
    })


}
console.log(user);

req.user = user
next()
 }


 module.exports ={
validateRegister,
    Authorization
 }