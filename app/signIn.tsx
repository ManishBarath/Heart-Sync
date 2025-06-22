import { View, Text, StatusBar, Image, TextInput, TouchableOpacity, Pressable, Alert } from 'react-native';
import React, { useRef, useState } from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import CustomKeyboardView from '../component/CustomKeyboardView';
import { useAuth } from '../context/AuthContext';
import Loading from '@/component/Loading';
import { Octicons } from '@expo/vector-icons';

export default function SignIn() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<string>("");
  const passwordRef = useRef<string>("");

  const handleLogin = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert('SignIn', "Please fill all fields");
      return;
    }
    setLoading(true);
    const response = await login(emailRef.current, passwordRef.current);
    setLoading(false);
    if (!response.success) {
      Alert.alert('SignIn', response.msg);
      return;
    }
    // Optionally navigate to home or another screen here
  };

  return (
    <CustomKeyboardView>
      <StatusBar backgroundColor="dark"  />
      <View style={{ paddingTop: hp(8), paddingHorizontal: wp(5) }} className='items-center'>
        <Image
          style={{
            height: hp('25'),
            resizeMode: 'contain',
          }}
          source={require('../assets/images/login.png')}
        />
      </View>
      <View className='gap-10 p-4'>
        <Text style={{ fontSize: hp(4) }} className='font-bold text-center tracking-wide text-neutral-800'>SignIn</Text>
        <View className='gap-4'>
          <View style={{ height: hp(7) }} className='bg-neutral-200 gap-4 px-4 flex-row items-center rounded-xl'>
            <Octicons name="mail" size={hp(2.7)} color="gray" />
            <TextInput
              style={{ fontSize: hp(2) }}
              onChangeText={e => emailRef.current = e}
              className='flex-1 font-semibold text-neutral-700'
              placeholder='Email'
              placeholderTextColor={'gray'}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          <View className='gap-3'>
            <View style={{ height: hp(7) }} className='bg-neutral-200 gap-4 px-4 flex-row items-center rounded-xl'>
              <Octicons name="lock" size={hp(2.7)} color="gray" />
              <TextInput
                style={{ fontSize: hp(2) }}
                onChangeText={e => passwordRef.current = e}
                secureTextEntry
                className='flex-1 font-semibold text-neutral-700'
                placeholder='Password'
                placeholderTextColor={'gray'}
                autoCapitalize="none"
              />
            </View>
            <Text style={{ fontSize: hp(1.8) }} className='font-semibold text-neutral-500 text-right'>Forgot Password?</Text>
          </View>
          {/*submit button*/}
          <View>
            {
              loading ? (
                <View className='flex-row justify-center'>
                  <Loading size={hp(6.5)} />
                </View>
              ) : (
                <TouchableOpacity onPress={handleLogin} className="bg-indigo-500 rounded-xl items-center justify-center" style={{ height: hp(6.5) }}>
                  <Text style={{ fontSize: hp(2.5) }} className='text-white font-bold tracking-wide'>
                    Sign In
                  </Text>
                </TouchableOpacity>
              )
            }
          </View>
          <View className='flex-row justify-center'>
            <Text style={{ fontSize: hp(1.8) }} className='font-semibold text-neutral-500'>Don't have an account? </Text>
            <Pressable onPress={() => { router.push('/signUp'); }}>
              <Text style={{ fontSize: hp(1.8) }} className='font-semibold text-indigo-500'>SignUp</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </CustomKeyboardView>
  );
}