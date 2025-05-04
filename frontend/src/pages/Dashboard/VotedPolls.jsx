// src/pages/VotedPolls.jsx
import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useNavigate } from "react-router-dom";

import DashBoardLayout from "../../components/layout/DashBoardLayout";
import useUserAuth from "../../hooks/useUserAuth";
import EmptyCard from "../../components/cards/EmptyCard";
import PollCard from "../../components/PollCards/PollCard";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/api_Paths";

import CREATE_ICON from "../../assets/images/my-poll-icon.png";

const PAGE_SIZE = 3;

export default function VotedPolls() {
  useUserAuth();
  const navigate = useNavigate();

  const [polls, setPolls] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchVotedPolls = async (requestedPage = 1) => {
    if (loading) return;
    setLoading(true);

    try {
      const { data } = await axiosInstance.get(
        `${API_PATHS.POLLS.VOTED_POLLS}?page=${requestedPage}&limit=${PAGE_SIZE}`
      );

      const fetched = data.polls || [];
      setPolls(prev =>
        requestedPage === 1 ? fetched : [...prev, ...fetched]
      );
      setHasMore(fetched.length === PAGE_SIZE);
    } catch (err) {
      console.error("Failed to fetch voted polls:", err);
    } finally {
      setLoading(false);
    }
  };

  // On mount, and whenever `page` changes
  useEffect(() => {
    fetchVotedPolls(page);
  }, [page]);

  // Reset to page 1 when the component first mounts
  // (or if you later add a filter dependency)
  useEffect(() => {
    setPage(1);
  }, []);

  const loadMore = () => setPage(prev => prev + 1);

  return (
    <DashBoardLayout activeMenu="Voted Polls">
      <div className="my-5 mx-auto max-w-2xl">
        <h2 className="text-xl font-medium text-black mb-4">Your Voted Polls</h2>

        {polls.length === 0 && !loading && (
          <EmptyCard
            imgSrc={CREATE_ICON}
            message="You haven’t voted on any polls yet."
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
              You’ve reached the end of your voted polls.
            </p>
          }
        >
          {polls.map(poll => (
            <PollCard
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
            />
          ))}
        </InfiniteScroll>
      </div>
    </DashBoardLayout>
  );
}
