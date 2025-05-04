import React , {useContext, useState} from 'react'
import AuthLayout from '../../components/layout/AuthLayout'
import { Link, useNavigate } from 'react-router-dom'
import { validateEmail } from '../../utils/helper'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/api_Paths'
import { UserContext } from '../../context/UserContext'
import AuthInput from '../../components/input/AuthInput'

const Login = () => {
  const navigate = useNavigate()
  const [email,setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error,setError] = useState(null)

  const {updateUser} = useContext(UserContext)



  const handleLogin = async(e) => {
    e.preventDefault()

    if(!validateEmail(email)){
      setError("Please enter a valid email address.")
      return;
    }

    if(!password){
      setError("Please enter a password.")
      return;
    }
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,password,
      });
      const { token, user} = response.data;
      if(token){
        localStorage.setItem('token',token)
        updateUser(user)
        setError('')
        navigate('/dashboard')
      }
      
    } catch (e) {
      if( e){
        const msg = e.response?.data?.message || e.message;
        console.log("caught login error:", msg);
        setError(msg)
        // setError(e.response.data.message || e.message )
      }else{
        setError('Something went wrong. Please try again')
      }
    }


  }


  return (
    <AuthLayout>
    <div className='lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center ' >
      <h3 className='text-xl font-semibold text-black ' >Welcome</h3>
      <p className='text-xs text-slate-700 mt-[5px] mb-6' >
        Please Enter your details to log in
      </p> 
      <form onSubmit={handleLogin} >
        <AuthInput
          value={email}
          onChange = {({target}) => setEmail(target.value) }
          label='Email Address'
          placeholder = 'john@gmail.com'
          type='text'

        />
        <AuthInput
          value={password}
          onChange = {({target}) => setPassword(target.value) }
          label='Enter Password'
          placeholder = 'Min 8 Characters'
          type="password"

        />

        { error && <p className='text-red-500 text-xs pb-2.5' >{error}</p> }
 
        <button type='submit' className='btn-primary' >Login</button>

        <p>Don't have an account?{" "}
          <Link className='font-medium text-[var(--color-primary)] ' to='/signup'  >
            Signup
          </Link>
        </p>

      </form>
    </div>
    </AuthLayout>
  )
}

export default Login
