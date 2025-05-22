const User = require("../models/UserModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Wallet = require("../models/WalletModel")
const Transaction = require("../models/TransactionModel")
const mongoose = require("mongoose")

const handleSignIn = async (req, res) => {
    try {

        const { email, firstName, password, lastName } = req.body



        if (!email) {
            return res.status(404).json({ message: "please insert your email" });

        }
        if (password.length < 6) {
            return res.status(400).json({ message: "password should be a minimum of 6 char" })
        }


        if (!password) {
            return res.status(404).json({ message: "please insert password" })
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(404).json({ message: "User already exist" })
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

}




// login

const handleLogin = async (req, res) => {

    {
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
                { expiresIn: "5h" }

            )
            const refreshToken = jwt.sign(
                { id: user?._id },
                // user
                process.env.REFRESH_TOKEN,
                { expiresIn: "5h" }

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



}


// transaction

const handleTransaction = async (req, res) => {

    {
        try {
            let
                { receiver, sender, type, amount } = req.body

            // Validate type
            if (!["credit", "debit"].includes(type)) {
                return res.status(400).json({ message: "Invalid transaction type" });
            }
            // Validate ObjectIds
            if (!mongoose.Types.ObjectId.isValid(receiver) || !mongoose.Types.ObjectId.isValid(sender)) {
                return res.status(400).json({ message: "Invalid receiver or sender ID" });
            }


            const findAuthUser = User.findById(sender)
            if (!findAuthUser) {
                return res.status(401).json({ message: "Sender not found" });
            }







            // Get receiver and sender wallets
            const receiverWallet = await Wallet.findOne({ walletRef: receiver });
            const senderWallet = await Wallet.findOne({ walletRef: sender });


            if (!receiverWallet || !senderWallet) {
                return res.status(404).json({ message: "Sender or receiver wallet not found" });
            }

            if (type === "debit") {
                // Deduct from sender
                if (senderWallet.balance < amount) {
                    return res.status(400).json({ message: "Insufficient balance" });
                }

                senderWallet.balance -= amount;
                receiverWallet.balance += amount;


            } else {

                receiverWallet.balance += amount;
            }


            await senderWallet.save();
            await receiverWallet.save();





            const transaction = await new Transaction({ receiver, sender, amount, type })

            await transaction.save()

            res.status(200).json({
                message: `Transaction successfull, sender new balance is : ${senderWallet.balance}, receiver new balance is : ${receiverWallet.balance},`
                , transaction
            })

        }

        catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
}

module.exports = {
    handleSignIn,
    handleLogin,
    handleTransaction

}