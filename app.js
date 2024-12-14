const express=require('express')
const app=express()
const userModel=require('./models/user')
const postModel=require('./models/post')
const cookieParser = require('cookie-parser')
const bcrypt=require('bcrypt')
const path=require('path')  

const upload=require('./config/multerconfig')

app.use(cookieParser())
app.set("view engine","ejs")

app.use(express.json())
app.use(express.urlencoded({extended:true}))

const jwt=require('jsonwebtoken')
const user = require('./models/user')

app.use(express.static(path.join(__dirname,"public")))


app.get("/",function(req,res)
{
console.log("hey snamaika");
res.render('index')
})

//register part
app.post("/register",async (req,res)=>{
    const{username,name,age,email,password}=req.body

   let euser=await userModel.findOne({email})
   if(euser) return res.status(400).send("user already registered")

    bcrypt.genSalt(10, async function(err, salt) {
        bcrypt.hash(password, salt,async function(err, hash) {
            const user=await userModel.create({
                username,
            name,
            age,
            email,
            password:hash,
              })
const token= jwt.sign({email:email,userid:user._id},"secret")
            res.cookie("token",token)
res.redirect("/profile")
            //   res.status(201).send(user)
        });
    });

})

app.post("/login",async (req,res)=>{
    const {email,password}=req.body

    let user=await userModel.findOne({email})
    if(!user) return res.status(400).send("something went wrong")

        bcrypt.compare(password,user.password,function(err,result)
    {
        if(result)
            {
                const token=jwt.sign({email:email,userid:user._id},"secret")
                res.cookie("token",token)
                res.redirect("/profile")
        }
            else{
        res.redirect("/login")}
    })
})

app.get("/profile",islogedin,async(req,res)=>{
  const user= await userModel.findOne({email:req.user.email}).populate("post") 
  console.log(user);
    // res.send(`kena xhae rae:${req.user.email} `)
    res.render("profile",{user})
})

app.get("/logout",(req,res)=>{
    res.cookie("token","")
    res.redirect("/login")
})


app.get("/login",(req,res)=>{
    res.render("login")
})

app.post("/post",islogedin,async (req,res)=>{
   const user=await userModel.findOne({email:req.user.email})
   const {text}=req.body
   let post=await postModel.create({
user:user._id,
content:text,
   })
user.post.push(post._id)
await user.save()
res.redirect("/profile")
})

function islogedin(req,res,next)
{
    if(req.cookies.token==="") res.redirect("/login")
        else{
    const data=jwt.verify(req.cookies.token,"secret")
    req.user=data
        }
        next()
}


app.get("/like/:id",islogedin,async (req,res)=>{
let post=await postModel.findOne({_id:req.params.id}).populate("user")
if(post.likes.indexOf(req.user.userid)===-1)
{
    post.likes.push(req.user.userid)
}
else{
post.likes.splice(post.likes.indexOf(req.user.userid),1)
}

await post.save()
// res.cookie("like",req.user.userid)
res.redirect("/profile") 
})


app.get("/edit/:id",islogedin, async (req,res)=>{
    let post=await postModel.findOne({_id:req.params.id}).populate("user")
    res.render("edit",{post})
})


//multer part start from here..
// go to browser and type multer there and installl multer in the terminal 
// npm i multer
app.get("/profile/upload",(req,res)=>{
    res.render("profileupload")
})
// disk storage ->upload at server 
//memory storage ->database storage purpose 
//multer ->test page 
 
app.post("/upload",islogedin,upload.single("image"),async (req,res)=>{
// console.log(req.file);   //here before we were doing req.body bcz the text is stored in body but now we are storing the file so we need to store in req.file
const user= await userModel.findOne({email:req.user.email})
user.profilepic=req.file.filename
await user.save();
res.redirect("/profile")
})


app.post("/update/:id",islogedin,async (req,res)=>{
    let post=await postModel.findOneAndUpdate({_id:req.params.id},{content:req.body.text})
    // res.redirect("/profile")
    res.redirect("/profile")
})

app.get("/delete/:id",islogedin,async (req,res)=>{
    const  alluser=await postModel.findOneAndDelete({_id:req.params.id})
    res.redirect("/profile")
})



app.listen(2000)
 