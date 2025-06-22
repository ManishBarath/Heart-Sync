import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { addDoc, collection, doc, onSnapshot, orderBy, query, setDoc, Timestamp } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, TextInput, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import CustomKeyboardView from '../../component/CustomKeyboardView';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebaseConfig';
import { getRoomId } from '../../utils/common';
import ChatRoomheader from '@/component/ChatRoomHeader';
import MessageList from '@/component/MessageList';

interface UserType {
  userId: string;
  username?: string;
  [key: string]: any;
}

interface MessageType {
  userId: string;
  text: string;
  senderName?: string;
  createdAt: { seconds: number };
  [key: string]: any;
}

export default function ChatRoom() {
  const item = useLocalSearchParams() as UserType; // second user
  const { user } = useAuth(); // logged in user
  const router = useRouter();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const textRef = useRef<string>('');
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<any>(null);

  useEffect(() => {
    createRoomifNotExists();
    let roomId = getRoomId(user?.userId, item?.userId);
    const docRef = doc(db, 'rooms', roomId);
    const messagesRef = collection(docRef, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    let unsub = onSnapshot(q, (snapshot) => {
      let allMessages = snapshot.docs.map(doc => doc.data() as MessageType);
      setMessages([...allMessages]);
    });

    const KeyboardDidShowListender = Keyboard.addListener(
      'keyboardDidShow', updateScrollView
    );
    return () => {
      unsub();
      KeyboardDidShowListender.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.userId, user?.userId]);

  const createRoomifNotExists = async () => {
    let roomId = getRoomId(user?.userId, item?.userId);
    await setDoc(doc(db, "rooms", roomId), {
      roomId,
      created: Timestamp.fromDate(new Date())
    });
  };

  useEffect(() => {
    updateScrollView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const updateScrollView = () => {
    setTimeout(() => {
      scrollViewRef?.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = async () => {
    let message = textRef.current.trim();
    if (!message) return;
    try {
      let roomId = getRoomId(user?.userId, item?.userId);
      const docRef = doc(db, 'rooms', roomId);
      const messagesRef = collection(docRef, "messages");
      textRef.current = "";
      if (inputRef) inputRef?.current?.clear();
      await addDoc(messagesRef, {
        userId: user?.userId,
        text: message,
        senderName: user?.username,
        createdAt: Timestamp.fromDate(new Date())
      });
      textRef.current = '';
    } catch (err: any) {
      Alert.alert('Message', err.message);
    }
  };

  return (
    <CustomKeyboardView inChat={true}>
      <View className="flex-1" style={{ backgroundColor: 'white' }}>
        {/* <StatusBar style="dark" /> */}
        <ChatRoomheader user={item} router={router} />
        <View className="h-3" style={{ borderBottomWidth: 1, borderBottomColor: '#F9A8D4' }} />
        <View className="flex-1 justify-between overflow-visible" style={{ backgroundColor: '#FDF2F8' }}>
          <View className="flex-1" style={{ backgroundColor: '#FFE5EC' }}>
            {user && (
              <MessageList scrollViewRef={scrollViewRef} messages={messages} currentUser={user} />
            )}
          </View>

          <View style={{ marginBottom: hp(7), paddingHorizontal: 10, paddingTop: 8 }}>
            <View className="flex-row items-center justify-between bg-white rounded-full px-4 py-3" style={{ borderWidth: 1, borderColor: '#F9A8D4' }}>
              {/* Left side icons */}
              <View className="flex-row items-center space-x-3">
                <TouchableOpacity className="p-2">
                  <Feather name="camera" size={hp(2.5)} color="#F472B6" />
                </TouchableOpacity>
                <TouchableOpacity className="p-2">
                  <Feather name="image" size={hp(2.5)} color="#F472B6" />
                </TouchableOpacity>
                <TouchableOpacity className="p-2">
                  <Feather name="mic" size={hp(2.5)} color="#F472B6" />
                </TouchableOpacity>
              </View>

              {/* Text input */}
              <View className="flex-1 mx-3">
                <TextInput
                  ref={inputRef}
                  onChangeText={value => textRef.current = value}
                  placeholder='Message'
                  placeholderTextColor="#F472B6"
                  style={{
                    fontSize: hp(2),
                    color: '#374151',
                    backgroundColor: '#F9A8D4',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 25,
                    textAlign: 'center'
                  }}
                  blurOnSubmit={false}
                  onSubmitEditing={handleSendMessage}
                />
              </View>

              {/* Send button */}
              <TouchableOpacity
                onPress={handleSendMessage}
                className="p-3 rounded-full"
                style={{ backgroundColor: '#F472B6' }}
              >
                <Feather name="send" size={hp(2.5)} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </CustomKeyboardView>
  );
}