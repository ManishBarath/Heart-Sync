import { DocumentData } from 'firebase/firestore';
import { View, Text } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

interface MessageType {
  userId: string;
  text: string;
  createdAt: any;
  [key: string]: any;
}
interface MessageItemProps {
  message: MessageType;
  currentUser: DocumentData;
}

export default function MessageItem({ message, currentUser }: MessageItemProps) {
  const formatTime = (timestamp: any) => {
    const date = typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (currentUser?.userId === message?.userId) {
    // Sent message
    return (
      <View className="flex-row justify-end mb-3 mr-3">
        <View style={{ width: wp(80) }}>
          <View className="flex self-end p-3 rounded-2xl bg-white border border-neutral-200">
            <Text style={{ fontSize: hp(1.9) }}>{message?.text}</Text>
            <Text className="text-right mt-1 text-gray-500" style={{ fontSize: hp(1.4) }}>
              {formatTime(message.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    );
  } else {
    // Received message
    return (
      <View style={{ width: wp(80) }} className="ml-3 mb-3">
        <View className="flex self-start p-3 px-4 rounded-2xl bg-indigo-100 border border-indigo-200">
          <Text style={{ fontSize: hp(1.9) }}>{message?.text}</Text>
          <Text className="text-right mt-1 text-gray-500" style={{ fontSize: hp(1.4) }}>
            {formatTime(message.createdAt)}
          </Text>
        </View>
      </View>
    );
  }
}