const express = require("express")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const dotenv = require("dotenv")
const User = require("./models/UserModel")
const Wallet = require("./models/WalletModel")
const Transaction = require("./models/TransactionModel")
const { Authorization, validateRegister } = require("./middlewares/userAuthorization")
const { handleLogin, handleSignIn, handleTransaction, handleViewBalance, handleTransactionHistory } = require("./controllers/userContollers")


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

app.post("/sign-Up",validateRegister, handleSignIn)

app.post("/login", handleLogin)

app.post("/transferlogic",Authorization, handleTransaction)

// Milestone 1: User Authentication & Wallet Setup




// 2. Auto-create a wallet on user registration.

// 3.Setup MongoDB schemas: User and Wallet.


// Milestone 2: Money Transfers

// 1.Add money transfer logic between wallets.


// 2.Create Transaction schema to log each transfer.



// 3.Validate balances before transfers.



// Milestone 3: Wallet & Transaction History



// GET endpoint for viewing wallet balance.


app.get("/viewingwalletbalance/:userId", Authorization, handleViewBalance )

// GET endpoint to list past transactions.

app.get("/list-past/transactions/:userId", Authorization, handleTransactionHistory)


// Ensure authentication middleware is applied.






