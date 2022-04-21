const express = require('express')
const {signup, login, verifyToken, getUser, refreshToken, logout} = require('../controllers/user-controller')

const router = express.Router()

router.get('/', (req, res, next) => {
    // console.log(req.headers)
    res.send('Hello world')
})

router.post('/signup', signup)
router.post('/login', login)
router.get('/user', verifyToken, getUser)
router.get('/refresh', refreshToken, verifyToken, getUser)
router.post('/logout', verifyToken, logout)

module.exports = router