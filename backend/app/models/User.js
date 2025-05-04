const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const {Schema, model} = mongoose;


const userSchema = new Schema({
    username : {
        type : String,
        required : true,
        unique : true
    },
    fullName : {
        type:String,
        required:true
    },
    email :{
        type : String,
        required: true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    profileImageUrl : {
        type : String,
        default : null
    },
    bookmarkedPolls : [{
        type : Schema.Types.ObjectId,
        ref : 'Poll'
    }]
}, {timestamps:true} )


userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password );
}

const User = model('User',userSchema);

module.exports = User
