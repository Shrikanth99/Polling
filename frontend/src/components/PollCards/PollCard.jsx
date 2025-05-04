import React, { useCallback, useContext, useState } from 'react'
import {toast} from 'react-hot-toast'
import { UserContext } from '../../context/UserContext'
import { getPollBookmarked } from '../../utils/helper';
import UserProfileInfo from '../cards/UserProfileInfo';
import PollActions from './PollActions';
import PollContent from './PollContent';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/api_Paths';
import PollingResultContent from './PollingResultContent';

const PollCard = ({
    pollId,
    question,
    type,
    options,
    voters,
    responses,
    creatorProfileImg,
    creatorName,
    creatorUserName,
    userHasVoted,
    isMyPoll,
    isPollClosed,
    createdAt

}) => {

      const {user, onUserVoted, toggleBookmarkId, onPollCreateOrDelete } = useContext(UserContext);

    const [selectedOptionIndex, setSelectedOptionIndex] = useState(-1);
    const [rating,setRating] = useState(0);
    const [userResponse,setUserResponse] = useState("");
    const [isVoteComplete, setIsVoteComplete] = useState(userHasVoted);
    const [pollResult,setPollResult] = useState({
        options,
        voters,
        responses,
    });

    const isPollBookmarked = getPollBookmarked(
        pollId,
        user.bookmarkedPolls || []
    );

    const [pollBookmarked,setPollBookmarked] = useState(isPollBookmarked);
    const [pollClosed,setPollClosed] = useState(isPollClosed || false);
    const [pollDeleted,setPollDeleted] = useState(false);

    // handles user input based on the poll type
    const handleInput = (value) => {
        if(type === 'rating') setRating(value);
        else if( type === "open-ended" ) setUserResponse(value);
        else setSelectedOptionIndex(value);
    };

    // Generate post data based on the poll type  using Callback Hook
    const getPostData = useCallback(() => {
        if(type === 'open-ended' ){
            return { responseText : userResponse, voterId : user._id };
        }
        if( type === "rating" ){
            return { optionIndex : rating - 1, voterId : user._id };
        } 
        return { optionIndex : selectedOptionIndex, voterId : user._id }

    },[type, userResponse, selectedOptionIndex, rating, user],);

    // Get Poll Detail by Id
    const getPollDetail = async () => {
        try {
            const response = await axiosInstance.get(
                API_PATHS.POLLS.GET_POLL_BY_ID(pollId)
            );

            if(response.data){
                const pollDetails = response.data;

                setPollResult({
                    options : pollDetails.options || [] ,
                    voters : pollDetails.voters.length || 0,
                    responses : pollDetails.responses || []
                });
            }

        } catch (error) {
            console.error(error.response?.data?.message || "" )
        }
    }

    // handle vote submission 
    const handleVoteSubmit = async () => {
        try {
            const response = await axiosInstance.post(API_PATHS.POLLS.VOTE_POLL(pollId),
                getPostData()
            );
            getPollDetail()
            setIsVoteComplete(true);
            onUserVoted();
            toast.success("Vote Submitted successfully")
        } catch (error) {
            console.log('err',error)
            console.error(error.response?.data?.message || "Error while Vot submitting")
        }
    }

    // Toggles the bookmark status of a poll
    const toggleBookmark = async () => {
        try {
            const response = await axiosInstance.post(
                API_PATHS.POLLS.BOOKMARK_POLL(pollId)
            );
            toggleBookmarkId(pollId);
            setPollBookmarked((prev) => !prev )
            toast.success(response.data.message);
        } catch (error) {
            console.error(error.response?.data?.message || "Error Bookmarking Poll " )
            toast.success(error.response?.data?.message || "Error Bookmarking Poll ");
        }
    }

    // Close Poll
    const closePoll = async () => {
        try {
            const response = await axiosInstance.post(API_PATHS.POLLS.CLOSE_POLL(pollId));

            if(response.data){
                setPollClosed(true)
                toast.success(response.data?.message || "Poll Closed Successfully ");
            }

        } catch (error) {
            console.error(error.response?.data?.message || "Error Closing Poll " )
            toast.success(error.response?.data?.message || "Error Bookmarking Poll ");

        }
    }

    // Close Poll
    const deletePoll = async () => {
        try {
            const response = await axiosInstance.post(API_PATHS.POLLS.DELETE(pollId));

            if(response.data){
                setPollDeleted(true)
                onPollCreateOrDelete()
                toast.success(response.data?.message || "Poll Deleted Successfully ");
            }

        } catch (error) {
            console.error(error.response?.data?.message || "Error Deleting Poll " )
            toast.success(error.response?.data?.message || "Error Deletinig Poll ");

        }
    }


  return ( !pollDeleted && (
    <div className="bg-slate-100 my-5 mx-auto p-5 rounded-lg border border-slate-300 " >
        <div className="flex items-start justify-between " >
            <UserProfileInfo
                imgUrl={creatorProfileImg}
                fullname={creatorName}
                username={creatorUserName}
                createdAt={createdAt}
            />

            <PollActions
                pollId={pollId}
                isVoteComplete={isVoteComplete}
                inputCaptured={ !!(userResponse || selectedOptionIndex >= 0 || rating ) }
                onVoteSubmit={handleVoteSubmit}
                isPollBookmarked={pollBookmarked}
                toggleBookmark={toggleBookmark}
                isMyPoll={isMyPoll}
                pollClosed={pollClosed}
                // will see 
                onClosePoll={closePoll}
                onDeletePoll={deletePoll}

            />

        </div>

        <div className="ml-14 mt-3" >
            <p className="text-[15px] text-black leading-8 "
            >{question}</p>
            <div className="mt-4" >
                { isVoteComplete || isPollClosed ? 
                (
                
                    <PollingResultContent
                        type={type}
                        options={pollResult.options || [] }
                        voters={pollResult.voters || 0 }
                        responses={pollResult.responses || [] }

                    />
                
                ) : 
                    (
                    <PollContent
                    type={type}
                    options={options}
                    selectedOptionIndex={selectedOptionIndex}
                    onOptionSelect={handleInput}
                    rating={rating}
                    onRatingChange={handleInput}
                    userResponse={userResponse}
                    onResponseChange={handleInput}
                    />
                    )
                }
            </div>

        </div>

    </div>
    )
  )
}

export default PollCard
