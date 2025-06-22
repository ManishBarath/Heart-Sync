import React, { ReactNode } from 'react';
import { Platform, KeyboardAvoidingView, ScrollView, KeyboardAvoidingViewProps, ScrollViewProps } from 'react-native';

const ios = Platform.OS === 'ios';

interface CustomKeyboardViewProps {
  children: ReactNode;
  inChat?: boolean;
}

export default function CustomKeyboardView({ children, inChat }: CustomKeyboardViewProps) {
  let kavConfig: Partial<KeyboardAvoidingViewProps> = {};
  let scrollViewConfig: Partial<ScrollViewProps> = {};

  if (inChat) {
    kavConfig = { keyboardVerticalOffset: 80 };
    scrollViewConfig = {
      contentContainerStyle: { flex: 1 },
      keyboardShouldPersistTaps: 'handled',
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