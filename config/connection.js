
/* mongoose.connect('mongodb+srv://sreerag:oro3Hf2RVUFqo7qq@cluster0.bja4i5x.mongodb.net/?retryWrites=true&w=majority',{useNewUrlParser:true,useUnifiedTopology:true}, () => {
    console.log("Connected successfully to server");
},
    e => console.error(e)
) */

/* mongoose.connect('mongodb+srv://sreerag:oro3Hf2RVUFqo7qq@cluster0.bja4i5x.mongodb.net/?retryWrites=true&w=majority',{
    dbName:'GetMyShoes'
}).then(()=>{
    console.log("Connected successfully to server");
}).catch((err)=> console.log(err)) */

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

        })
        console.log("Connected successfully to server");
    }catch(error){
        throw error
    }
}

connect()