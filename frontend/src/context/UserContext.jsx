import React, { createContext, useState } from 'react'

export const UserContext = createContext()
const UserProvider = ({children}) => {
    const [user,setUser] = useState(null)

    //Function to Update user data 
    const updateUser = (userData) => {
      setUser(userData)
    }

    console.log("updateUser",user)

    // clearUser ( eg .on logout )
    const clearUser = () => {
      setUser(null)
    }

    // Update user Stats
    const updateUserStats = (key,value) => {
      setUser((prev) => ({
        ...prev,
        [key]:value,
      }));
    };

    // Update totalPollsVotes count locally
    const onUserVoted = () => {
      const totalPollsVotes = user.totalPollsVotes || 0;
      updateUserStats("totalPollsVotes", totalPollsVotes + 1);
    }

    // Update totalPollsCreated count locally
    const onPollCreateOrDelete = ( type = 'create' ) => {
      const totalPollsCreated = user.totalPollsCreated || 0;
      updateUserStats(
        "totalPollsCreated",
        type == "create" ? totalPollsCreated + 1 : totalPollsCreated -1
      );
    }

    // Add or remove pollId from Bookmark 
    const toggleBookmarkId = (id) => {
      const bookmarks = user.bookmarkedPolls || [];

      const index = bookmarks.indexOf(id);

      if(index === -1 ){
        // Add the ID if it is not in the array
        setUser((prev) => ({
          ...prev,
          bookmarkedPolls : [...bookmarks,id],
          totalPollsBookmarked : prev.totalPollsBookmarked + 1,
        }));
      }else{
        // Remove If it is already there
        setUser((prev) => ({
          ...prev,
          bookmarkedPolls : bookmarks.filter((item) => item !== id ),
          totalPollsBookmarked : prev.totalPollsBookmarked - 1,
        }));
      }

    }


  return (
    <UserContext.Provider
      value={{
        user,
        updateUser,
        clearUser,
        onPollCreateOrDelete,
        onUserVoted,
        toggleBookmarkId,
        
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export default UserProvider
