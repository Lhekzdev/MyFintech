const express = require("express")
const mongoose = require("mongoose")

const dotenv = require("dotenv")

const cors = require ("cors")

const routes = require ("./Routes")


dotenv.config()

const app = express()

app.use(cors())
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

app.use("/api", routes)