import React from 'react';
import { Tabs } from 'expo-router';
import { View, Platform } from 'react-native';
import { AntDesign, Fontisto } from '@expo/vector-icons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Image } from 'expo-image';
import { icons } from '@/constants/icons';
import HomeHeader from '@/component/HomeHeader';
import ChatRoomheader from '@/component/ChatRoomHeader';

const TabsIcon = ({ focused, icon } : any) => {
  return (
    <View
      className='size-full justify-center items-center mt-4 rounded-full'
    >
      <Image source={icon} style = {{ width: 30,
    height: 30, tintColor: focused ? 'white' : 'black'}}/>
    </View>
  );
};

export default function _layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarStyle: {
          backgroundColor: '#FF4D6D',
          borderRadius: wp(5),
          marginHorizontal: wp(0.5),
          height: hp(5),
          position: 'absolute',
          overflow: 'hidden',
          bottom: Platform.OS === 'ios' ? hp(2) : hp(1),
          borderWidth: 1,
          borderColor: '#FF4D6D',
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: 'Home',
            tabBarIcon: ({ focused }) => (
            <TabsIcon focused={focused} icon={icons.heart} title="Chat" />
          ),
          header: () => <HomeHeader />,
        }}
      />
      <Tabs.Screen
        name="Calender"
        options={{
          title: 'Calender',
          // header: () => <HomeHeader />,
          tabBarIcon: ({ focused }) => (
            <>
            <View
              className='size-full justify-center items-center mt-4 rounded-full'>
                <Fontisto name="date" size={24} color={focused ? 'white' : 'black'} />

            </View>
            </>
          ),
        }}
      />
      {/* <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabsIcon focused={focused} icon={icons.profile} title="Chat" />
          ),
          header: () => <HomeHeader />,
        }}
      /> */}
      <Tabs.Screen
        name="ChatRoom"
        options={{
          title: 'ChatRoom',
          tabBarIcon: ({ focused }) => (
            <TabsIcon focused={focused} icon={icons.message} title="Chat" />
          ),
          // headerShown:false
        //   header: () => <ChatRoomheader  {}/>,
        }}
      />
    </Tabs>
  );
}
