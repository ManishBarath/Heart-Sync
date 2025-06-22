import { ScrollView } from 'react-native';
import MessageItem from './MessageItem';
import React, { RefObject } from 'react';
import { DocumentData } from 'firebase/firestore';

interface MessageType {
  userId: string;
  text: string;
  createdAt: any;
  [key: string]: any;
}

interface MessageListProps {
  messages: MessageType[];
  scrollViewRef: RefObject<ScrollView>;
  currentUser: DocumentData;
}

export default function MessageList({ messages, scrollViewRef, currentUser }: MessageListProps) {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      ref={scrollViewRef}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: 10 }}
    >
      {messages.map((message, index) => (
        <MessageItem message={message} key={index} currentUser={currentUser} />
      ))}
    </ScrollView>
  );
}