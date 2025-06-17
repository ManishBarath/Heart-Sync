import { View } from 'react-native'
import { useAuth } from '../../context/AuthContext'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import ChatList from '../../component/ChatList';
import Loading from '../../component/Loading';
import { getDocs, query, where } from 'firebase/firestore';
import { usersRef } from '../../firebaseConfig';


export default function Home() {
    const {logout , user} = useAuth();
    const [users , setUsers] = useState ([]);

    useEffect(() => { 
      if(user?.uid)
        fetchUsers();
    }, []);
    const  fetchUsers = async () => {
      // console.log('fetching users');
      const q = query(usersRef, where('userId', '!=', user?.uid));
      const snapshot = await getDocs(q);
      // console.log('users snapshot :', snapshot);
      let data = [];
      snapshot.forEach(doc => {
        data.push({
          ...doc.data()
        });
      });
      setUsers(data);
    }

    return (
      <View className="flex-1  bg-white " >
        <StatusBar style="light" />      
        { 
          users.length > 0 ? (
              <ChatList  users = {users} currenUser = {user} />
          ):(
            <View className="flex items-center" style = {{top : hp(30) }}>
              <Loading size = {hp(10)}  />
            </View>
          )
        }
      </View>
    )
}