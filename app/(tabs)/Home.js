import { View, Text, Pressable } from 'react-native'
import { useAuth } from '../../context/AuthContext'

export default function Home() {
  const {logout , user} = useAuth();
  const handleSignOut = async () => {
    await logout();
  }
  console.log('user :', user);
  return (

    <View >
      <Text>Home Screen</Text>
      <Pressable onPress={handleSignOut}>
        <Text>Sign Out</Text>
      </Pressable>
    </View>
  )
}