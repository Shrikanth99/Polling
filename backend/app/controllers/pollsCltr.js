const User = require("../models/User");
const Poll = require("../models/Poll");
const _ = require("lodash");

const polls_Cltr = {};

// Create-Poll
polls_Cltr.createPoll = async (req, res) => {
  const { question, type, options, creatorId } = _.pick(req.body, [
    "question",
    "type",
    "options",
    "creatorId",
  ]);

  if (!question || !type || !creatorId) {
    return res.json({ message: "Question, type, and creatorId are required " });
  }

  try {
    let processedOptions = [];
    switch (type) {
      case "single-choice":
        if (!options || options.length < 2) {
          return res.json({
            message: "Single-choice poll must have at least two optins ",
          });
        }
        processedOptions = options.map((option) => ({ optionText: option }));
        break;

      case "rating":
        processedOptions = [1, 2, 3, 4, 5].map((val) => ({
          optionText: val.toString(),
        }));
        break;

      case "open-ended":
        processedOptions = []; // no options needed for open-ended.
        break;

      case "yes/no":
        processedOptions = ["Yes", "No"].map((option) => ({
          optionText: option,
        }));
        break;

      case "image-based":
        if (!options || options.length < 2) {
          return res
            .status(400)
            .json({ message: " Must include 2 Images Urls." });
        }
        processedOptions = options.map((url) => ({ optionText: url }));
        break;

      default:
        return res.status(400).json({ message: "Invalid Poll type" });
    }

    const newPoll = await Poll.create({
      question,
      type,
      options: processedOptions,
      creator: creatorId,
    });

    res.json(newPoll);
  } catch (e) {
    res.status(500).json({ message: "Error Creatio Poll", error: e.message });
  }
};

// Get All polls
polls_Cltr.getAllPolls = async (req, res) => {
  let { type, creatorId, page=1, limit=10 } = req.query;
  const filter = {};
  const userId = req.user._id;

  // if(!page ){
  //   page = 1
  // };
  // if(!limit){
  //   limit=10
  // };

  // 2nd approach 
  if (isNaN(page)  || page  < 1) page  = 1;
  if (isNaN(limit) || limit < 1) limit = 10;


  if (type) filter.type = type;
  if (creatorId) filter.creator = creatorId;
  console.log("filterObj",filter);

  try {
    // Calculate pagination parameter
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    // 2nd approach
    // const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    // const pageSize = Math.max(1, parseInt(limit, 10) || 10);

    const skip = (pageNumber - 1) * pageSize;

    // 2nd approach
    // count of total Documents
    // const totalPolls = await Poll.countDocuments(filter);
    // const totalPages = Math.ceil(totalPolls / pageSize) || 1;


    // 2nd Approach
    // 5. Clamp currentPage to [1, totalPages]
    // const currentPage = Math.min(pageNumber, totalPages);
    // console.log('Cp',currentPage)

    //  2nd approach.
    // // 6. Calculate skip
    // const skip = (currentPage - 1) * pageSize;
    // console.log('Sk',skip)


    // Fetch polls with pagination
    const polls = await Poll.find(filter)
    .populate(
      "creator",
      "fullName username email profileImageUrl"
    )
    .populate({
        path : "responses.voterId",
        select : "username profileImageUrl fullName",
    })
    .skip(skip)
    .limit(pageSize)
    .sort({ createdAt : -1 });

    // Add user has voted flag for each poll
    const updatedPolls = polls?.map((poll) => {
        const userHasVoted = poll.voters?.some((voterId) => 
          voterId.equals(userId) 
        )
        return {
            ...poll.toObject(),
            userHasVoted,
        };
    });

    //  Get total count of polls for pagination metadata
    // count of total Documents
    const totalPolls = await Poll.countDocuments(filter);
    // console.log('tp',totalPolls);

    // DB aggreagtion
    const stats = await Poll.aggregate([
      { $group : {
        _id : "$type",
        count : { $sum : 1 },
        },
      },
      {
        $project : {
          type : "$_id",
          count : 1,
          _id : 0
        }
      },
    ]);
    // console.log('st',stats);

    // Ensure all Types are included in stats, even those with zero counts
    const allTypes = [
      { type:"single-choice", label : "Single Choice" },
      { type : "yes/no", label : "Yes/No" },
      { type : "rating", label : "Rating" },
      { type : "image-based", label : "Image Based" },
      { type : "open-ended", label : "Open Ended" }
    ]

    //  custom stats
    const statsWithDefaults = allTypes.map((pollType) => {
      const stat = stats.find((item) => item.type === pollType.type );
      return {
        label : pollType.label,
        type : pollType.type,
        count : stat ? stat.count : 0,
      } ;
    }).sort((a,b) => b.count - a.count );

    // console.log("statsWithDef",statsWithDefaults)

    // if (pageNumber > Math.ceil(totalPolls / pageSize)) {
    //   return res.status(400).json({ message: "Page out of bounds" });
    // }


    // resposne to client
    res.json({
      polls : updatedPolls,
      currentPage : pageNumber,
      totalPages: Math.ceil(totalPolls/pageSize),
      totalPolls,
      stats : statsWithDefaults, 
    })

  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: "", error: err.message });
  }
};

