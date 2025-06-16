import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { addDoc, collection, doc, onSnapshot, orderBy, query, setDoc, Timestamp } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, TextInput, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import ChatRoomheader from '../../component/ChatRoomheader';
import CustomKeyboardView from '../../component/CustomKeyboardView';
import MessageList from '../../component/MessageList';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebaseConfig';
import { getRoomId } from '../../utils/common';

export default function ChatRoom() {
    const item = useLocalSearchParams(); //second user
    const {user} = useAuth(); //logged in user
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const textRef = useRef('');
    const inputRef = useRef(null);
    const scrollViewRef = useRef(null);

    useEffect(() => {
        createRoomifNotExists();
        let roomId = getRoomId(user?.userId, item?.userId);
        // console.log(roomId)
        const docRef = doc(db , 'rooms' , roomId);
        const messagesRef = collection(docRef , "messages");
        const q = query(messagesRef, orderBy("createdAt" , "asc"));
         
        let unsub = onSnapshot(q , (snapshot) =>{
            let allMesssages = snapshot.docs.map(doc => {
                return doc.data();
            });
            setMessages([...allMesssages])
        });

        const KeyboardDidShowListender = Keyboard.addListener(
            'keyboardDidShow' , updateScrollView
        )
        return () => {
            unsub();
            KeyboardDidShowListender.remove();
        }
    }
    , []);
    const createRoomifNotExists = async () => {
        let roomId = getRoomId(user?.userId, item?.userId);
        await setDoc(doc(db , "rooms" , roomId) ,{
            roomId, 
            created : Timestamp.fromDate(new Date())
        });
    }
    useEffect( () => {
        updateScrollView();
    },[messages])
    const updateScrollView = () => {
        setTimeout( () => {
            scrollViewRef?.current?.scrollToEnd({animeted : true})
        }, 100)
    }
    const handleSendMessage = async () => {
        let message = textRef.current.trim();
        if(!message) return;
        try{
            let roomId = getRoomId(user?.userId , item?.userId);
            const docRef = doc(db , 'rooms' , roomId);
            const messagesRef = collection(docRef , "messages");
            textRef.current = "";
            if(inputRef) inputRef?.current?.clear();  
            const newDoc = await addDoc(messagesRef, {
                userId: user?.userId,
                text: message,
                senderName: user?.username,
                createdAt: Timestamp.fromDate(new Date())
            });
            textRef.current = '';
            // console.log(newDoc.id);
        }catch(err){
            Alert.alert('Message' , err.message);
        }color
    }
  return ( 
    <CustomKeyboardView inChat = {true}>
        <View className="flex-1  bg-white "> 
            <StatusBar style="dark" />
            <ChatRoomheader user = {item} router = {router} />
            <View className = "h-3 border-b border-neutral-300"/>
            <View className = "flex-1 justify-between bg-neutral-100 overflow-visible">
                <View className = "flex-1">
                    <MessageList scrollViewRef = {scrollViewRef} messages = {messages} currentUser={user} />
                </View>
                <View  style={{marginBottom :hp(2.7)}} className = "pt-2">
                    <View className = "mx-3 flex-row bg-white border justify-between  p-2 border-neutral-300 rounded-full pl-5"> 
                        <TextInput 
                            ref = {inputRef}
                            onChangeText={ value => textRef.current = value} 
                            placeholder='Type a message...'
                            style = {{fontSize: hp(2), color: '#737373'}}
                            className ="flex-1 mr-2 "
                        />
                        <TouchableOpacity onPress={handleSendMessage} className = "bg-neutral-200 p-2 mr-[1px] rounded-full">
                            <Feather name="send" size={hp(2.7)} color="#737373" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    </CustomKeyboardView>
    
  )
}