const express = require('express');
const app = express();
const connectDb = require('./config/db')
const PORT =  process.env.PORT || 5000;

//connect DB connection
connectDb();
// Defile routes
app.use('/api/users',require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/post', require('./routes/api/post'))

app.listen(PORT,()=>{
console.log('Server is up and running on:'+PORT);
})