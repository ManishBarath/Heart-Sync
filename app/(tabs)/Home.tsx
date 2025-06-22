import { View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import ChatList from '../../component/ChatList';
import Loading from '../../component/Loading';
import { getDocs, query, where, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { usersRef } from '../../firebaseConfig';

export default function Home() {
  const { logout, user } = useAuth();
  const [users, setUsers] = useState<DocumentData[]>([]);

  useEffect(() => {
    if (user?.uid) fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUsers = async () => {
    try {
      const q = query(usersRef, where('userId', '!=', user?.uid));
      const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);
      let data: DocumentData[] = [];
      snapshot.forEach(doc => {
        data.push({
          ...doc.data()
        });
      });
      setUsers(data);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />
      {users.length > 0 && user ? (
        <ChatList users={users} currentUser={user} />
      ) : (
        <View className="flex items-center" style={{ top: hp(30) }}>
          <Loading size={hp(10)} />
        </View>
      )}
    </View>
  );
}