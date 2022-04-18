const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../../models/User')
const config = require('config')
//@route POST api/users
//@des register user route
//@access Public
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please enter correct email address').isEmail(),
    check('password', 'Please enter password with 6 or more characters').isLength({ min: 6 }),

], async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password } = req.body

        let user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'user already exists' }] })
        }

        const avatar = gravatar.url(email, {
            s: '200',
            p: 'pg',
            d: 'mm'
        })

        user = new User({
            name,
            email,
            avatar,
            password
        })

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();

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