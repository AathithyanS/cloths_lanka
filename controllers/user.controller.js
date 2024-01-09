const express = require('express')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const router = express.Router()
const bcrypt = require('bcrypt')

const User = require('../models/user.model')
const {genrateCrudMethods} = require('../services')
const userCrud = genrateCrudMethods(User)
const {raiseRecord404FoundError, alreadyExistError} = require('../middlewares')
require('dotenv').config();



router.post('/signup', async (req, res, next) => {
    const data = {
        email: req.body.email,
        password: req.body.password,
    }
    const existingUser = await userCrud.findOne({email: data.email})
    if(existingUser){
        alreadyExistError(req, res)
    }else{
        const saltRound = 10
        const hasedPassword = await bcrypt.hash(data.password, saltRound)
        req.body.password = hasedPassword
        userCrud.create(req.body)
        .then(data => {
            delete data.password
            const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
            const otp = generateOTP();
            const otpExpiration = new Date(Date.now() + OTP_EXPIRATION_TIME);
            userCrud.update(data._id, {otp: `${otp}`, otpExpiration: `${otpExpiration}`})
            .then(data => {
                const token = generateToken(data)
                verifyMail(data.email, otp)
                res.status(201).json({
                    status: "true",
                    token: token
                })

            })
            .catch(err => next(err))
            
        })
        .catch(err => next(err))
    }
    
})

router.post('/verify-otp', async (req, res, next) => {
    const {id, otp} = req.body
    await userCrud.findOne({_id: id}).
    then(data => {
        const isOTPValid = verifyOtp(data, otp)
        if(isOTPValid){
            userCrud.update(id, {isVerified: "true"})
            .then(data => {
                if (data){
                    res.status(201).json({
                        status: true,
                        verified: true
                    })
                }
                else {
                    res.status(500).json({
                        status: false,
                        msg: "Try again later."
                    })
                }
            })
            .catch(err => next(err))
        }else{
            res.status(409).json({
                status: false,
                msg: "You Invalid OTP."
            })
        }
    })
})

router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await userCrud.findOne({ email });

        if (!user) {
            raiseRecord404FoundError(req, res);
        } else {
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (isPasswordValid && user.role == "client") {
                const token = generateToken(user);

                res.status(200).json({
                    status: true,
                    token,
                    message: 'Login successful',
                });
            } else {
                res.status(401).json({
                    status: false,
                    message: 'Invalid email or password',
                });
            }
        }
    } catch (err) {
        next(err);
    }
});


const verifyOtp = (user, enteredOTP) =>{
    const currentTimestamp = new Date().getTime()
    const isOTPValid = user.otp == enteredOTP && new Date(user.otpExpiration) > currentTimestamp
    return isOTPValid
}

const generateToken = (data) =>{
    const tokenPayload = {
        id: data._id,
        email: data.email,
        name: data.username,
        isVerified: data.isVerified
    }
    const secretKey = process.env.MY_SECRET;
    const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '30d' });
    return token
}

const verifyMail = async (email, otp) => {
    try{
        let transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: "aathiaathithyan123@gmail.com",
                pass: 'xxfk ovwb kshx ofjs'
            },
        })

        console.log(`${process.env.USER}, ${process.env.PASSWORD}`)

        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: "Account Verification",
            text: "Welcome",
            html: `
                <div>
                    <h1>Your OTP: ${otp} </h1>
                </div>
            `
            
        })
        console.log("mail send successfuly")
    }catch(err){
        console.log(err, "mail failed to send")
    }
}

const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
}



module.exports = router