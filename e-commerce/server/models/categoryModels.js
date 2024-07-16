const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        unique:true
    }
},{
    timeStamps:true
})

module.exports = module.model("Category",categorySchema)