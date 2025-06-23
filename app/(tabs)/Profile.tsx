import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
// REMOVED: We no longer need firebase/storage here
// import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useAuth, UserProfile } from '../../context/AuthContext';
// MODIFIED: We only need db from firebaseConfig now
import { db } from '../../firebaseConfig';

// A placeholder for the gallery images
const galleryImages = [
  'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'https://images.pexels.com/photos/1655901/pexels-photo-1655901.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'https://images.pexels.com/photos/1655901/pexels-photo-1655901.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
];

export default function Profile() {
  const { user, setUser: setAuthUser } = useAuth(); // We need setUser to update the context
  const router = useRouter();

  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Local state for editable fields
  const [username, setUsername] = useState(user?.username || '');
  const [profileImageUrl, setProfileImageUrl] = useState(
    user?.profileImageURL || 'https://via.placeholder.com/150'
  );

  // State for partner's data
  const [partner, setPartner] = useState<UserProfile | null>(null);

  // Populate local state from context user
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setProfileImageUrl(
        user.profileImageURL || 'https://via.placeholder.com/150'
      );
      // Fetch partner data if connected
      if (user.partnerId && !partner) {
        fetchPartnerData(user.partnerId);
      }
    }
  }, [user?.partnerId]);

  const fetchPartnerData = async (partnerId: string) => {
    const docRef = doc(db, 'users', partnerId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setPartner(docSnap.data() as UserProfile);
    }
  };

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfileImageUrl(result.assets[0].uri);
    }
  };
  
  const handleSaveChanges = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      let downloadUrl = profileImageUrl;

      // If the image is a local file (from the picker), upload it to Cloudinary
      if (profileImageUrl.startsWith('file://')) {
        // Call our new Cloudinary upload function
        downloadUrl = await uploadImageToCloudinary(profileImageUrl);
      }

      // Prepare data to update in Firestore (this part is the same)
      const updatedData = {
        username,
        profileImageURL: downloadUrl, // Save the Cloudinary URL
      };

      const userDocRef = doc(db, 'users', user.userId);
      await updateDoc(userDocRef, updatedData);

      // Update user in the AuthContext (this part is the same)
      setAuthUser((prevUser) => ({ ...prevUser!, ...updatedData }));

      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      Alert.alert('Error updating profile', error.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Feather name="chevron-left" size={hp(3.5)} color="#F472B6" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-neutral-800">Profile</Text>
        <TouchableOpacity
          onPress={() => setIsEditing(!isEditing)}
          className="p-2"
        >
          <Feather
            name={isEditing ? 'x-circle' : 'settings'}
            size={hp(3)}
            color="#4B5563"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Profile Picture */}
        <View className="items-center mt-4">
          <View className="relative">
            <View className="p-1 border-2 border-pink-400 rounded-full">
              <Image
                source={{ uri: profileImageUrl }}
                style={{ width: hp(16), height: hp(16) }}
                className="rounded-full"
              />
            </View>
            {isEditing && (
              <TouchableOpacity
                onPress={handlePickImage}
                className="absolute bottom-0 right-0 bg-pink-400 p-2 rounded-full border-2 border-white"
              >
                <Feather name="camera" size={hp(2)} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* User Info */}
        <View className="items-center mt-4 space-y-1">
          {isEditing ? (
            <TextInput
              value={username}
              onChangeText={setUsername}
              className="text-2xl font-bold text-neutral-800 text-center bg-gray-100 rounded-lg px-4 py-1"
            />
          ) : (
            <Text className="text-2xl capitalize font-bold text-neutral-800">
              {username || 'Username'}
            </Text>
          )}
          
        </View>

        {/* IDs Section */}
        <View className="mx-5 mt-8 p-4 bg-rose-50 rounded-2xl space-y-3">
          <View className="flex-row justify-between mb-3 items-center">
            <Text className="font-bold text-neutral-600">Your Unique ID</Text>
            <Text className="font-semibold text-pink-500">{user?.shortId}</Text>
          </View>
          {partner && (
            <>
              <View className="border-b border-gray-200 "  />
              <View className="flex-row justify-between  mt-3 items-center">
                <Text className="font-bold text-neutral-600">
                  Partner's Name
                </Text>
                <Text className="font-semibold text-pink-500">
                  {partner.username}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Save Button */}
        {isEditing && (
          <View className="mx-5 mt-6">
            <TouchableOpacity
              onPress={handleSaveChanges}
              disabled={isLoading}
              className="bg-pink-500 p-4 rounded-full flex-row justify-center items-center"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Gallery */}
        <View className="mx-5 mt-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xl font-bold text-neutral-800">Gallery</Text>
            <TouchableOpacity>
              <Text className="text-pink-500 font-semibold">Add Image</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap justify-between">
            {galleryImages.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={{ width: '32%', height: hp(15) }}
                className="rounded-xl mb-2"
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* This is a placeholder for your actual tab navigator */}
      
    </View>
  );
}