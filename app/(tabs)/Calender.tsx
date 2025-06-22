import React, { useState, useMemo, JSX } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Calendar, DateData,  CalendarProps } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { themeColors } from '@/utils/theme';


interface Memory  {
  text: string;
  marked: true;
  dotColor: string;

}

type Memories = Record<string, Memory>;

const memories: Memories = {
  '2025-06-08': { text: 'The day we met! ❤️', marked: true, dotColor: themeColors.heart },
  '2025-06-28': { text: 'Our first picnic at the park! 🥪', marked: true, dotColor: themeColors.heart },
  '2025-06-15': { text: 'Movie night marathon 🍿', marked: true, dotColor: themeColors.heart },
};

const Calender: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const markedDates: CalendarProps['markedDates'] = useMemo(() => {
    const marked: CalendarProps['markedDates'] = { ...memories };

    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: themeColors.primary,
        selectedTextColor: 'white',
      };
    }
    return marked;
  }, [selectedDate]);

  // CHANGED: The 'day' parameter is now correctly typed with `DateData`.
  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const renderMemory = (): JSX.Element => {
    if (selectedDate && memories[selectedDate]) {
      return (
        <View style={styles.memoryContainer}>
          <Text style={styles.memoryDate}>Memory for {selectedDate}</Text>
          <Text style={styles.memoryText}>"{memories[selectedDate].text}"</Text>
        </View>
      );
    }
    return (
      <View style={styles.memoryContainer}>
        <Text style={styles.memoryDate}>Select a day with a ♥ to see a memory!</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Moments</Text>
        <Text style={styles.headerSubtitle}>Next Anniversary in 125 days</Text>
      </View>

      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        theme={{
          backgroundColor: themeColors.background,
          calendarBackground: themeColors.background,
          textSectionTitleColor: themeColors.primary,
          selectedDayBackgroundColor: themeColors.primary,
          selectedDayTextColor: '#ffffff',
          todayTextColor: themeColors.accent,
          dayTextColor: themeColors.text,
          textDisabledColor: '#d9e1e8',
          dotColor: themeColors.heart,
          selectedDotColor: '#ffffff',
          arrowColor: themeColors.primary,
          monthTextColor: themeColors.text,
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 20,
          textDayHeaderFontSize: 14,
        }}
      />

      {renderMemory()}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => alert('Open modal to add a new memory!')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: themeColors.background,
    marginBottom : 150
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: themeColors.text,
  },
  headerSubtitle: {
    fontSize: 16,
    color: themeColors.textLight,
    marginTop: 4,
  },
  memoryContainer: {
    flex: 1,
    marginTop: 20,
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  memoryDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeColors.textLight,
    marginBottom: 10,
  },
  memoryText: {
    fontSize: 20,
    fontStyle: 'italic',
    color: themeColors.text,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    backgroundColor: themeColors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowRadius: 5,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
  },
});


export default Calender;