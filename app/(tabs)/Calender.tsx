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
import { useCountdown } from '../hooks/useCountdown'; // Import the hook
import { useAuth ,UserProfile } from '@/context/AuthContext';
import { getRoomId } from '@/utils/common';
import { db } from '@/firebaseConfig';
import { AddEntryModal } from '@/component/AddEntryModel';
import { getNextEventDate } from '@/utils/Datehelpers'; // Import our new helper
import { Dimensions } from 'react-native';
import { CountdownItem } from '@/component/CountdownItem';
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

export default function CalendarScreen() {
  const { user , setUser } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [partnerShortIdInput, setPartnerShortIdInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'event' | 'moment' | null>(null);
  const [isFetchingEvents , setIsFetchingEvents] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null); // <-- Add this
  const loading = typeof user === 'undefined';
  const [isSelectionModeActive, setIsSelectionModeActive] = useState(false);
  const [rawEvents, setRawEvents] = useState<Event[]>([]); 

  
  useEffect(() => {
    if (!user?.userId || !user?.partnerId) return;
    setIsFetchingEvents(true);

    const roomId = getRoomId(user.userId, user.partnerId);

    const eventsRef = collection(db, 'rooms', roomId, 'events');
    const eventsQuery = query(eventsRef, orderBy('date', 'asc'));
    const unsubEvents = onSnapshot(eventsQuery, (snapshot) => {
      const fetchedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      setRawEvents(fetchedEvents); 
    });
    const momentsRef = collection(db, 'rooms', roomId, 'moments');
    const momentsQuery = query(momentsRef, orderBy('createdAt', 'desc'));
    const unsubMoments = onSnapshot(momentsQuery, (snapshot) => {
      const fetchedMoments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Moment));
      setMoments(fetchedMoments);
    setIsFetchingEvents(true);
    });

    return () => {
      unsubEvents();
      unsubMoments();
    };
  }, [user ]);

  const sortedEvents = useMemo(() => {
    const now = new Date();

    return [...rawEvents].sort((a, b) => {
      const nextDateA = getNextEventDate(a.date, !!a.isRecurring);
      const nextDateB = getNextEventDate(b.date, !!b.isRecurring);

      const aHasPassed = !a.isRecurring && nextDateA < now;
      const bHasPassed = !b.isRecurring && nextDateB < now;

      if (aHasPassed && !bHasPassed) return 1;
      if (!aHasPassed && bHasPassed) return -1;

      return nextDateA.getTime() - nextDateB.getTime();
    });
  }, [rawEvents]);

  const openModal = (type: 'event' | 'moment') => {
    setModalType(type);
    setIsModalVisible(true);
  };

  const startSelectionMode = () => {
    setIsSelectionModeActive(true);
  };

  const cancelSelectionMode = () => {
    setIsSelectionModeActive(false);
    setSelectedEventIds([]); // Clear selections
  };

  const handleToggleSelection = (eventId: string) => {
    setSelectedEventIds(prevSelected =>
      prevSelected.includes(eventId)
        ? prevSelected.filter(id => id !== eventId) // Deselect
        : [...prevSelected, eventId] // Select
    );
  };

  const handleDeleteSelected = () => {
    if (selectedEventIds.length === 0) return;
    if (!user?.userId || !user?.partnerId) return;

    Alert.alert(
      `Delete ${selectedEventIds.length} Date(s)`,
      'Are you sure you want to permanently delete the selected dates?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const roomId = getRoomId(user.userId!, user.partnerId!);
            // Create a batch of delete operations
            const deletePromises = selectedEventIds.map(id => {
              const eventRef = doc(db, 'rooms', roomId, 'events', id);
              return deleteDoc(eventRef);
            });

            try {
              await Promise.all(deletePromises);
              Alert.alert('Success', 'Selected dates have been deleted.');
              cancelSelectionMode(); // Exit selection mode after deletion
            } catch (error) {
              Alert.alert('Error', 'Failed to delete some or all dates.');
            }
          },
        },
      ]
    );
  };

  

  const handleEditPress = (event: Event) => {
    setEditingEvent(event);
    openModal('event');
  };

  const handleLongPressEvent = (event: Event) => {
    Alert.alert(
      'Edit Date',
      `Would you like to edit "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', onPress: () => handleEditPress(event) },
      ]
    );
  };

  const handleSaveEntry = async (data: any) => {
    if (!user?.userId || !user?.partnerId) return;
    const roomId = getRoomId(user.userId, user.partnerId);

    try {
      if (modalType === 'event') {
          const { title, date, isRecurring, color } = data;
          const eventDate = new Date(date.dateString + 'T00:00:00'); 
          if(editingEvent){
            const eventRef = doc(db, 'rooms', roomId, 'events', editingEvent.id);
          await updateDoc(eventRef, {
            title,
            date: Timestamp.fromDate(eventDate),
            isRecurring,
            color: color ?? "#A1A1AA"
          });
          Alert.alert('Success', 'Important date updated!');
        }else{
        try{const eventsRef = collection(db, 'rooms', roomId, 'events');
        await addDoc(eventsRef, {
          title,
          date: Timestamp.fromDate(eventDate),
          isRecurring,
          color: color ?? "#A1A1AA" 
        });
        Alert.alert('Success', 'Important date added!');
        } catch (e) {
          if (e instanceof Error) {
            console.log("error :", e.message);
          } else {
            console.log("error :", e);
          }
        }
      }
      } else if (modalType === 'moment') {
        let { title, description, imageUri } = data;
        let imageUrl = '';
        if (imageUri) {
          // Upload to Cloudinary
          imageUrl = await uploadImageToCloudinary(imageUri);
        }
        const momentsRef = collection(db, 'rooms', roomId, 'moments');
        await addDoc(momentsRef, {
          date: selectedDate, // The date selected on the calendar
          title,
          description,
          imageUrl,
          createdAt: Timestamp.now(),
        });
        Alert.alert('Success', 'Moment saved!');
      }
      setIsModalVisible(false);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to save. Please try again. ' + error.message);
    }
  };

  const handleConnect = async () => {
    if (!partnerShortIdInput.trim()) {
      Alert.alert('Error', "Please enter your partner's ID.");
      return;
    }
    if (partnerShortIdInput.trim() === user?.shortId) {
      Alert.alert('Oops!', 'You cannot connect with yourself.');
      return;
    }

    setIsConnecting(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('shortId', '==', partnerShortIdInput.trim()),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('Not Found', 'No user found with that ID. Please check and try again.');
        setIsConnecting(false);
        return;
      }

      const partnerId = querySnapshot.docs[0].id;

      // Two-way connection update
      const currentUserRef = doc(db, 'users', user!.userId);
      const partnerUserRef = doc(db, 'users', partnerId);

      await updateDoc(currentUserRef, { partnerId: partnerId });
      await updateDoc(partnerUserRef, { partnerId: user!.userId });

      // Update the user in AuthContext to trigger a re-render
      setUser((prevUser) => ({ ...prevUser!, partnerId: partnerId }));
      
    } catch (error: any) {
      Alert.alert('Connection Failed', error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};
    moments.forEach(moment => {
      marks[moment.date] = { marked: true, dotColor: '#EC4899' };
    });
    // Mark the selected day
    if (marks[selectedDate]) {
      marks[selectedDate].selected = true;
      marks[selectedDate].selectedColor = '#FBCFE8'; // A light pink
    } else {
      marks[selectedDate] = { selected: true, selectedColor: '#FBCFE8' };
    }
    return marks;
  }, [moments, selectedDate]);

  const selectedDayMoments = useMemo(() => {
    return moments.filter(moment => moment.date === selectedDate);
  }, [moments, selectedDate]);

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-rose-50">
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  if (!user?.partnerId) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-rose-50">
        <Feather name="calendar" size={hp(8)} color="#FBCFE8" />
        <Text style={{ fontSize: hp(3) }} className="font-bold text-gray-700 text-center mt-4">
          Share Your Calendar
        </Text>
        <Text style={{ fontSize: hp(2), marginTop: 10 }} className="text-gray-500 text-center">
          Connect with your partner to see shared events and create moments together.
        </Text>
        <TextInput
          value={partnerShortIdInput}
          onChangeText={setPartnerShortIdInput}
          placeholder="Enter Partner's ID"
          placeholderTextColor="#F472B6"
          className="w-full bg-white rounded-full text-center mt-8"
          style={{
            fontSize: hp(2.2),
            padding: hp(2),
            borderWidth: 1,
            borderColor: '#F9A8D4',
          }}
        />
        <TouchableOpacity
          onPress={handleConnect}
          disabled={isConnecting}
          className="w-full rounded-full mt-4 p-4"
          style={{ backgroundColor: '#F472B6' }}
        >
          {isConnecting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-bold" style={{ fontSize: hp(2.2) }}>
              Connect
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-rose-50">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="p-5 pt-14">
          <Text className="text-3xl font-bold text-gray-800">Our Calendar</Text>
          <Text className="text-md text-gray-500">Track your special dates and moments.</Text>
        </View>

        <View className="w-full px-5">
          <View className="flex-row justify-between items-center mb-3">
            {isSelectionModeActive ? (
              <>
                <TouchableOpacity onPress={cancelSelectionMode}>
                  <Text className="text-lg text-blue-500 font-semibold">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-700">
                  {selectedEventIds.length} Selected
                </Text>
                <TouchableOpacity
                  onPress={handleDeleteSelected}
                  disabled={selectedEventIds.length === 0}
                >
                  <Text className={`text-lg font-semibold ${selectedEventIds.length > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text className="text-xl font-bold text-gray-700">Important Dates</Text>
                <View className="flex-row items-center">
                  {events.length > 0 && ( 
                    <TouchableOpacity onPress={startSelectionMode} className="mr-4">
                      <Feather name="trash-2" size={26} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => openModal('event')}>
                    <Feather name="plus-circle" size={28} color="#EC4899" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
          {sortedEvents.length > 0 ? (
           <FlatList
              data={sortedEvents}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <CountdownItem
                  event={item}
                  onLongPress={handleLongPressEvent}
                  isSelectionModeActive={isSelectionModeActive}
                  isSelected={selectedEventIds.includes(item.id)}
                  onSelect={handleToggleSelection}
                />
              )}
              style={{ height: 250 }}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
              extraData={{ isSelectionModeActive, selectedEventIds }}
            />
          ) : (
            <Text className="text-center text-gray-500 w-full">Add your first important date!</Text>
          )}
        </View>

        {/* Calendar Section */}
        <View className="mt-6 mx-5 bg-white p-2 rounded-3xl shadow-md">
          <Calendar
            onDayPress={onDayPress}
            markedDates={markedDates}
            theme={{
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: '#EC4899',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#EC4899',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              arrowColor: '#EC4899',
              monthTextColor: '#1F2937',
              indicatorColor: 'blue',
              textDayFontFamily: 'monospace',
              textMonthFontFamily: 'monospace',
              textDayHeaderFontFamily: 'monospace',
              textDayFontWeight: '300',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '300',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>

        {/* Moments of the Day Section */}
        <View className="mt-8 px-5">
          <View className="flex-row justify-between items-center">
            <Text className="text-xl font-bold text-gray-700">
              Moments on {format(parseISO(selectedDate), 'MMMM do')}
            </Text>
            <TouchableOpacity onPress={() => openModal('moment')}>
              <Feather name="plus-circle" size={28} color="#EC4899" />
            </TouchableOpacity>
          </View>
          {selectedDayMoments.length > 0 ? (
            selectedDayMoments.map(moment => (
              <View key={moment.id} className="bg-white p-4 rounded-2xl mt-4 shadow-md">
                {moment.imageUrl && (
                  <Image source={{ uri: moment.imageUrl }} className="w-full h-40 rounded-lg mb-3" />
                )}
                <Text className="text-lg font-bold text-gray-800">{moment.title}</Text>
                <Text className="text-gray-600 mt-1">{moment.description}</Text>
              </View>
            ))
          ) : (
            <View className="items-center justify-center bg-white p-8 rounded-2xl mt-4">
              <Text className="text-gray-500">No moments saved for this day.</Text>
              <Text className="text-gray-400 text-sm">Tap the '+' to add one!</Text>
            </View>
          )}
        </View>
      </ScrollView>
       <AddEntryModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEntry}
        modalType={modalType}
        selectedDate={selectedDate}
        initialData={editingEvent}
      />
    </View>
  );
}