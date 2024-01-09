const raiseRecord404FoundError = (req, res) => {
    res.status(404).json({
        status: "false",
        msg: 'no record found!'
    })
}

const alreadyExistError = (req, res) => {
    res.status(409).json({
        status: 'false',
        msg: "Error"
    })
}

const errorHandler = (error, req, res, next) => {
    res.status(500).json({
        status: "false",
        msg:error
    })
}

module.exports = {
    raiseRecord404FoundError,
    alreadyExistError,
    errorHandler
}