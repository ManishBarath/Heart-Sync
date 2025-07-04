import { MenuOption } from 'react-native-popup-menu';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Text, View } from 'react-native';
import React, { ReactNode } from 'react';

interface MenuItemsProps {
  text: string;
  action: (value: any) => void;
  value: any;
  icon?: ReactNode;
}

export const MenuItems = ({ text, action, value, icon }: MenuItemsProps) => {
  return (
    <MenuOption onSelect={() => action(value)}>
      <View className="px-4 py-1 flex-row justify-between items-center">
        <Text style={{ fontSize: hp(1.7) }} className="font-semibold text-neutral-600">
          {text}
        </Text>
        {icon}
      </View>
    </MenuOption>
  );
};