// for fetch voted Polls
polls_Cltr.getVotedPolls = async (req, res) => {
  let { page = 1, limit = 10 } = req.query;
  const userId = req.user._id;

  if (isNaN(page)  || page  < 1) page  = 1;
  if (isNaN(limit) || limit < 1) limit = 10;

  //debug page & lmit
  // console.log( 'pg',page, 'limit', limit );

  try {
    // calculate pagination parameters
    const pageNumber = parseInt(page,10);
    const pageSize = parseInt(limit, 10);
    const skip = ( pageNumber - 1) * pageSize;

    //  Fetch polls where user has vated
    const polls = await Poll.find({ voters : userId })  // Filter by Polls where the user ID exists in the voters
    .populate("creator", "fullName profileImageUrl username email" )
    .populate({ 
      path : "responses.voterId",
      select : "username profileImageUrl fullName",
    })
    .skip(skip)
    .limit(pageSize);

    // Add userHas voted flag for each poll
    const updatedPolls = polls.map((poll) => {
      const userHasVoted = poll.voters.some((voterId) => voterId.equals(userId) );
      return {
        ...poll.toObject(),
        userHasVoted,
      };
    });

    // Get total count of voted polls for pagination metadat
    const totalVotedPolls = await Poll.countDocuments({ voters : userId });

    res.json({
      polls : updatedPolls,
      currentPage : pageNumber,
      totalPages : Math.ceil( totalVotedPolls / pageSize ),
      totalVotedPolls,
    });

  } catch (e) {
    res.status(500).json({ message : "Failed to fetch voted Polls", error: e.message });
  }
 
};

// for fetch single poll by Id
polls_Cltr.getPollById = async (req, res) => {
  const { id } = req.params;

  try {
    const poll = await Poll.findById(id)
    .populate('creator', " username email ")
    .populate({
      path : "responses.voterId",
      select : "username fullName profileImageUrl"
    });
    

    if( !poll ){
      return res.status.json({ message : "Poll not found" });
    }
    res.status(200).json(poll);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch poll", error: err.message });
  }
};

// vote for poll
polls_Cltr.voteOnPoll = async (req, res) => {
  const { id } = req.params; // PollID
  const { optionIndex, voterId, responseText } = _.pick(req.body,['optionIndex', 'voterId', 'responseText']);

  try {
    const poll = await Poll.findById(id);
    if( !poll ) return res.status(404).json({ message : "Poll not found" });

    if( poll.closed ){
      return res.status(400).json({ message : "Poll is closed"});
    }

    if(poll.voters.includes(voterId)){
      return res.json({ message : "User has already voted on this poll" })
    }

    if( poll.type === 'open-ended' ){
      if( !responseText ) {
        return res.status(400).json({ message : "Response text is required for open-ended " });
      }
      poll.responses.push({voterId, responseText});
    }else{
      if( 
        optionIndex === undefined ||
        optionIndex < 0 ||
        optionIndex >= poll.options.length
      ) {
        return res.status(400).json({ message : " Invalid optionIndex... " })
      }
      poll.options[optionIndex].votes += 1;
    }

    poll.voters.push(voterId);
    await poll.save();

    res.json(poll);

  } catch (err) {
    res.status(500).json({ message: "", error: err.message });
  }
};

// to close the poll
polls_Cltr.closePoll = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const poll = await Poll.findById(id)

    if(!poll) return res.status(404).json({ message : "Poll not found" });

    if(poll.creator.toString() !== userId){
      return res.status(403).json({ message : "You are not authorized to close this poll. " });
    }

    poll.closed = true;
    await poll.save();

    res.json({message : 'Poll successfully closed', poll})

  } catch (err) {
    res.status(500).json({ message: "", error: err.message });
  }
};

