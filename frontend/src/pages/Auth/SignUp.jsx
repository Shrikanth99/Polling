import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import ProfilePhotoSelector from "../../components/input/PhotoSelector";
import AuthInput from "../../components/input/AuthInput";
import { validateEmail } from "../../utils/helper";
import { UserContext } from "../../context/UserContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/api_Paths";
import uploadImage from "../../utils/uploadImage";

const SignUp = () => {
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState(null);

  const {updateUser} = useContext(UserContext)

  // handle Signup Form
  const handleSignUp = async (e) => { 
    e.preventDefault();
    let profileImageUrl = ''
    if (!fullName) {
      setError("Please enter a Full Name.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!username) {
      setError("Please enter UserName.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }
    setError("");
    // Sign up API
    try {
      // upload image if present
      if(profilePic){
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes.imageUrl || ''
      }


      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        fullName,
        username,
        email,
        password,
        profileImageUrl
      });

      const {token,user} = response.data
      if(token){
        localStorage.setItem('token',token)
        updateUser(user)
      }
      setError('')
      navigate('/dashboard')

    } catch (e) {
      console.log('ct',e)
      if( e.response){
        setError(e.response.data.message)
      }else{
        setError(`Something went wrong. Please try again,${e.message}`)
      }
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[100%] h-auto md:h-full mt-10 md:mt-1 flex flex-col justify-center ">
        <h3 className="text-xl font-semibold text-black ">Create An Account</h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-6">
          Join us today by entering your details below.
        </p>

        {/* sign-up form */}
        <form onSubmit={handleSignUp}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AuthInput
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Enter Full Name"
              placeholder="Rohit Sharma"
              type="text"
            />
            <AuthInput
              value={username}
              onChange={({ target }) => setUserName(target.value)}
              label="Enter User Name"
              placeholder="@...."
              type="text"
            />
            <AuthInput
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="Email Address"
              placeholder="john@gmail.com"
              type="text"
            />
            <AuthInput
              value={password}
              onChange={({ target }) => setPassword(target.value)}
              label="Enter Password"
              placeholder="Min 8 Characters"
              type="password"
            />
          </div>

          {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

          <button type="submit" className="btn-primary">
            Create Account
          </button>

          <p>
            Already have an account?{" "}
            <Link
              className="font-medium text-[var(--color-primary)] "
              to="/login"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
