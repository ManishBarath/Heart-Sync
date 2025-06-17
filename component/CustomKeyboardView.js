import { Platform } from 'react-native';
import { KeyboardAvoidingView, ScrollView } from 'react-native';

const ios = Platform.OS === 'ios';

export default function CustomKeyboardView({ children, inChat }) {
  let kavConfig = {};
  let scrollViewConfig = {};

  if (inChat) {
    kavConfig = { keyboardVerticalOffset: 80 };
    scrollViewConfig = {
      contentContainerStyle: { flex: 1 },
      // <— allow taps on children (e.g. your Send button) to go through
      keyboardShouldPersistTaps: 'handled',
      // optional: let drag dismiss the keyboard
      keyboardDismissMode: 'on-drag',
    };
  }

  return (
    <KeyboardAvoidingView
      behavior={ios ? 'padding' : 'height'}
      style={{ flex: 1 }}
      {...kavConfig}
    >
      <ScrollView
        style={{ flex: 1 }}
        bounces={false}
        showsVerticalScrollIndicator={false}
        {...scrollViewConfig}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
