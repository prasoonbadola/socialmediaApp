const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile')
const User = require('../../models/User')
const Post = require('../../models/Post')


//@route POST api/post
//@des create a post
//@access Privare
router.post('/', [auth,
    check('text', 'Text is required').not().isEmpty()
], async (req, res) => {

    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const user = await User.findById(req.user.id).select('-password')

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })

        const post = await newPost.save();
        res.json(post)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('server error')
    }

})



//@route Get api/post
//@des  GET ALL POST 
//@access Private
router.get('/', auth, async (req, res) => {
    try {
        const post = await Post.find().sort({ date: -1 });
        res.json(post)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('server error')
    }
})



//@route Get api/post/:id
//@des  GET post by id
//@access Private
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).send({ msg: 'Post not found' })
        }
        res.json(post)
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).send({ msg: 'Post not found' })
        }
        console.error(error.message)
        return res.status(500).send('server error')
    }
})




//@route Delete api/post/:id
//@des  Delete post by id
//@access Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).send({ msg: 'Post not found' })
        }

        if (post.user.toString() !== req.user.id) {
            return res.status(401).send({ msg: 'user not authorized' });
        }
        await post.remove()
        res.json({ msg: 'Post removed successfully' })
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).send({ msg: 'Post not found' })
        }
        console.error(error.message)
        return res.status(500).send('server error')
    }
})




//@route Put api/post/Like/:id
//@des  Like a post
//@access Private
router.post('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).send({ msg: 'Post not found' })
        }

        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {

            const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id)
            post.likes.splice(removeIndex, 1)
            await post.save()
            return res.status(200).send({ msg: 'post unliked' })
        }
        post.likes.unshift({ user: req.user.id })


        await post.save()
        res.json(post.likes)
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).send({ msg: 'Post not found' })
        }
        console.error(error.message)
        return res.status(500).send('server error')
    }
})



//@route POST api/post/comment/:id
//@des comment on a post
//@access Privare
router.post('/comment/:id', [auth,
    check('text', 'Text is required').not().isEmpty()
], async (req, res) => {

    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const user = await User.findById(req.user.id).select('-password')
        const post = await Post.findById(req.params.id)
        const newComment = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })
        post.comments.unshift(newComment)

        await post.save();
        res.json(post)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('server error')
    }

})



//@route Delete api/post/comment/:id/:comment_id
//@des Delete comment
//@access Privare

router.delete('/comment/:id/:comment_id', auth,async (req, res) => {
    try {

        const post = await Post.findById(req.params.id)
        const comment = post.comments.find(comment => comment.id === req.params.comment_id)
       
        if (!comment)
        {
            return res.status(404).send({msg:'comment does not exist'})
        }

        if(comment.user.toString() !== req.user.id)
        {
            return res.status(401).send({msg:'user not authorized'})
        }

        const removeIndex = post.comments.map(c => c.user.toString()).indexOf(req.user.id)
        post.comments.splice(removeIndex, 1)
        await post.save()
        return res.status(200).send(post.comments)

    } catch (error) {
        console.error(error)
        res.status(500).send('server error')
    }
})
module.exports = router;