// Bookmark Poll
polls_Cltr.bookmarkPoll = async (req, res) => {
  const { id} = req.params; // Poll ID
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    // if user not found error  message
    if(!user) return res.status(404).json({ message : 'User not found' });

    // check if poll is already bookmarked
    const isBookmarked = user.bookmarkedPolls.includes(id);

    // if is Bookmarked  remove poll from boolmarks
    if(isBookmarked) {

      user.bookmarkedPolls = user.bookmarkedPolls.filter(pollId => pollId.toString() !== id );

      await user.save();
      return res.json({ message : 'Poll remove from bookmarks',
        bookmarkedPolls : user.bookmarkedPolls,
       });

    }

    //if not bookmarked then add poll to bookmarks
    user.bookmarkedPolls.push(id);
    await user.save();
    res.status(200).json({ message : " Poll bookmarked sucessfull ",
      bookmarkedPolls : user.bookmarkedPolls
    });

  } catch (err) {
    res.status(500).json({ message: "", error: err.message });
  }
};

// Get All BookmarkedPolls without pagination
// polls_Cltr.getBookmarkedPolls = async (req, res) => {
//   const userId = req.user.id;

//   try {
//     const user = await User.findById(userId).populate({
//       path : 'bookmarkedPolls',
//       populate : {
//         path : 'creator',
//         select : " fullName username profileImageUrl "
//       }
//     });

//     if(!user) return res.status(404).json({ message : "User Not Found" });

//     const bookmarkedPolls = user.bookmarkedPolls;
//     // Add userHas voted flag for each poll
//     const updatedPolls = bookmarkedPolls.map((poll) => {
//       const userHasVoted = poll.voters.some((voterId) => voterId.equals(userId));
//       return {
//         ...poll.toObject(),
//           userHasVoted,
//       };
//     });

//     res.status(200).json({ bookmarkedPolls : updatedPolls })

//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch bookmarked polls", error: err.message });
//   }
// };

// Get All Bookmarked Polls with pagination
polls_Cltr.getBookmarkedPolls =  async (req, res) => {
  // 1) Parse & sanitize page/limit
  let { page = "1", limit = "10" } = req.query;
  page  = parseInt(page,  10);
  limit = parseInt(limit, 10);
  if (isNaN(page)  || page  < 1) page  = 1;
  if (isNaN(limit) || limit < 1) limit = 10;

  const skip = (page - 1) * limit;
  const userId = req.user._id;

  try {
    // 2) Load the user’s bookmarkedPolls array
    const user = await User.findById(userId).select("bookmarkedPolls");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const bookmarkedIds = user.bookmarkedPolls || [];

    // 3) Query Polls by those IDs, with pagination
    const [ totalBookmarkedPolls, polls ] = await Promise.all([
      // count total for metadata
      Poll.countDocuments({ _id: { $in: bookmarkedIds } }),
      // fetch one page
      Poll.find({ _id: { $in: bookmarkedIds } })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate("creator", "fullName username profileImageUrl")
        .populate("responses.voterId", "username profileImageUrl fullName")
        .lean(),
    ]);

    // 4) Annotate each poll with userHasVoted
    const annotated = polls.map(poll => ({
      ...poll,
      userHasVoted: poll.voters.some(voterId => voterId.equals(userId)),
    }));

    // 5) Return paginated result
    return res.json({
      polls: annotated,
      currentPage: page,
      totalPages: Math.ceil(totalBookmarkedPolls / limit),
      totalBookmarkedPolls,
    });
  } catch (err) {
    console.error("getBookmarkedPolls error:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch bookmarked polls", error: err.message });
  }
};

// To Delete Poll
polls_Cltr.deletePoll = async (req, res) => {
  const {id} = req.params; // Poll Id
  const userId = req.user.id;

  try {
    const poll = await Poll.findById(id)
    if(!poll){
      return res.status(404).json({ message : "Poll not Found" });
    }

    if(poll.creator.toString() !== userId ){
      return res.status(403).json({ message : "You are authorized to delete this Poll." });
    }

    await Poll.findByIdAndDelete(id);

    res.status(200).json({ message : "Poll Deleted Sucessfully " })

  } catch (err) {
    res.status(500).json({ message: "Error While deleting", error: err.message });
  }
};

module.exports = polls_Cltr;
