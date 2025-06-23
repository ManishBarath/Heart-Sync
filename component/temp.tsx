// src/component/ChatRoomHeader.tsx
import { View, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Feather, SimpleLineIcons } from '@expo/vector-icons';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { UserType } from '@/constants/types'; // Adjust path if needed
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth, UserProfile } from '@/context/AuthContext';
import { Menu, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import { MenuItems } from './CustomMenuItems';
import { Image } from 'expo-image';
import { blurhash } from '../utils/common';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

// Define a consistent color palette
const colors = {
  primary: '#EC4899', // A vibrant pink, close to pink-500
  text: '#1F2937',     // A dark gray for text
  white: '#FFFFFF',
};
const ios = Platform.OS == 'ios';

export default function ChatRoomHeader({route} : any) {
    const { top } = useSafeAreaInsets();
    const {user } = useAuth();
    const [partnerProfileURL , setPartnerProfileURL] = useState('https://via.placeholder.com/150')

    useEffect(() =>{
      getPartnerProfile();
    },[])
    const getPartnerProfile = async () => {
      const partnerId = user?.partnerId;
      if (!partnerId) {
        Alert.alert('Error', 'Partner ID not found.');
        return;
      }
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('userId', '==', partnerId), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          Alert.alert('Not Found', 'No user found with that ID.');
          return;
        }

        const partnerDoc = querySnapshot.docs[0];
        const partnerData = partnerDoc.data() as UserProfile;
        // Now you can access partnerData.profileImageURL or other fields
        setPartnerProfileURL(partnerData?.profileImageURL ?? 'https://via.placeholder.com/150')
        // console.log('Partner Data:', partnerData);
        // console.log(partnerProfileURL)
      } catch (e) {
        console.log('Unable to fetch partner document', e);
      }

    }

    const changePartnerId = () => {
      
    }
    const removePartnerId = () => {

    }
  return (
    <View className="flex-row items-center justify-between  p-4 pb-1 bg-white"
    style={{ paddingTop: ios ? top : top + 10 }}
    >
      <Image
        style={{ height: hp(5), aspectRatio: 1, borderRadius: 100 }}
        source= {partnerProfileURL}
        placeholder={{ blurhash }}
        transition={1000}
      />

      {/* User Name */}
      <View className="flex-1 ">
        <Text
          style={{
            fontSize: hp(2.2),
            color: colors.text,
            fontFamily: 'Poppins-Bold',
            paddingLeft : hp(2)
          }}
          className="font-bold capitalize"
        >
          {user?.partnerName || 'Chat'}
        </Text>
      </View>

      {/* Action Icons */}
      <View className="flex-row items-center">
        <TouchableOpacity style = {{paddingEnd : hp(2)}} >
          <Feather name="phone" size={hp(3)} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity  style = {{paddingEnd : hp(1)}}>
          <Feather name="video" size={hp(3)} color={colors.primary} />
        </TouchableOpacity>
      <View>
        <Menu>
          <MenuTrigger style = {{paddingEnd : hp(1) , paddingStart : hp(1)}} >
            <SimpleLineIcons name='options-vertical' size={hp(2.5)} color={colors.primary}/>
          </MenuTrigger>
          <MenuOptions
            customStyles={{
              optionsContainer: {
                width: 160,
                borderRadius: 10,
                borderCurve: 'continuous',
                padding: 0,
                marginTop: 40,
                marginLeft: 0,
                backgroundColor: 'white',
                shadowOffset: {
                  width: 0,
                  height: 0,
                },
                shadowOpacity: 0.2,
                alignItems : 'center'
              },
            }}
          >
            <MenuItems
              text="Remove Partner's ID"
              action={changePartnerId}
              value={null}
            />
            {/* <Divider /> */}
          </MenuOptions>
        </Menu>
      </View>
      </View>
    </View>
  );
}

const Divider = () => {
  return <View className="p-[1px] w-full bg-neutral-200" />;
};