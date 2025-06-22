import { Image } from 'expo-image';
import { View, Text, TouchableOpacity } from 'react-native';
import { blurhash, formatDate, getRoomId } from '../utils/common';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import React, { useEffect, useState } from 'react';
import { collection, doc, DocumentData, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';


interface MessageType {
  userId: string;
  text: string;
  createdAt: { seconds: number };
  [key: string]: any;
}

interface ChatItemProps {
  item: DocumentData;
  router: any;
  noBorder: boolean;
  currentUser: DocumentData;
  index: number;
}

export default function ChatItem({ item, router, noBorder, currentUser }: ChatItemProps) {
  const openChatRoom = () => {
    router.push({ pathname: "/ChatRoom", params: item });
  };

  const [lastMessage, setLastMessage] = useState<MessageType | null | undefined>(undefined);

  useEffect(() => {
    let roomId = getRoomId(currentUser?.userId, item?.userId);
    const docRef = doc(db, 'rooms', roomId);
    const messagesRef = collection(docRef, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"));

    let unsub = onSnapshot(q, (snapshot) => {
      let allMessages = snapshot.docs.map(doc => doc.data() as MessageType);
      setLastMessage(allMessages[0] ? allMessages[0] : null);
    });
    return unsub;
  }, [currentUser?.userId, item?.userId]);

  const renderTime = () => {
    if (lastMessage) {
      let date = lastMessage?.createdAt;
      return formatDate(new Date(date?.seconds * 1000));
    }
  };
  const renderLastMessage = () => {
    if (typeof lastMessage === 'undefined') return 'loading';
    if (lastMessage) {
      if (currentUser?.userId === lastMessage?.userId) return "You: " + lastMessage.text;
      return lastMessage.text;
    } else {
      return 'Say Hi';
    }
  };

  return (
    <TouchableOpacity onPress={openChatRoom} className={`flex-row justify-between mx-4  items-cneter gap-3mb-4 pb-2 ${noBorder ? '' : 'border-b border-neutral-200'}`}>
      <Image
        source={require('../assets/images/icon.png')}
        style={{ height: hp(6), width: hp(6), borderRadius: 100 }}
        placeholder={blurhash}
        transition={1000}
      />
      <View className="flex-1 gap-1">
        <View className="flex-row justify-between ">
          <Text className="font-semibold text-neutral-800" style={{ fontSize: hp(1.8) }}>{item?.username}</Text>
          <Text className="font-medium text-neutral-500" style={{ fontSize: hp(1.6) }}>
            {renderTime()}
          </Text>
        </View>
        <Text style={{ fontSize: hp(1.6) }} className="font-medium text-neutral-500">
          {renderLastMessage()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}