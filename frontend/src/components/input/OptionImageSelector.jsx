import React from "react";
import { HiOutlineTrash } from "react-icons/hi";
import { HiMiniPlus } from "react-icons/hi2";

const OptionImageSelector = ({ imageList=[], setImageList }) => {
  // for Add image
  const handleAddImage = (e) => {
    const file = e.target.files[0];
    if (file && imageList.length < 4) {
      const reader = new FileReader();
       reader.onload = () => {
        // Add obj with base Url
        setImageList([...imageList, { base64: reader.result, file }]);
      };
      reader.readAsDataURL(file);
      e.target.file = null;
    }
  };

  // console.log(imageList);

  // for delete image
  const handleDeleteImage = (i) => {
    const newArr =  imageList.filter( (_,idx) => idx !== i );
    setImageList(newArr);
  };

  return (
    <div>
      {imageList.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {imageList.map((item, index) => (
            <div key={index} className=" bg-gray-600/10 rounded-md border-red-400 relative ">
              <img
                className="w-full h-36 object-contain bg-cover rounded-md "
                src={ item.base64 }
                alt=""
              />

              <button
                className="text-red-500 bg-gray-100 rounded-full p-2 absolute top-1 right-1 "
                onClick={() => handleDeleteImage(index)}
              >
                <HiOutlineTrash className="text-lg" />
              </button>
            </div>
          ))}
        </div>
      )}

      {imageList.length < 4 && (
        <div className=" flex items-center gap-5 ">
          <input
            type="file"
            accept="image/jpeg, image/png "
            onChange={handleAddImage}
            className="hidden"
            id="imageInput"
          />
          <label htmlFor="imageInput" className="btn-small text-black text-nowrap py-2 cursor-pointer font-bold ">
            <HiMiniPlus className="text-lg " />
            Select Image
          </label>
        </div>
      )}
    </div>
  );
};

export default OptionImageSelector;
