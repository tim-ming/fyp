import { Stack } from 'expo-router';
import { Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ChevronLeft from "@/assets/icons/chevron-left.svg";

export default function GuidedJournalLayout() {
  const navigation = useNavigation();

  return (
    <Stack
      screenOptions={{
        headerTitle: '',
        headerBackTitleVisible: false, 
        headerTransparent: true, 
        headerShadowVisible: false, 
        headerLeft: () => (
          <Pressable onPress={() => navigation.goBack()} style={{ marginLeft: 16 }}>
            <ChevronLeft width={24} height={24} />
          </Pressable>
        ),
      }}
    >

    </Stack>
  );
}
