import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
// Request permissions
export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('Notification permissions not granted!');
  }
  return status === 'granted';
};

// Show notification with vibration and sound
export const showNotification = async (title: string, body: string) => {
  // Vibrate
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

  // Show notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
    },
    trigger: null, // Immediate
  });
};

// Schedule a notification (for reminders, etc.)
export const scheduleNotification = async (title: string, body: string, seconds: number) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds },
  });
};