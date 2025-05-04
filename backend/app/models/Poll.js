const { response } = require('express');
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const PollSchema = new Schema({
    question : { type : String, required : true },
    type : { type : String, required : true },  // for eg, single-choice, ratiing etc 
    options : [
        { 
            optionText : { type : String, required: true },
            votes : { type : Number, default : 0 }, // for tracking votes.
        },
    ],
    responses : [
        {
            voterId : { type: Schema.Types.ObjectId, ref : 'User' }, // For open-Ended polls.
            responseText : { type : String  }, // User submitted text response
            createdAt : { type : Date, default : Date.now },
        },
    ],
    creator : { type : Schema.Types.ObjectId, ref : 'User', required : true },
    voters : [{ type : Schema.Types.ObjectId, ref : 'User' }],
    createdAt : { type:Date, default : Date.now },
    closed : {type:Boolean, default: false }, // To mark polls as closed

});

const Poll = model('Poll', PollSchema);

module.exports = Poll 