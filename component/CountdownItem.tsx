import { Feather } from '@expo/vector-icons';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  doc,
  getDocs,
  deleteDoc,
  limit,
  updateDoc,
  where,
} from 'firebase/firestore';
import { format, parseISO } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useAuth ,UserProfile } from '@/context/AuthContext';
import { getRoomId } from '@/utils/common';
import { db } from '@/firebaseConfig';
import { AddEntryModal } from '@/component/AddEntryModel';
import { getNextEventDate } from '@/utils/Datehelpers'; // Import our new helper
import { Dimensions } from 'react-native';
import { useCountdown } from '@/app/hooks/useCountdown';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Event {
  id: string;
  title: string;
  date: Timestamp;
  isRecurring?: boolean
  color : string
}

interface Moment {
  id: string;
  date: string; 
  title: string;
  description: string;
  imageUrl?: string;
}

interface CountdownItemProps {
  event: Event;
  onLongPress: (event: Event) => void;
  isSelectionModeActive: boolean;
  isSelected: boolean;
  onSelect: (eventId: string) => void; 
}


export const CountdownItem = ({
  event,
  onLongPress,
  isSelectionModeActive,
  isSelected,
  onSelect,
}: CountdownItemProps) => {
  const targetDate = getNextEventDate(event.date, !!event.isRecurring);
  const timeLeft = useCountdown(targetDate);
  const hasPassed = !event.isRecurring && targetDate < new Date();

  const handlePress = () => {
    if (isSelectionModeActive) {
      onSelect(event.id);
    }
  };

  const accentColor = event.color || '#A1A1AA';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      onLongPress={() => !isSelectionModeActive && onLongPress(event)}
      className="mb-3 " 
    >
      <View
        style={{
          borderWidth: 2,
          borderColor: isSelected ? accentColor : '#E5E7EB', 
        }}
        className="bg-white rounded-xl flex-row items-center overflow-hidden shadow-md" >
        <View style={{ width: 6, height: '40%', backgroundColor: accentColor , borderRadius : 5}} className='ml-3'/>

        {isSelectionModeActive && (
          <View className="pl-3">
            <Feather
              name={isSelected ? "check-square" : "square"}
              size={24}
              color={isSelected ? accentColor : "#9CA3AF"}
            />
        </View>
        )}

        <View className="flex-1 flex-row justify-between items-center p-4">
          <Text className="text-base font-semibold capitalize text-gray-800" numberOfLines={2}>
            {event.title}
          </Text>

          {hasPassed ? (
            <View className="items-end ml-2">
              <Text className="text-gray-500 font-semibold">Passed</Text>
            </View>
          ) : (
            <View className="flex-row items-baseline ml-2">
              <Text className="text-2xl font-bold text-gray-800">{timeLeft.days}</Text>
              <Text className="text-sm text-gray-500 ml-1.5">days left</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
