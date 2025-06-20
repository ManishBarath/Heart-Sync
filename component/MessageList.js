import { ScrollView } from 'react-native'
import MessageItem from './MessageItem'

export default function MessageList({messages ,scrollViewRef, currentUser}) {
  return (
    <ScrollView  keyboardShouldPersistTaps="handled" ref = {scrollViewRef} showsVerticalScrollIndicator ={false} contentContainerStyle ={{paddingTop: 10}} >
      {
        messages.map((message , index ) => {
          return (
            <MessageItem message = {message} key={index} currentUser = {currentUser}/>
          )
        })
      }
    </ScrollView>
  )
}