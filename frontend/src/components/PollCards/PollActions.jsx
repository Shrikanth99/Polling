import React, { useState } from 'react'
import { FaBookmark, FaRegBookmark } from 'react-icons/fa'

const PollActions = ({
    pollId,
    isVoteComplete,
    inputCaptured,
    onVoteSubmit,
    isPollBookmarked,
    toggleBookmark,
    isMyPoll,
    pollClosed,
    onClosePoll,
    onDeletePoll
}) => {

    const [loading,setLoading] = useState(false)

    const handleVoteClick = async () => {
        setLoading(true);
        try {
            await onVoteSubmit();
        } catch (e) {
            
        } finally {
            setLoading(false)
        }
    };

  return (
    <div className="flex items-center gap-4 " >
        { (isVoteComplete || pollClosed ) && (
        <div className="text-[11px] font-medium text-slate-900 bg-sky-700/10 px-3 py-1 rounded-md " >
            { pollClosed ? "Closed" : "Voted" }
        </div>
        ) }
        
        { isMyPoll && !pollClosed && (
            <button
                className=" btn-small text-orange-500 bg-orange-500/20 hover:bg-orange-500 hover:text-white hover:border-orange-100 "
                onClick={onClosePoll}
                disabled={loading}

            >
                Close
            </button>
        ) }

        { isMyPoll && (
            <button
                className=" btn-small text-red-500 bg-red-500/20 hover:bg-red-500 hover:text-white hover:border-orange-100 "
                onClick={onDeletePoll}
                disabled={loading}

            >
                Delete
            </button>
        ) }

        <button className='icon-btn ' onClick={toggleBookmark} >
            { isPollBookmarked ? (
                <FaBookmark className="text-primary " />
            ) : (
                <FaRegBookmark />
            ) }
        </button>

        { inputCaptured && !isVoteComplete && (
            <button
                className="btn-small ml-auto"
                onClick={handleVoteClick}
                disabled={loading}
            >
                { loading ? "Submitting..." : "Submit" }
            </button>
        ) }

    </div>
  )
}

export default PollActions
