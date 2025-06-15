import { View, Text, StatusBar , Image, TextInput, TouchableOpacity, TextBase, Pressable, Alert} from 'react-native'
import React, { useRef, useState } from 'react'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Octicons from 'react-native-vector-icons/Octicons';
import { useRouter } from 'expo-router';
import Loading from '../component/Loading';
import { Feather } from '@expo/vector-icons';
import CustomKeyboardView from '../component/CustomKeyboardView';
import { useAuth } from '../context/AuthContext';

export default function SignUp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {register} = useAuth();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const usernameRef = useRef("");
  const genderRef = useRef("");

  const handleRegister = async () => {
    if(!emailRef.current || !passwordRef.current  || !usernameRef.current || !genderRef.current ) {
      Alert.alert('Sign Up' , "Please fill all fields");
      return;
    }
    setLoading(true);
    let response = await register(emailRef.current, passwordRef.current, usernameRef.current, genderRef.current);
    setLoading(false);
    console.log('got results :' ,response);
    if(!response.success) {
      Alert.alert('Sign Up' , response.msg);
      return;
    }
  }
  return (
    <CustomKeyboardView>

      <StatusBar style = "dark" />
      <View style = {{paddingTop: hp(8) , paddingHorizontal : wp(5)}} className='items-center'>
        <Image style ={{
          height: hp('15'),
          resizeMode: 'contain',
        }}
        source={require('../assets/images/login.png')}
        />
      </View>
      <View className='gap-10'>
        <Text style = {{fontSize: hp(4 )}} className='font-bold text-center tracking-wide text-neutral-800'> SignUp </Text> 
        <View className='gap-4'>
            <View style = {{height : hp(7)}} className='bg-neutral-200 gap-4 px-4 flex-row items-center rounded-xl'>
              <Octicons name="mail" size={hp(2.7)} color="gray" />
              <TextInput style = {{fontSize: hp(2)}}
                onChangeText={e => emailRef.current = e}
                className='flex-1 font-semibold text-neutral-700'
                placeholder='Email' placeholderTextColor={'gray'} />
              </View>
            <View style = {{height : hp(7)}} className='bg-neutral-200 gap-4 px-4 flex-row items-center rounded-xl'>
              <Octicons name="lock" size={hp(2.7)} color="gray" />
              <TextInput style = {{fontSize: hp(2)}}
                onChangeText={e => passwordRef.current = e}
                secureTextEntry
                className='flex-1 font-semibold text-neutral-700'
                placeholder='Password' placeholderTextColor={'gray'} />
            </View>
            <View style = {{height : hp(7)}} className='bg-neutral-200 gap-4 px-4 flex-row items-center rounded-xl'>
              <Feather name="user" size={hp(2.7)} color="gray" />
              <TextInput style = {{fontSize: hp(2)}}
                onChangeText={e => usernameRef.current = e}
                className='flex-1 font-semibold text-neutral-700'
                placeholder='Username' placeholderTextColor={'gray'} />
              </View>  
            <View style = {{height : hp(7)}} className='bg-neutral-200 gap-4 px-4 flex-row items-center rounded-xl'>
              <Octicons name="lock" size={hp(2.7)} color="gray" />
              <TextInput style = {{fontSize: hp(2)}}
                onChangeText={e => genderRef.current = e}
                className='flex-1 font-semibold text-neutral-700'
                placeholder='Gender' placeholderTextColor={'gray'} />
            </View>

        {/*submit button*/}

        <View > 
          {
            loading ?(
              <View className='flex-row justify-center'>
                  <Loading size = {hp(6.5)} />
              </View>
            ):(
                <TouchableOpacity onPress={handleRegister} className = "bg-indigo-500 rounded-xl items-center justify-center" style = {{height : hp(6.5)}}>
                  <Text style = {{fontSize: hp(2.5)}} className='text-white font-bold tracking-wide'>
                    SignUp
                  </Text>
                </TouchableOpacity>
            )
          }
        </View>
       
        <View className='flex-row justify-center'>
          <Text style = {{fontSize :hp(1.8 )}}  className='font-semibold text-neutral-500 '> 
            Already have an account? </Text>
          <Pressable onPress={ () =>{
            router.push('signIn');
          }} >
              <Text style = {{fontSize :hp(1.8 )}} className='font-semibold text-indigo-500  '>SignIn</Text>
          </Pressable>
        </View>
        </View>
        
      </View>
    </CustomKeyboardView>
  ) 
}