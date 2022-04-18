const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI')



const connectDb = async () =>{
try {
   await mongoose.connect(db,{useNewUrlParser:true})
   console.log('database connected')
} catch (error) {
    console.error(error.message);
    //Exit process with faliure
    process.exit(1);
}
}

module.exports = connectDb;