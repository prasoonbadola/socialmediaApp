const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator')
const config = require('config')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')


//@route GET api/auth
//@des TEST route
//@access Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user)

    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error')
    }
})


//@route GET api/auth
//@des authenticate user get token
//@access Public

router.post('/login', [
    check('email', 'Please enter correct email address').isEmail(),
    check('password', ' Password is required').exists(),

], async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body

        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'invalid credentials' }] });
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'invalid credentials' }] });
        }

        const payload = {
            user: {
                id: user.id,
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 360000 }, (err, token) => {
            if (err) throw new Error(err);
            return res.json({ token })
        })
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('server error')
    }
})

module.exports = router;