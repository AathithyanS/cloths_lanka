const mongoose = require('mongoose')

const dbUri = "mongodb+srv://Aathi:ote0AtcLtd9crTbO@cluster0.byqqjzf.mongodb.net/CLOTHS_LANKA?retryWrites=true&w=majority"

module.exports = () => {
    return mongoose.connect(dbUri)
}