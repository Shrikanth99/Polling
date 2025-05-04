import React, { useState } from 'react'
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import SideMenu from './SideMenu';


const NavBar = ({activeMenu}) => {

    const [openSideMenu, setopenSideMenu] = useState(false)

  return (  
    <div className=' flex gap-5 border-b border-white bg-slate-50/50 backdrop-blur-[2px] p-4 fi top-0 z-30 ' >

        <button className=' block lg:hidden text-black '
            onClick={ () => setopenSideMenu(!openSideMenu) }
        >
            {openSideMenu ? <HiOutlineX className='text-2xl' /> : <HiOutlineMenu className='text-2xl' />}
        </button>

        <h2 className='text-lg font-medium text-black  '>Polling App</h2>

        { openSideMenu && ( 
            <div className='  fixed top-[64px] -ml-5 bg-white ' >
                <SideMenu activeMenu={activeMenu} />
            </div>
         ) }

    </div>
  )
}

export default NavBar
