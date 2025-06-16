import { View, Text, Pressable, TouchableOpacity } from 'react-native'
import { useAuth } from '../../context/AuthContext'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

export default function Home() {
  const {logout , user} = useAuth();
  const handleSignOut = async () => {
    await logout();
  }
  // console.log('user :', user);
  return (
    <View classNmae="  flex-1 items-center justify-center" style ={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text >Home Screen</Text>
      <TouchableOpacity onPress={handleSignOut} className = "bg-red-500 rounded-xl items-center justify-center" style = {{height : hp(5)}}>
                        <Text style = {{fontSize: hp(2.5)}} className='text-white font-bold tracking-wide'>
                          SignOut
                        </Text>
      </TouchableOpacity>
     
    </View>
  )
}