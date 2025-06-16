import {  useEffect } from "react";
import "./global.css"
import { AuthProvider, useAuth } from "../context/AuthContext";
import { Stack, useRouter, useSegments } from "expo-router";
import { MenuProvider } from 'react-native-popup-menu';

const MainLayout = () => {
  const {isAuthenticated} = useAuth();
  const segments = useSegments();
  const router =useRouter();
  useEffect(() => {
    if(typeof isAuthenticated == 'undefined') {
      return;
    } 
    const inApp = segments[0] == '(tabs)';

    if(isAuthenticated && !inApp) {
      // Redirect to login if not authenticated and trying to access a protected route
      router.replace('Home');
    } else if(isAuthenticated == false) {
      // Redirect to home if authenticated and trying to access login
      router.replace('signIn');
    }
  }, [isAuthenticated]); 
  return <Stack screenOptions={{headerShown : false}}/>
}
export default function RootLayout() {
  return (
    <MenuProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider> 
    </MenuProvider>
  )
}
