import React, { useContext, useState } from 'react'
import DashBoardLayout from '../../components/layout/DashBoardLayout'
import useUserAuth from '../../hooks/useUserAuth'
import { UserContext } from '../../context/UserContext';
import { POLL_TYPE } from '../../utils/data';
import OptionInput from '../../components/input/OptionInput';
import OptionImageSelector from '../../components/input/OptionImageSelector';
import uploadImage from '../../utils/uploadImage';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/api_Paths';
import toast from 'react-hot-toast';

const CreatePoll = () => {

  useUserAuth();

  const { user, onPollCreateOrDelete } = useContext(UserContext);

  const [pollData, setpollData] = useState({
    question : "",
    type : "", 
    options : [],
    imageOptions : [],
    error : ""
  });

  const handleValueChange = (key,value) => {
    setpollData( prev => ({
      ...prev, [key] : value
    }) );
    if(pollData.error){
      setpollData(pollData.error='')
    }
  }

  // Upload Images and Get Image Urls
  const updateImageAndGetLink = async(imageOptions) => {
    console.log('imgOpts',imageOptions)
    const optionPromises  = imageOptions.map(async(imageOption) => {
      try {
        const imgUploadRes = await uploadImage(imageOption.file);
        console.log('imgUploadRes',imgUploadRes)
        return imgUploadRes.imageUrl || ""; 
      } catch (e) {
        toast.error(`Error uploading Image:${imageOption.file.name}`);
        return "";
      }
    });

    console.log('optionPromises',optionPromises)
    const optionArr = await Promise.all(optionPromises);
    console.log('OpArr',optionArr)
    return optionArr;
  }

  const getOptions = async () => {
    switch(pollData.type){
      case 'single-choice':
        return pollData.options;

      case 'image-based':
        const options = await updateImageAndGetLink(pollData.imageOptions)
        return options;

      default:
        return [];
    }
  }

  // Clear Data 
  const clearData = () => {
    setpollData({
      question : "",
      type : "", 
      options : [],
      imageOptions : [],
      error : ""
    })
  }

  const handleCreatePoll = async () => {
    const {question, type, options, imageOptions ,error} = pollData;

    if(!question || !type){
      // console.log('Create',{question, type, options, error})
      handleValueChange('error', `Questions and Poll-Types are required` );
      return;
    }

    if( type === 'single-choice' && options.length < 2 ){
      handleValueChange('error',`Add Minimum 2 options`);
      return;
    }

    if( type === 'image-based' && imageOptions.length < 2 ){
      handleValueChange('error',`Add Minimum 2 Images`);
      return;
    }
    handleValueChange("error")
    console.log('PD',pollData)

    const optionData = await getOptions()

    console.log('Built options for backend:', optionData);

    try {
      const response = await axiosInstance.post(API_PATHS.POLLS.CREATE,{
        question,
        type,
        options : optionData,
        creatorId : user._id,

      });
      if(response){
        console.log('Cp',response.data     )
        toast.success('Poll Created Successfully!')
        onPollCreateOrDelete()
        clearData();

      }
    } catch (e) {
       if(e.response && e.response.data.message) {
        toast.error(e.response.data.message);
        handleValueChange('error',e.response.data.message);
       }else{
        handleValueChange('error','Something went Wrong. please try again');
       }
    }
    // Reset Form
    // setpollData({
    //   question : "",
    //   type : "", 
    //   options : [],
    //   imageOptions : [],
    //   error : ""
    // })

  }


  return (
    <DashBoardLayout activeMenu='Create Poll' >
    <div className=' bg-gray-100/80 my-5 p-5 rounded-lg mx-auto  ' >
      <h2 className=' text-lg text-black font-medium ' > Create Poll </h2>

      <div className=' mt-3 ' >
        <label className='text-xs font-medium text-slate-600 ' >Question</label>
        <textarea
          placeholder= " what's in your mind "
          className=' w-full text-[13px] text-black outline-none bg-slate-200/80 p-2 rounded-md mt-2  '
          rows={4}
          value={pollData.question}
          onChange={ ({target}) => handleValueChange( 'question', target.value )  }
        />
      </div>

      <div className=' mt-3 ' >
        <label className='text-xs font-medium text-slate-600 ' >Poll-Type</label>
        <div className=' flex gap-4 flex-wrap mt-3 ' >
          { POLL_TYPE?.map((item) => (
            <div
              key={item.value}
              className={`option-chip ${ pollData.type === item.value ? " text-white bg-primary " : " border-sky-100 " } ` }
              onClick={() => {
                handleValueChange('type',item.value)
              }}
            >
              { item.label }
            </div>
          )) }
        </div>
      </div>

      { pollData.type === 'single-choice' && (
        <div className='mt-5  ' >
          <label className='text-xs font-medium text-slate-600 ' > Options </label>

          <div className='mt-3  ' >
            <OptionInput
              optionList={ pollData.options }
              setOptionList={ (value) => {
                handleValueChange('options',value)
              } }
            />
          </div>

        </div>
      ) }

      { pollData.type === 'image-based' && (
        <div className='mt-5  ' >
          <label className='text-xs font-medium text-slate-600 ' > Image Options </label>

          <div className='mt-3 ' >
            <OptionImageSelector
              
              imageList={pollData.imageOptions}
              setImageList={(value) => {
                handleValueChange('imageOptions', value);
              }}
            />
          </div>

        </div>
      ) }

      { pollData?.error && (
        <p 
          className=' text-xs font-medium text-red-500 mt-5 '
        >{pollData.error && pollData.error }</p>
      ) }

      <button
        className='btn-primary py-2 mt-6'
        onClick={handleCreatePoll}
      >
        create Poll
      </button>

    </div>
    </DashBoardLayout>
  )
}

export default CreatePoll
