import { ActivityIndicator, Text, View } from "react-native";
import "./global.css"

export default function StartPage() {
  return (
    <View
      className="flex-1 items-center justify-center"
    >
      <ActivityIndicator size={"large"} color="red" />
    </View>
  );
}
  
