import React, { useCallback, useContext } from "react";
import { SIDE_MENU_DATA } from "../../utils/data";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";

const SideMenu = ({ activeMenu }) => {
    const navigate = useNavigate()

    const {clearUser} = useContext(UserContext)

    const handleClick = (route) => {
        if(route === 'logout'){
            handleLogOut()
            return
        }
        navigate(route)
    }

    const handleLogOut = () => {
        localStorage.clear()
        clearUser();
        navigate('/login')
    }

  return (
    <div className=" w-64 h-[calc(100vh - 61px)] md:h-screen border-r border-slate-100/70 p-5 sticky top-[61px] z-20 ">
      {SIDE_MENU_DATA.map((item, index) => (
        <button
          key={item.id || index}
          className={`w-full flex items-center gap-4 text-[15px] ${
            activeMenu == item.label ? "text-white bg-primary" : ""
          } py-4 px-6 rounded-full mb-3 `}
          onClick={() => handleClick(item.path) }
        >
          <item.icon className="text-xl" />
          {item.label}{" "}
        </button>
      ))}
    </div>
  );
};

export default SideMenu;
