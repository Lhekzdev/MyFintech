const User = require("../models/UserModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Wallet = require("../models/WalletModel")
const Transaction = require("../models/TransactionModel")
const mongoose = require("mongoose")
const sendEmail = require("./utils/sendEmail")


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

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

        const newUser = new User({ email, firstName, password: hashedPassword, lastName,   otp,
      otpExpires,
      isVerified: false, })



        await newUser.save()


        const wallet = await Wallet.create({
            walletRef: newUser?._id,
            balance: 0,

        })

await sendEmail(email, "Verify Your Account", `Your OTP is: ${otp}`);



    res.status(201).json({ message: "Signup successful. Please verify OTP sent to your email." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

    //     res.json({
    //         newUser: { email, firstName, lastName, hashedPassword, wallet }

    //     })


    // } catch (error) {
    //     res.json({ message: error.message })
    // }

// }



// verifyOTP
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || user.otpExpires < Date.now())
    return res.status(400).json({ message: "Invalid or expired OTP" });

  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;

  await user.save();

  res.status(200).json({ message: "Account verified successfully" });
};





// requestPasswordReset
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = Date.now() + 10 * 60 * 1000;

  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  await sendEmail(email, "Password Reset OTP", `Your OTP is: ${otp}`);
  res.status(200).json({ message: "OTP sent to email" });
};




// resetPassword

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ message: "User not found" });

//   console.log("Stored OTP:", user.otp);
//   console.log("Entered OTP:", otp);
//   console.log("OTP Expiry:", user.otpExpires, "Current Time:", Date.now());

  if (String(user.otp) !== String(otp))
    return res.status(400).json({ message: "Invalid OTP" });

  if (user.otpExpires < Date.now())
    return res.status(400).json({ message: "OTP has expired" });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.otp = null;
  user.otpExpires = null;

  await user.save();
  res.status(200).json({ message: "Password reset successful" });
};




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






const handleViewBalance= async(req, res)=>{

   try {const {userId} = req.params

  const getUserId = await User.findById(userId)

 .populate("firstName lastName") // optional: to get user details


  


    if (!getUserId) {
            return res.status(404).json({ message: 'User not found' });
        }

const getUserWallet = await Wallet.findOne({walletRef:getUserId._id})
  if (!getUserWallet) {
      return res.status(404).json({ message: 'Wallet not found for this user' });
    }

        return res.json({
message: `Your wallet balance is displayed below `,
balance: getUserWallet.balance,
getUserWallet

        })
      } catch (error) {
     console.error('Error fetching wallet balance:', error);
        res.status(500).json({ message: 'Server error' });
   }
 


}

const handleTransactionHistory =async(req,res)=>{
   try {
      const {userId} = req.params

const pastTrasactions = await Transaction.find({
   $or:[{sender:userId}, {receiver:userId}]
})
.populate("sender receiver") // optional: to get user details
.sort({ createdAt: -1 }); 

if(!pastTrasactions) {
return res.status(400).json(
  { message: "Transaction history empty"}
)

}

res.json(
  { message: "Trasanction history retrieved successfully",
   count:pastTrasactions.length,
   transactions: pastTrasactions


}
)
      
   } catch (error) {
         console.error('History not retrieved:', error);
        res.status(500).json({message: error.message });


                        
      
   }


}



module.exports = {
    handleSignIn,
    handleLogin,
    handleTransaction,
    handleViewBalance,
    handleTransactionHistory,
    verifyOTP,
    resetPassword ,
    requestPasswordReset,

}


