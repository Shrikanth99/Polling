require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const configDB = require('./config/db')
const authRoutes = require('./routes/auth')
const pollRoutes = require('./routes/pollsRoute')
const PORT = process.env.PORT || 5000

const app = express()
app.use(express.json())
app.use(cors({
    origin : process.env.CLIENT_URL || '*',
    methods : ['GET','POST','PUT','DELETE'],
    allowedHeaders : ['Content-Type','Authorization']
}));

configDB()

// Auth routes
app.use('/api/v1/auth',authRoutes);
app.use('/api/v1/poll',pollRoutes)

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT,() => {
    console.log(`Server running on PORT ${PORT}`)
}); 

