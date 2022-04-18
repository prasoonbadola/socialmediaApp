const express = require('express');
const router = express.Router();
const {check,validationResult} = require('express-validator')


//@route POST api/users
//@des register user route
//@access Public
router.post('/',[
    check('name','Name is required').not().isEmpty(),
    check('email', 'Please enter correct email address').isEmail(),
    check('password', 'Please enter password with 6 or more characters').isLength({min:6}),

],(req,res)=>{
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }

        console.log(req.body);
    } catch (error) {
        console.error(error.message);
    }
})


module.exports = router;