import React from 'react'
import { Stack } from 'expo-router'
import HomeHeader from '../../component/HomeHeader'
export default function _layout() {
  return (
    <Stack >
      <Stack.Screen name="Home" 
      options={{
        header : () => <HomeHeader />
      }}
      />
      
    </Stack>
  )
}