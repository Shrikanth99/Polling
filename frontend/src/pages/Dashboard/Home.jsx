import React, { useEffect, useState } from "react";
import InfiniteScroll from 'react-infinite-scroll-component';

import DashBoardLayout from "../../components/layout/DashBoardLayout";
import useUserAuth from "../../hooks/useUserAuth";
import { useNavigate } from "react-router-dom";
import HeaderWithFilter from "../../components/layout/HeaderWithFilter";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/api_Paths";
import PollCard from "../../components/PollCards/PollCard";
import EmptyCard from "../../components/cards/EmptyCard";

import CREATE_ICON from "../../assets/images/my-poll-icon.png"


const PAGE_SIZE = 3;

const Home = () => {
  useUserAuth();

  const navigate = useNavigate();

  const [allPolls, setAllPolls] = useState([]);
  const [stats, setStats] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [filterType, setFilterType] = useState("");

  const fetchAllPolls = async (overridepage = page) => {
    if (loading) return;
    setLoading(false);

    try {
      const response = await axiosInstance.get(
        `${API_PATHS.POLLS.GET_ALL_POLLS}?page=${overridepage}&limit=${PAGE_SIZE}&type=${filterType}`
      );
      if(response?.data?.polls?.length > 0){
        // updating polls with pagination
        setAllPolls((prevData) => 
          overridepage === 1 
            ? response.data.polls 
            : [...prevData, ...response.data.polls]
        );
        console.log('Stats:', response.data?.stats || [] );
        setStats(response.data?.stats || [] );
        setHasMore(response.data.polls.length === PAGE_SIZE )
      } else {
        setHasMore(false);
      }
      console.log('Allp',allPolls)
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const loadMorePolls = () => {
    setPage((prevPage) => prevPage + 1 );
  }

  useEffect(() => {
    setPage(1);
    fetchAllPolls(1);
    // clean-up
    return () => {
      
    }
  }, [filterType])

  useEffect(() => {
    if(page !== 1){
      fetchAllPolls();
    }
    //clean-up
    return () => {

    }
  },[page])
  

  return (
    <DashBoardLayout activeMenu="Dashboard" stats={stats || [] } showStats > 
      <div className="my-5 mx-auto">
        <HeaderWithFilter
          title="Polls"
          filterType={filterType}
          setFilterType={setFilterType}
        />

        { allPolls.length === 0 && !loading && (
          <EmptyCard
            imgSrc={CREATE_ICON}
            message="Welcome you're the first user of the system, and there are no Polls yet. Create the first poll "
            btnText="Create-Poll"
            onClick={() => navigate('/create-poll') }
          />

        ) }

        {/* Infinite Scroll Pagination */}

        <InfiniteScroll
          dataLength={allPolls.length}
          next={loadMorePolls}
          hasMore={hasMore}
          loader={ <h4 className="info-text" > Loading... </h4> }
          endMessage={ <p className="info-text" > No more polls to display. </p> }
        >
        { allPolls.map((poll) => (
          <PollCard
            key={`dashboard_${poll._id}`}
            pollId={poll._id}
            question={poll.question}
            type={poll.type}
            options={poll.options}
            voters={poll.voters.length || 0}
            responses={poll.responses || []}
            creatorProfileImg={poll.creator.profileImageUrl || null}
            creatorName={poll.creator?.fullName}
            creatorUserName={poll.creator?.username}
            userHasVoted={poll.userHasVoted || false}
            isPollClosed={poll.closed || false}
            createdAt={poll.createdAt || false}
          />
        )) }

        </InfiniteScroll>


      </div>
    </DashBoardLayout>
  );
};

export default Home;
