const express =require ("express");
const { validateRegister, Authorization } = require("../middlewares/userAuthorization");
const { handleSignIn, handleLogin, handleTransaction, handleViewBalance, handleTransactionHistory, verifyOTP, requestPasswordReset, resetPassword } = require("../controllers/userContollers");


const router = express.Router()

// 1.Implement user registration and login with JWT.

router.post("/sign-Up",validateRegister, handleSignIn)

router.post("/login", handleLogin)

router.post("/transferlogic",Authorization, handleTransaction)

// Milestone 1: User Authentication & Wallet Setup




// 2. Auto-create a wallet on user registration.

// 3.Setup MongoDB schemas: User and Wallet.


// Milestone 2: Money Transfers

// 1.Add money transfer logic between wallets.


// 2.Create Transaction schema to log each transfer.



// 3.Validate balances before transfers.



// Milestone 3: Wallet & Transaction History



// GET endpoint for viewing wallet balance.



router.get("/viewingwalletbalance/:userId", Authorization, handleViewBalance )

// GET endpoint to list past transactions.

router.get("/list-past/transactions/:userId", Authorization, handleTransactionHistory)


// Ensure authentication middleware is applied.

router.post("/verify-otp", verifyOTP);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);


module.exports = router



