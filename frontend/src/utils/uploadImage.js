import { API_PATHS } from "./api_Paths";
import axiosInstance from "./axiosInstance";

const uploadImage = async (imageFile) => {
    console.log('ImgFile',imageFile)
    const formData = new FormData();

    formData.append('image',imageFile);

    console.log('formData-Imag',formData.get('image'))

    try {
        const response = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE,formData,{
            headers : {
                'Content-Type': 'multipart/form-data'  // setting header for file upload
            }
        });
        console.log('image-res',response.data)
        return response.data // return response data from server
        
    } catch (error) {
        console.error('Error uploading the image', error)
        throw error
    }
};

export default uploadImage;