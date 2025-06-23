import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { 
  addDoc,
  collection, 
  doc, 
  getDoc,
  getDocs, 
  limit, 
  onSnapshot, 
  orderBy, 
  query, 
  setDoc, 
  Timestamp, 
  updateDoc, 
  where
} from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { 
  ActivityIndicator,
  Alert,
  Keyboard,
  TextInput,
  TouchableOpacity,
  View,
  Text
} from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import CustomKeyboardView from '../../component/CustomKeyboardView';
import {  UserProfile } from '../../context/AuthContext';
import { db } from '../../firebaseConfig';
import { getRoomId } from '../../utils/common';
import ChatRoomheader from '@/component/ChatRoomHeader';
import MessageList from '@/component/MessageList';
import Loading from '@/component/Loading';
import { useAuth } from '../../context/AuthContext';

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
  const { user, setUser } = useAuth(); // logged in user
  const router = useRouter();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [partnerShortIdInput, setPartnerShortIdInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false); 
  const textRef = useRef<string>('');
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<any>(null);

  useEffect(() => {
    if (user?.userId) {
      checkUserConnection();
    }
  }, [user]);
  
  const checkUserConnection = async () => {
      setLoading(true);
      const userDocRef = doc(db, 'users', user!.userId);
      const userDocSnap = await getDoc(userDocRef);
  
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as UserProfile;
        if (userData.partnerId) {
          const partnerDocRef = doc(db, 'users', userData.partnerId);
          const partnerDocSnap = await getDoc(partnerDocRef);
          if (partnerDocSnap.exists()) {
            setPartner(partnerDocSnap.data() as UserProfile);
          }
        }
      }
      setLoading(false);
    };
    
  useEffect(() => {
      if (user?.userId && partner?.userId) {
        createRoomIfNotExists();
        const roomId = getRoomId(user.userId, partner.userId);
        const docRef = doc(db, 'rooms', roomId);
        const messagesRef = collection(docRef, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));
  
        const unsub = onSnapshot(q, (snapshot) => {
          const allMessages = snapshot.docs.map(
            (doc) => doc.data() as MessageType
          );
          setMessages([...allMessages]);
        });
  
        const keyboardDidShowListener = Keyboard.addListener(
          'keyboardDidShow',
          updateScrollView
        );
  
        return () => {
          unsub();
          keyboardDidShowListener.remove();
        };
      }
    }, [partner]); // This effect now depends on `partner`
  
    const createRoomIfNotExists = async () => {
      if (!user?.userId || !partner?.userId) return;
      const roomId = getRoomId(user.userId, partner.userId);
      await setDoc(doc(db, 'rooms', roomId), {
        roomId,
        createdAt: Timestamp.fromDate(new Date()),
      });
    };
  
    useEffect(() => {
      updateScrollView();
    }, [messages]);
  
    const updateScrollView = () => {
      setTimeout(() => {
        scrollViewRef?.current?.scrollToEnd({ animated: true });
      }, 100);
    };

    const handleConnect = async () => {
        if (!partnerShortIdInput.trim()) {
          Alert.alert('Error', 'Please enter your partner\'s ID.');
          return;
        }
        if (partnerShortIdInput.trim() === user?.shortId) {
          Alert.alert('Oops!', 'You cannot connect with yourself.');
          return;
        }
        console.log("Initializing the Partner")
        setIsConnecting(true);
        try {
          const usersRef = collection(db, 'users');
          const q = query(
            usersRef,
            where('shortId', '==', partnerShortIdInput.trim()),
            limit(1)
          );
          const querySnapshot = await getDocs(q);
    
          if (querySnapshot.empty) {
            Alert.alert('Not Found', 'No user found with that ID. Please check and try again.');
            setIsConnecting(false);
            return;
          }
    
          const partnerData = querySnapshot.docs[0].data() as UserProfile;
          const partnerId = querySnapshot.docs[0].id;
    
          // Two-way connection update
          const currentUserRef = doc(db, 'users', user!.userId);
          const partnerUserRef = doc(db, 'users', partnerId);
          // Check if the partner is already connected to someone
          if (partnerData.partnerId && partnerData.partnerId !== user!.userId) {
              Alert.alert('Unavailable', 'This user is already connected to someone else.');
              setIsConnecting(false);
              return;
          }
          await updateDoc(currentUserRef, { partnerId: partnerId });
          await updateDoc(partnerUserRef, { partnerId: user!.userId });
          await updateDoc(currentUserRef, { partnerName: partnerData.username || '' });
          await updateDoc(partnerUserRef, { partnerName: user!.username || '' });
          setUser((prevUser) => {
            if (!prevUser) return prevUser;
            return {
              ...prevUser,
              partnerId: partnerId,
              partnerName: partnerData.username || '',
              userId: prevUser.userId, 
              username: prevUser.username,
              gender: prevUser.gender,
              email: prevUser.email,
              uid: prevUser.uid,
              shortId: prevUser.shortId,
              profileImageURL: prevUser.profileImageURL,
              bio: prevUser.bio,
            };
          });
          console.log(partnerData)
          setPartner(partnerData);
        } catch (error: any) {
          Alert.alert('Connection Failed', error.message);
        } finally {
          setIsConnecting(false);
        }
      };

  const handleSendMessage = async () => {
  let message = textRef.current.trim();
  if (!message) return;
  try {
    let roomId = getRoomId(user?.userId, partner?.userId); // FIXED: use partner?.userId
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
    console.log('Messaage' , err.message);
  }

};
    useEffect(() => {
      if (user && user.partnerId === undefined) {
        setPartner(null);
        setMessages([]);
      } else if (user && partner && partner.partnerId !== user.userId) {
        setPartner(null);
        setMessages([]);
      }
    }, [user?.partnerId]);
  if (loading) {
    return (
      <Loading size={24} />
    );
  }

  if (!partner) {
      return (
        <View className="flex-1 justify-center items-center p-6 bg-rose-50">
          <Text style={{ fontSize: hp(3) }} className="font-bold text-gray-700 text-center">
            Connect with your Partner
          </Text>
          <Text style={{ fontSize: hp(2), marginTop: 10 }} className="text-gray-500 text-center">
            Enter your partner's unique ID below to start chatting.
          </Text>
          <TextInput
            value={partnerShortIdInput}
            onChangeText={setPartnerShortIdInput}
            placeholder="Partner's ID"
            placeholderTextColor="#F472B6"
            className="w-full bg-white rounded-full text-center mt-8"
            style={{
              fontSize: hp(2.2),
              padding: hp(2),
              borderWidth: 1,
              borderColor: '#F9A8D4',
            }}
          />
          <TouchableOpacity
            onPress={handleConnect}
            disabled={isConnecting}
            className="w-full rounded-full mt-4 p-4"
            style={{ backgroundColor: '#F472B6' }}
          >
            {isConnecting ? (
                    <Loading size={24} />
            ) : (
              <Text className="text-white text-center font-bold" style={{ fontSize: hp(2.2) }}>
                Connect
              </Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }

  return (
    
    <CustomKeyboardView inChat={true}>
      <View className="flex-1" style={{ backgroundColor: 'white' }}>
        {/* <StatusBar style="dark" /> */}
        <View className="h-3" style={{ borderBottomWidth: 1, borderBottomColor: '#F9A8D4' }} />
        <View className="flex-1 justify-between overflow-visible" style={{ backgroundColor: '#FDF2F8' }}>
          <View className="flex-1" style={{ backgroundColor: '#FFE5EC' }}>
            {user && (
              <MessageList scrollViewRef={scrollViewRef} messages={messages} currentUser={user} />
            )}
          </View>

          <View style={{ marginBottom: hp(1), paddingHorizontal: 10, paddingTop: 8 , backgroundColor : '#FFE5EC'}}>
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
                  placeholderTextColor="white"
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

