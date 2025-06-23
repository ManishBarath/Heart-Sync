const  uploadImageToCloudinary = async (uri: string) => {
    const CLOUD_NAME = 'deih8wngr'; 
    const UPLOAD_PRESET = 'HeartSync'; 

    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'image/jpeg', 
      name: 'profile.jpg',
    } as any);
    formData.append('upload_preset', UPLOAD_PRESET);

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error('Cloudinary upload failed: ' + (data.error?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error; // Re-throw the error to be caught by the calling function
    }
  };