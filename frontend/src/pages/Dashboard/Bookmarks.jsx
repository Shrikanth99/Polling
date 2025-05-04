// src/pages/BookmarkedPolls.jsx
import React, { useEffect, useState, useCallback, useContext } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useNavigate } from "react-router-dom";

import DashBoardLayout from "../../components/layout/DashBoardLayout";
import useUserAuth from "../../hooks/useUserAuth";
import EmptyCard from "../../components/cards/EmptyCard";
import PollCard from "../../components/PollCards/PollCard";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/api_Paths";

import BOOKMARK_ICON from "../../assets/images/bookmark-icon.png";
import { UserContext } from "../../context/UserContext";

const PAGE_SIZE = 3;

export default function BookmarkedPolls() {
  useUserAuth();
  const navigate = useNavigate();
  const {user} = useContext(UserContext);

  const [polls, setPolls] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  console.log("User:", user);

  // Fetch bookmarked polls page
  const fetchBookmarkedPolls = useCallback(async (reqPage = 1) => {
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(
        `${API_PATHS.POLLS.GET_BOOKMARKED_POLL}?page=${reqPage}&limit=${PAGE_SIZE}`
      );
      const fetched = data.polls || [];
      setPolls(prev => (reqPage === 1 ? fetched : [...prev, ...fetched]));
      setHasMore(fetched.length === PAGE_SIZE);
    } catch (err) {
      console.error("Failed to fetch bookmarked polls:", err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Remove a bookmarked poll and update UI
  const handleRemoveBookmark = useCallback(async (pollId) => {
    try {
      await axiosInstance.post(API_PATHS.POLLS.BOOKMARK_POLL(pollId));
      setPolls(prev => prev.filter(p => p._id !== pollId));
    } catch (err) {
      console.error("Error removing bookmark:", err);
    }
  }, []);

  // Load initial page and on page change
  useEffect(() => {
    fetchBookmarkedPolls(page);
  }, [page]);

  // Reset to first page on mount
  useEffect(() => {
    setPage(1);
  }, []);

  const loadMore = () => setPage(prev => prev + 1);

  return (
    <DashBoardLayout activeMenu="Bookmarked Polls">
      <div className="my-5 mx-auto max-w-2xl">
        <h2 className="text-xl font-medium text-black mb-4">
          Your Bookmarked Polls
        </h2>

        {polls.length === 0 && !loading && (
          <EmptyCard
            imgSrc={BOOKMARK_ICON}
            message="You haven’t bookmarked any polls yet."
            btnText="Browse Polls"
            onClick={() => navigate("/dashboard")}
          />
        )}

        <InfiniteScroll
          dataLength={polls.length}
          next={loadMore}
          hasMore={hasMore}
          loader={<h4 className="text-center py-4">Loading...</h4>}
          endMessage={
            <p className="text-center py-4 text-gray-500">
              You’ve reached the end of your bookmarked polls.
            </p>
          }
        >
          {polls.map(poll => {
            if(!user?.bookmarkedPolls.includes(poll._id)) return null; // Ensure the poll is still bookmarked by the user

            return(  <PollCard
              key={poll._id}
              pollId={poll._id}
              question={poll.question}
              type={poll.type}
              options={poll.options}
              voters={poll.voters.length}
              responses={poll.responses}
              creatorProfileImg={poll.creator.profileImageUrl}
              creatorName={poll.creator.fullName}
              creatorUserName={poll.creator.username}
              userHasVoted={poll.userHasVoted}
              isPollClosed={poll.closed}
              createdAt={poll.createdAt}
              toggleBookmark={() => handleRemoveBookmark(poll._id)}
            />)
  })}
        </InfiniteScroll>
      </div>
    </DashBoardLayout>
  );
}
