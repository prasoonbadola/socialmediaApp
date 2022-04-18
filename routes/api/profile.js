const express = require('express');
const router = express.Router();

//@route GET api/users
//@des TEST route
//@access Public
router.get('/', (req, res) => {
    res.send('profile route')
})


module.exports = router;