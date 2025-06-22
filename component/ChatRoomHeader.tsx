import { View, Text, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Image } from 'expo-image';
import { DocumentData } from 'firebase/firestore';


interface ChatRoomHeaderProps {
  user: DocumentData;
  router: { back: () => void };
}

export default function ChatRoomheader({ user, router }: ChatRoomHeaderProps) {
  return (
    <Stack.Screen
      options={{
        title: ' ',
        headerShadowVisible: false,
        headerLeft: () => (
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => router.back()}>
              <Entypo name="chevron-left" size={hp(3.5)} color="#737373" />
            </TouchableOpacity>
            <View className="flex-row items-center gap-3">
              <Image
                source={require('../assets/images/icon.png')}
                style={{ height: hp(4.5), borderRadius: 100, aspectRatio: 1 }}
              />
              <Text className="font-medium text-neutral-700" style={{ fontSize: hp(2.5) }}>
                {user?.username}
              </Text>
            </View>
          </View>
        ),
        headerRight: () => (
          <View className="flex-row items-center gap-7">
            <Ionicons name="call" size={hp(2.8)} color="#737373" />
            <Ionicons name="videocam" size={hp(2.8)} color="#737373" />
          </View>
        ),
      }}
    />
  );
}