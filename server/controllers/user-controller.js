const User = require('../model/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const signup = async (req, res, next) => {
    const {name, email, password} = req.body
    let existingUser
    try {
        existingUser = await User.findOne({email})
    } catch (err) {
        console.log(err)
    }
    if (existingUser) {
        return res.status(400).json({message: 'User already exists! Logged Instead'})
    }

    const hashedPassword = await bcrypt.hashSync(password)

    const user = await new User({
        name,
        email,
        password: hashedPassword
    })

    try {
        await user.save()
    } catch (err) {
        console.log(err)
    }

    return res.status(201).json({message: user})
}

const login = async (req, res, next) => {
    const {email, password} = req.body

    let existingUser
    try {
        existingUser = await User.findOne({email})
    } catch (err) {
        return new Error(err)
    }
    if (!existingUser) {
        return res.status(400).json({message: 'User not found. Signup Please'})
    }
    const isPasswordCorrect = await bcrypt.compareSync(password, existingUser.password)
    if (!isPasswordCorrect) {
        return res.status(400).json({message: 'Invalid Email/Password'})
    }
    const token = jwt.sign(
        {id: existingUser._id},
        process.env.JWT_SECRET_KEY,
        {expiresIn: '35s'}
    )

    if (req.cookies[`${existingUser._id}`]) {
        req.cookies[`${existingUser._id}`] = ''
    }

    res.cookie(
        String(existingUser._id),
        token,
        {
            path: '/',
            expires: new Date(Date.now() + 1000 * 350),
            httpOnly: true,
            sameSite: "strict"
        }
    )

    return res.status(200).json({message: 'Successfully Logged In', user: existingUser, token})

}

const verifyToken = (req, res, next) => {
    const cookies = req.headers.cookie
    const token = cookies.split('=')[1]
    if (!token) {
        res.status(404).json({message: 'No token found'})
    }
    jwt.verify(String(token), process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(400).json({message: 'Invalid Token'})
        }
        // console.log(user.id)
        req.id = user.id
    })
    next()
}

const getUser = async (req, res, next) => {
    // console.log(req.headers.cookie.split('=')[1])
    // console.log('userId: ', req.id)
    const userId = req.id
    // console.log(req.body)
    let user
    try {
        user = await User.findById(userId, '-password')
    } catch (err) {
        return new Error(err)
    }
    if (!user) {
        return res.status(404).json({message: 'User Not Found'})
    }
    return res.status(200).json({user})
}

const refreshToken = async (req, res, next) => {
    if (req.headers.cookie) {
        const cookies = req.headers.cookie
        const prevToken = cookies.split('=')[1]
        if (!prevToken) {
            return res.status(400).json({message: 'Could not find token'})
        }
        jwt.verify(String(prevToken), process.env.JWT_SECRET_KEY, (err, user) => {
            if (err) {
                console.log(err)
                return res.status(403).json({message: 'Authentication failed'})
            }
            res.clearCookie(`${user.id}`)
            req.cookies[`${user.id}`] = ''

            const token = jwt.sign({id: user.id}, process.env.JWT_SECRET_KEY, {
                expiresIn: '35s'
            })
            res.cookie(String(user.id), token, {
                path: '/',
                expires: new Date(Date.now() + 1000 * 30),
                httpOnly: true,
                sameSite: "lax"
            })

            req.id = user.id
            next()
        })
    } else {
        console.log('Пожалуйста, авторизуйтесь еще раз')
    }

}

const logout = (req, res, next) => {
    const cookies = req.headers.cookie
    const prevToken = cookies.split('=')[1]
    if (!prevToken) {
        return res.status(400).json({message: 'Could not find token'})
    }

    jwt.verify(String(prevToken), process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
            console.log(err)
            return res.status(403).json({message: 'Authentication failed'})
        }
        res.clearCookie(`${user.id}`)
        req.cookies[`${user.id}`] = ''
        return res.status(200).json({message: 'Successfully Logged Out'})

    })
}

module.exports = {
    signup,
    login,
    verifyToken,
    getUser,
    refreshToken,
    logout
}

