const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile')
const User = require('../../models/User')

//@route GET api/profile/me
//@des  get current user profile
//@access Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar'])

        if (!profile) {
            return res.status(400).send('no profile for this user');
        }

        res.send(profile)



    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error')
    }
})

//@route Post api/profile
//@des  Create of Update user profile
//@access Private


router.post('/', [auth,
    [
        check('status', 'Status is required').not().isEmpty(),
        check('skills', 'Skills is required').not().isEmpty()
    ]
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            company, website, location, bio, status, githubusername, skills, youtube, twitter, facebook, linkedin, instagram
        } = req.body

        const profileFields = {};

        profileFields.user = req.user.id

        if (company) profileFields.company = company
        if (website) profileFields.website = website
        if (location) profileFields.location = location
        if (bio) profileFields.bio = bio
        if (status) profileFields.status = status
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim())
        }

        profileFields.social = {}

        if (youtube) profileFields.social.youtube = youtube
        if (twitter) profileFields.social.twitter = twitter
        if (linkedin) profileFields.social.linkedin = linkedin
        if (facebook) profileFields.social.facebook = facebook
        if (instagram) profileFields.social.instagram = instagram

        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true })
            return res.json(profile)

        }

        //create
        profile = new Profile(profileFields)
        await profile.save()
        return res.json(profile)


    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error')

    }
})



//@route Get api/profile
//@des  Get all Profile
//@access Public

router.get('/', async (req, res) => {
    try {

        const profile = await Profile.find().populate('user', ['name', 'avatar'])
        res.json(profile)
    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error')
    }
})



//@route Get api/profile/user/:user_id
//@des  Get profile  by userid
//@access Public

router.get('/user/:user_id', async (req, res) => {
    try {

        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar'])
        if (!profile) return res.status(404).send('no matching profile found');
        res.json(profile)
    } catch (error) {
        console.error(error.message);
        if (error.kind == 'ObjectId') return res.status(404).send('no matching profile found');
        res.status(500).send('server error')
    }
})




//@route Delete api/profile
//@des  Delete profile user posts
//@access Private

router.delete('/', auth, async (req, res) => {
    try {
        // remove profile
        await Profile.findOneAndRemove({ user: req.user.id })
        //remove user
        await User.findOneAndRemove({ _id: req.user.id })

        res.json({msg:'user removed successfully'})
    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error')
    }
})

module.exports = router;