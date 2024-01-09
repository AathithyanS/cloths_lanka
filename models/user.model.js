const mongoose = require('mongoose')

module.exports = mongoose.model('User', {
    username: {type: String},
    email: {type: String},
    role: {type: String},
    phone: {type: String},
    otp: {type: String},
    otpExpiration: {type: String},
    password: {type: String},
    isVerified: {type: Boolean, default: false}
})