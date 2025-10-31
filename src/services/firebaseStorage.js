import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable 
} from 'firebase/storage';
import { storage, auth } from '../config/firebase';

// Helper function to get current user ID
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
};

// Storage Service
export const storageService = {
  /**
   * Upload a file to Firebase Storage
   * @param {File} file - The file to upload
   * @param {string} folder - The folder path in storage (e.g., 'recipes', 'notes', 'profile')
   * @param {Function} onProgress - Optional callback for upload progress
   * @returns {Promise<{url: string, path: string}>} - The download URL and storage path
   */
  async uploadFile(file, folder = 'uploads', onProgress = null) {
    try {
      const userId = getCurrentUserId();
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storagePath = `users/${userId}/${folder}/${fileName}`;
      const storageRef = ref(storage, storagePath);

      if (onProgress) {
        // Upload with progress tracking
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(progress);
            },
            (error) => {
              console.error('Upload error:', error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({
                url: downloadURL,
                path: storagePath
              });
            }
          );
        });
      } else {
        // Simple upload without progress tracking
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return {
          url: downloadURL,
          path: storagePath
        };
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  /**
   * Upload multiple files
   * @param {FileList|Array<File>} files - The files to upload
   * @param {string} folder - The folder path in storage
   * @returns {Promise<Array<{url: string, path: string}>>} - Array of download URLs and paths
   */
  async uploadMultipleFiles(files, folder = 'uploads') {
    try {
      const uploadPromises = Array.from(files).map(file => 
        this.uploadFile(file, folder)
      );
      
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      throw error;
    }
  },

  /**
   * Upload a profile picture
   * @param {File} file - The image file to upload
   * @returns {Promise<string>} - The download URL
   */
  async uploadProfilePicture(file) {
    try {
      const userId = getCurrentUserId();
      const storagePath = `users/${userId}/profile/avatar`;
      const storageRef = ref(storage, storagePath);
      
      // Delete existing profile picture if it exists
      try {
        await deleteObject(storageRef);
      } catch (error) {
        // Ignore error if file doesn't exist
        console.log('No existing profile picture to delete');
      }
      
      // Upload new profile picture
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  },

  /**
   * Delete a file from Firebase Storage
   * @param {string} storagePath - The full path to the file in storage
   * @returns {Promise<boolean>} - Success status
   */
  async deleteFile(storagePath) {
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      if (error.code === 'storage/object-not-found') {
        console.log('File not found, considering as deleted');
        return true;
      }
      throw error;
    }
  },

  /**
   * Delete multiple files
   * @param {Array<string>} storagePaths - Array of storage paths
   * @returns {Promise<boolean>} - Success status
   */
  async deleteMultipleFiles(storagePaths) {
    try {
      const deletePromises = storagePaths.map(path => 
        this.deleteFile(path)
      );
      
      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error('Error deleting multiple files:', error);
      throw error;
    }
  },

  /**
   * Get download URL from storage path
   * @param {string} storagePath - The full path to the file in storage
   * @returns {Promise<string>} - The download URL
   */
  async getDownloadURL(storagePath) {
    try {
      const storageRef = ref(storage, storagePath);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  },

  /**
   * Upload base64 image
   * @param {string} base64String - The base64 encoded image
   * @param {string} folder - The folder path in storage
   * @param {string} fileName - The file name
   * @returns {Promise<{url: string, path: string}>} - The download URL and storage path
   */
  async uploadBase64Image(base64String, folder = 'images', fileName = 'image.png') {
    try {
      // Convert base64 to blob
      const response = await fetch(base64String);
      const blob = await response.blob();
      
      // Create a File object from the blob
      const file = new File([blob], fileName, { type: blob.type });
      
      // Upload the file
      return await this.uploadFile(file, folder);
    } catch (error) {
      console.error('Error uploading base64 image:', error);
      throw error;
    }
  }
};

export default storageService;
