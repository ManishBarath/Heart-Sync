import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { format, parseISO } from 'date-fns';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { ScrollView } from 'react-native'; 

const PRESET_COLORS = [
  '#EC4899', // Pink
  '#8B5CF6', // Violet
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#6B7280', // Gray
];

interface Event {
  id: string;
  title: string;
  date: { toDate: () => Date }; // Simplified from Firebase Timestamp
  isRecurring?: boolean;
  color : string
}

interface AddEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  modalType: 'event' | 'moment' | null;
  selectedDate: string; // YYYY-MM-DD format
  initialData?: Event | null;
}

export const AddEntryModal: React.FC<AddEntryModalProps> = ({
  visible,
  onClose,
  onSave,
  modalType,
  selectedDate,
  initialData,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  // --- CONSOLIDATED STATE ---
  // One set of state variables for all form fields.
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [date, setDate] = useState<DateData | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [color, setColor] = useState(PRESET_COLORS[0]); // <-- Add color state, default to first color

  // This useEffect now correctly manages our single source of truth state
  useEffect(() => {
    if (!visible) return; // Only run when modal becomes visible

    if (modalType === 'event' && initialData) {
      setTitle(initialData.title);
      setIsRecurring(!!initialData.isRecurring);
      setColor(initialData.color || PRESET_COLORS[0]); // Set color from data or default
      const eventDate = initialData.date.toDate();
      const dateString = format(eventDate, 'yyyy-MM-dd');
      setDate({
        dateString: dateString,
        day: eventDate.getDate(),
        month: eventDate.getMonth() + 1,
        year: eventDate.getFullYear(),
        timestamp: eventDate.getTime(),
      });
    } else {
      // --- ADD MODE or MOMENT MODE ---
      // Reset all fields to their default state
      setTitle('');
      setDescription('');
      setImageUri(null);
      setDate(null);
      setIsRecurring(false);
      setColor(PRESET_COLORS[0]); // Reset to default color

    }
  }, [visible, modalType, initialData]);

  const handleSavePress = async () => {
    setIsSaving(true);
    let dataToSave = {};

    if (modalType === 'event') {
      // Use the consolidated state variables
      if (!title ) {
        Alert.alert('Missing Info', 'Please provide a title and a date.');
        setIsSaving(false);
        return;
      }
      dataToSave = { title, date, isRecurring, color };
    } else if (modalType === 'moment') {
      // Use the consolidated state variables
      if (!title || !date) {
        Alert.alert('Missing Info', 'Please provide a title for your moment.');
        setIsSaving(false);
        return;
      }
      dataToSave = {
        title,
        description,
        imageUri,
        color
      };
    }

    try {
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      // Use the consolidated state setter
      setImageUri(result.assets[0].uri);
    }
  };

  // Dynamic modal title for better UX
  const modalTitle =
    modalType === 'event'
      ? initialData
        ? 'Edit Important Date'
        : 'Add Important Date'
      : `Add Moment for ${format(parseISO(selectedDate), 'MMMM do')}`;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View className="bg-white rounded-2xl p-6 w-11/12 max-h-[90%]">
          <TouchableOpacity onPress={onClose} className="absolute top-4 right-4 z-10">
            <Feather name="x" size={24} color="#9CA3AF" />
          </TouchableOpacity>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-2xl font-bold text-gray-800 mb-4">{modalTitle}</Text>

          {modalType === 'event' && (
              <>
                <TextInput
                  placeholder="Event Title (e.g., Our Anniversary)"
                  value={title}
                  onChangeText={setTitle}
                  className="bg-gray-100 p-3 rounded-lg mb-4"
                />
                
                <Text className="font-semibold text-gray-600 mb-2">Color Tag:</Text>
                <View className="flex-row justify-around mb-4">
                  {PRESET_COLORS.map(presetColor => (
                    <TouchableOpacity
                      key={presetColor}
                      onPress={() => setColor(presetColor)}
                      style={{
                        backgroundColor: presetColor,
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        borderWidth: 3,
                        borderColor: color === presetColor ? 'white' : presetColor,
                        elevation: color === presetColor ? 4 : 0,
                        shadowColor: '#000',
                        shadowOpacity: color === presetColor ? 0.3 : 0,
                        shadowRadius: 2,
                      }}
                    />
                  ))}
                </View>

                <Text className="font-semibold text-gray-600 mb-2">Select Date:</Text>
                <Calendar
                onDayPress={setDate}
                markedDates={date ? { [date.dateString]: { selected: true, selectedColor: '#EC4899' } } : {}}
                current={date?.dateString}
                key={date?.dateString} 
              />
              <View className="flex-row justify-between items-center mt-4 p-3 bg-gray-100 rounded-lg">
                <Text className="font-semibold text-gray-700">Repeat Annually</Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#FBCFE8" }}
                  thumbColor={isRecurring ? "#EC4899" : "#f4f3f4"}
                  onValueChange={setIsRecurring}
                  value={isRecurring}
                />
              </View>
              </>
            )}

          {modalType === 'moment' && (
            <>
              <TextInput
                placeholder="Moment Title"
                value={title} // Bind to consolidated state
                onChangeText={setTitle} // Bind to consolidated state
                className="bg-gray-100 p-3 rounded-lg mb-3"
              />
              <TextInput
                placeholder="Describe your moment..."
                value={description} // Bind to consolidated state
                onChangeText={setDescription} // Bind to consolidated state
                multiline
                className="bg-gray-100 p-3 rounded-lg h-24 mb-3"
                style={{ textAlignVertical: 'top' }}
              />
              <TouchableOpacity
                onPress={handlePickImage}
                className="flex-row items-center bg-gray-100 p-3 rounded-lg mb-3"
              >
                <Feather name="image" size={20} color="#6B7280" />
                <Text className="ml-3 text-gray-700">{imageUri ? 'Image Selected!' : 'Add a Photo'}</Text>
              </TouchableOpacity>
              {imageUri && (
                <Image source={{ uri: imageUri }} className="w-full h-32 rounded-lg mb-4" />
              )}
            </>
          )}

          <TouchableOpacity
            onPress={handleSavePress}
            disabled={isSaving}
              className="bg-pink-500 p-4 rounded-full mt-6" 
          >
            {isSaving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-center text-lg">
                {initialData ? 'Update' : 'Save'}
              </Text>
            )}
          </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};