// src/component/ChatRoomHeader.tsx
import { View, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Feather, SimpleLineIcons } from '@expo/vector-icons';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth, UserProfile } from '@/context/AuthContext';
import { Menu, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import { MenuItems } from './CustomMenuItems';
import { Image } from 'expo-image';
import { blurhash } from '../utils/common';
import {
  collection,
  getDocs,
  limit,
  query,
  where,
  doc,
  updateDoc,
  FieldValue,
  deleteField,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/firebaseConfig';

// Define a consistent color palette
const colors = {
  primary: '#EC4899', // A vibrant pink, close to pink-500
  text: '#1F2937',     // A dark gray for text
  white: '#FFFFFF',
};
const ios = Platform.OS === 'ios';

export default function ChatRoomHeader() {
  const { top } = useSafeAreaInsets();
  // MODIFIED: Get setUser from context to update state after unlinking
  const { user, setUser } = useAuth();
  const [partnerProfileURL, setPartnerProfileURL] = useState('https://via.placeholder.com/150');
  const [partnerName, setPartnerName] = useState('');

  useEffect(() => {
    if (user?.partnerId) {
      getPartnerProfile();
    }
  }, [user]);

  useEffect(() => {
  if (!user?.partnerId) {
    setPartnerProfileURL('https://via.placeholder.com/150');
    setPartnerName('');
  }else{
    getPartnerProfile();
  }
}, [user?.partnerId]);

  const getPartnerProfile = async () => {
    const partnerId = user?.partnerId;
    if (!partnerId) return;

    try {
      const partnerDocRef = doc(db, 'users', partnerId);
      const partnerDocSnap = await getDoc(partnerDocRef);

      if (partnerDocSnap.exists()) {
        const partnerData = partnerDocSnap.data() as UserProfile;
        setPartnerProfileURL(partnerData?.profileImageURL || 'https://via.placeholder.com/150');
        setPartnerName(partnerData?.username || '');
      } else {
        console.log('Partner document not found.');
      }
    } catch (e) {
      console.log('Unable to fetch partner document', e);
    }
  };

  const handleRemovePartner = () => {
    if (!user?.userId || !user?.partnerId) {
      Alert.alert("Error", "No partner is currently connected.");
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
      "Are you sure you want to remove your partner? This action will unlink both of you and cannot be undone."
      );
      if (!confirmed) return;

      const currentUserId = user.userId;
      const partnerId = user.partnerId!;

      (async () => {
      try {
        const currentUserRef = doc(db, "users", currentUserId);
        const partnerUserRef = doc(db, "users", partnerId);

        await updateDoc(currentUserRef, {
        partnerId: deleteField(),
        });
        await updateDoc(partnerUserRef, {
        partnerId: deleteField(),
        });

        setUser((prevUser) => {
        if (!prevUser) return null;
        const { partnerId, ...rest } = prevUser;
        return rest;
        });
        window.alert("You have been unlinked from your partner.");
      } catch (error) {
        console.error("Error unlinking partner:", error);
        window.alert("Failed to unlink. Please try again.");
      }
      })();
    } else {
      Alert.alert(
      "Unlink Partner",
      "Are you sure you want to remove your partner? This action will unlink both of you and cannot be undone.",
      [
        {
        text: "Cancel",
        style: "cancel",
        },
        {
        text: "Unlink",
        style: "destructive",
        onPress: async () => {
          const currentUserId = user.userId;
          const partnerId = user.partnerId!;

          try {
          const currentUserRef = doc(db, "users", currentUserId);
          const partnerUserRef = doc(db, "users", partnerId);

          await updateDoc(currentUserRef, {
            partnerId: deleteField(),
          });
          await updateDoc(partnerUserRef, {
            partnerId: deleteField(),
          });

          setUser((prevUser) => {
            if (!prevUser) return null;
            const { partnerId, ...rest } = prevUser;
            return rest;
          });

          Alert.alert("Success", "You have been unlinked from your partner.");
          } catch (error) {
          console.error("Error unlinking partner:", error);
          Alert.alert("Error", "Failed to unlink. Please try again.");
          }
        },
        },
      ]
      );
    }
  };

  return (
    <View
      className="flex-row items-center justify-between p-4 pb-1 bg-white"
      style={{ paddingTop: ios ? top : top + 10 }}
    >
      <Image
        style={{ height: hp(5), aspectRatio: 1, borderRadius: 100 }}
        source={partnerProfileURL}
        placeholder={{ blurhash }}
        transition={500}
      />

      <View className="flex-1">
        <Text
          style={{
            fontSize: hp(2.2),
            color: colors.text,
            fontFamily: 'Poppins-Bold',
            paddingLeft: hp(2),
          }}
          className="font-bold capitalize"
        >
          {partnerName}
        </Text>
      </View>

      <View className="flex-row items-center">
        <TouchableOpacity style = {{paddingEnd : hp(2)}} >
            <Feather name="phone" size={hp(3)} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity  style = {{paddingEnd : hp(1)}}>
            <Feather name="video" size={hp(3)} color={colors.primary} />
          </TouchableOpacity>
        <Menu>
          <MenuTrigger style={{ paddingHorizontal: hp(1) }}>
            <SimpleLineIcons name='options-vertical' size={hp(2.5)} color={colors.primary} />
          </MenuTrigger>
          <MenuOptions
            customStyles={{
              optionsContainer: {
                width: 180, // Increased width for better text fit
                borderRadius: 10,
                marginTop: 40,
                backgroundColor: 'white',
                shadowOpacity: 0.2,
              },
            }}
          >
            <MenuItems
              text="Unlink Partner"
              action={handleRemovePartner} 
              value={null}
              icon={<Feather name="user-x" size={hp(2.5)} color="#EF4444" />} 
            />
          </MenuOptions>
        </Menu>
      </View>
    </View>
  );
}