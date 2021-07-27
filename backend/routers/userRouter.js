const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const userRouter = express.Router();


//Token Generation for Authentication
const generateToken = (user) => {
    return jwt.sign({
        _id: user._id,
        name: user.name,
        email: user.email,
    },
    process.env.JWT_SECRET || 'something',
    {
        expiresIn: '30d'
    })
};


//Middleware
const isAuth = (req, res, next) => {
    const authorization = req.headers.authorization;
    if(authorization){
        const token = authorization.slice(7, authorization.length);
        jwt.verify(token, process.env.JWT_SECRET || 'something', (err, decode)=>{
            if(err){
                res.status(401).send({message: 'Token is Invalid'})
            }else{
                req.user= decode;
                next();
            }
        })
    }
    else{
        res.status(401).send({message: 'No Token'});
    }
};


//To Create User In Database
userRouter.post('/register', expressAsyncHandler( async(req,res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        country: req.body.country,
        password: bcrypt.hashSync(req.body.password, 8)
    });
    const createdUser = await user.save();
    res.send({
        _id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        address: createdUser.address,
        country: createdUser.country,
        token: generateToken(createdUser),
    })
}))


userRouter.post('/signin', expressAsyncHandler(async(req, res) => {
    const user = await User.findOne({email: req.body.email});
    if(user){
        if(bcrypt.compareSync(req.body.password, user.password)){
            res.send({
                _id: user._id,
                name: user._name,
                email: user.email,
                address: user.address,
                country: user.country,
                token: generateToken(user)
            });
            return;
        }else{
            res.status(401).send({message: 'Invaild email or password'});
        }
    }
}))

//Get Details Of User Stored in Database
userRouter.get('/:id', expressAsyncHandler(async(req, res) => {
    const user = await User.findById(req.params.id);
    if(user){
        res.send(user);
    }else{
        res.status(404).send({message: 'User Not Found'});
    }
}));

//Update User In Database
userRouter.put('/profile', isAuth, expressAsyncHandler(async(req, res) => {
    const user = await User.findById(req.user._id);
    if(user){
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.address = req.body.address || user.address;
        user.country = req.body.country || user.country;
        if(req.body.password){
            user.password = bcrypt.hashSync(req.body.password, 8);
        }
        const updatedUser = await user.save();
        res.send({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            address: updatedUser.address,
            country: updatedUser.country,
            token: generateToken(updatedUser),
        })
    }
}))

//Delete User From Database
userRouter.delete('/delete/:id', isAuth,expressAsyncHandler(async(req,res) => {
    const user = await User.findById(req.params.id);
    if(user){
        const deleteUser = await user.remove();
        res.send({message: 'user is deleted', user: deleteUser});
    }else{
        res.status(404).send({message: 'user not found'});
    }
}))


module.exports = userRouter;