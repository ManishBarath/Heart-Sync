import { View, FlatList } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import ChatItem from './Chatitem';
// import { UserType } from '@/types/types';
import { DocumentData } from 'firebase/firestore';

interface ChatListProps {
  users: DocumentData[];
  currentUser: DocumentData;
}

export default function ChatList({ users, currentUser }: ChatListProps) {
  const router = useRouter();
  return (
    <View className="flex-1">
      <FlatList
        data={users}
        contentContainerStyle={{ flex: 1, paddingVertical: 25 }}
        keyExtractor={(_, idx) => idx.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <ChatItem
            router={router}
            noBorder={index + 1 === users.length}
            currentUser={{ ...currentUser, userId: currentUser.userId ?? '' }}
            index={index}
            item={item}
          />
        )}
      />
    </View>
  );
}