const mongoose=require('mongoose')
//here we dont need to connect again because we have connected in our user.js file 

const postSchema=mongoose.Schema({
user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
},date:{
    type:Date,
    default:Date.now
},content:String,
likes:[{
    type:mongoose.Schema.Types.ObjectId,ref:"user"
}]
})

module.exports=mongoose.model("post",postSchema)