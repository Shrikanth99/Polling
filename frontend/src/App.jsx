import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import {Toaster} from 'react-hot-toast'
import Login from './pages/Auth/Login'
import SignUp from './pages/Auth/SignUp'
import Home from './pages/Dashboard/Home'
import CreatePoll from './pages/Dashboard/CreatePoll'
import MyPolls from './pages/Dashboard/MyPolls'
import VotedPolls from './pages/Dashboard/VotedPolls'
import Bookmarks from './pages/Dashboard/Bookmarks'
import UserProvider from './context/UserContext'


const App = () => {
  return (
    <div>
      <UserProvider>
        
      <Routes>
        <Route path='/' element={<Root/>} />
        <Route path='/login' exact element={<Login/>} />
        <Route path='/signup' exact element={<SignUp/>} />
        <Route path='/dashboard' exact element={<Home/>} />
        <Route path='/create-poll' exact element={<CreatePoll/>} />
        <Route path='/my-polls' exact element={<MyPolls/>} />
        <Route path='/voted-polls' exact element={<VotedPolls/>} />
        <Route path='/bookmarked-polls' exact element={<Bookmarks/>} />
      </Routes>
      <Toaster
        toastOptions={{
          className:'',
          style : {
            fontSize : '13px'
          },
        }}
      />
      </UserProvider>
    </div>
  )
}

export default App


// definig the Root component to handle the initial redirect

const Root = () => {

  const isAuthenticated = !!localStorage.getItem('token')

  return isAuthenticated ? (
    <Navigate to='/dashboard' />
  ) : (
  <Navigate to='/login' />
  )

}