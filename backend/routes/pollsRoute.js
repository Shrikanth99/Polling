const express = require('express');
const authenticateUser = require('../app/middleware/authentication');
const upload = require('../app/middleware/uploadMiddleware');
const pollsCltr = require('../app/controllers/pollsCltr')
const router = express.Router();

router.post(`/create`,authenticateUser,pollsCltr.createPoll )
router.get(`/getAllPolls`, authenticateUser, pollsCltr.getAllPolls);
router.get(`/votedPolls`, authenticateUser, pollsCltr.getVotedPolls);
router.get(`/:id`, authenticateUser, pollsCltr.getPollById);
router.post('/:id/vote',authenticateUser, pollsCltr.voteOnPoll );
router.post("/:id/close",authenticateUser, pollsCltr.closePoll);
router.post("/:id/bookmark",authenticateUser, pollsCltr.bookmarkPoll);
router.get("/user/bookmarked",authenticateUser, pollsCltr.getBookmarkedPolls);
router.delete("/:id/delete",authenticateUser, pollsCltr.deletePoll)


module.exports = router