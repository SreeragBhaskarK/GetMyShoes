

require("dotenv").config()
const mongoose = require("mongoose")

/* url */
const {MONGODB_URL} = process.env
const connect = async ()=>{
    try{
        await mongoose.connect( MONGODB_URL,{
            dbName:"GetMyShoes",
            useNewUrlParser:true,
            useUnifiedTopology:true

        }).catch(error=>{
            console.log(error.message);
        })
        console.log("Connected successfully to server");
    }catch(error){
        console.log(error);
    }
}

connect()