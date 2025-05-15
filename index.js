const express = require("express")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const dotenv = require("dotenv")
const User = require("./UserModel")
const Wallet = require("./WalletModel")
const Transaction = require("./TransactionModel")


dotenv.config()

const app = express()

app.use(express.json())



const PORT = process.env.PORT || 8000




mongoose.connect(process.env.MONGODB_URL)
   .then(() => {
      console.log("mongoDb connected successfully...");
      app.listen(PORT, () => {
         console.log(`Server started running on Port ${PORT}`)
       


      }
      )
   }
   )

// 1.Implement user registration and login with JWT.

app.post("/sign-Up", async (req, res) => {
   try {

      const { email, firstName, password, lastName } = req.body

      const existingUser = await User.findOne({ email })
      if (existingUser) {
         res.status(404).json({ message: "User already exist" })
      }

      if (!email) {
         return res.status(404).json({ message: "please insert your email" });

      }
      if (password.length < 6) {
         return res.status(400).json({ message: "password should be a minimum of 6 char" })
      }


      if (!password) {
         return res.status(404).json({ message: "please insert password" })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const newUser = new User({ email, firstName, password: hashedPassword, lastName })



      await newUser.save()


      const wallet = await Wallet.create({
         walletRef: newUser?._id,
         balance: 0,

      })


      res.json({
         newUser: { email, firstName, lastName, hashedPassword, wallet }

      })


   } catch (error) {
      res.json({ message: error.message })
   }

})







app.post("/login-In", async (req, res) => {
   try {
      const { email, password } = req.body
      const user = await User.findOne({ email }).select("+password")
      if (!user) {
         return res.status(404).json({ message: "User dosenot exist" })
      }


      const isMatch = await bcrypt.compare(password, user?.password)
      if (!isMatch) {
         return res.status(404).json({ message: "incorrect email or passWord" })
      }



      const accessToken = jwt.sign(
         { id: user?._id },
         // user
         process.env.ACCESS_TOKEN,
         { expiresIn: "5m" }

      )
      const refreshToken = jwt.sign(
         { id: user?._id },
         // user
         process.env.REFRESH_TOKEN,
         { expiresIn: "5m" }

      )

      const { password: _, ...userWithoutPassWord } = user.toObject()

      const userWallet = await Wallet.findOne({
         walletRef: user?._id

      })



      res.status(200).json({
         message: "user login success",
         accessToken,
         user: userWithoutPassWord,
         userWallet,
         refreshToken,



      })

      // Generate a token using jsonwebtoken
      // Token means , user is authenticated 
      // Login token: Access token
      // registration :Active token

   } catch (error) {

      res.status(404).json({ message: error.message })
   }

}
)



// Milestone 1: User Authentication & Wallet Setup




// 2. Auto-create a wallet on user registration.

// 3.Setup MongoDB schemas: User and Wallet.






// working on transaction

app.post("/transaction-details",async(req,res)=>{


   try {
      let {receiver, amount,type} =req.body


// validate the input
if (!["credit" , "debit"].includes(type)){
   return res.status(400).json({
message: "invalid trasaction type"

   })
}


if (!mongoose.Types.ObjectId.isValid(receiver)) {
  return res.status(400).json({ message: "Invalid receiver ID" });
}

const wallet = await Wallet.findOne({walletRef:receiver })

if (!wallet){
 return  res.status(404).json({
message: "wallet not found"

   });
  
}

if (type === "credit"){
   wallet.balance += amount;
}
else if(type === "debit"){
if(wallet.balance < amount){
   return res.status(400).json({ message:" insufficient bal, transaction not completed" })
  
}
   
wallet.balance -=amount;
}

await wallet.save()


const transaction = await new Transaction({receiver, amount,type})

await transaction.save();

   res.status(200).json({
message: `Transaction successfull, new balance is : ${wallet.balance}`
, transaction
   })


   } catch (error) {
    
      res.status(500).json({message:error.message})
    
   }


   

})








