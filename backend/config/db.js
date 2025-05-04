const mongoose = require('mongoose')

const configDB = async() => {
    const url = process.env.DB_URL;
    const name = process.env.DB_NAME;

    try {
        const db = await mongoose.connect(`${url}/${name}`)
        if(db){
            console.log('Connected to DB',name)
        }
    } catch (e) {
        console.log(`error connecting to db`,e.message)
        process.exit(1)  
    }
}

module.exports = configDB