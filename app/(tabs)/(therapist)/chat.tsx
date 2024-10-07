import React, { useState, useEffect } from 'react';
import {
  FlatList,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '@/components/CustomText';
import TopNav from '@/components/TopNav';
import { useAuth } from '@/state/auth';
import { useHydratedEffect } from '@/hooks/hooks';
import { getPatients, getMessages } from '@/api/api';
import { UserWithoutSensitiveData } from '@/types/models';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';

interface PatientWithLastMessage extends UserWithoutSensitiveData {
  lastMessage?: {
    content: string;
    timestamp: string;
  };
}

const PatientListScreen = () => {
  const [patients, setPatients] = useState<PatientWithLastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();
  const router = useRouter();

  useHydratedEffect(async () => {
    const token = auth.token?.access_token;
    try {
      const fetchedPatients = await getPatients();
      const patientsWithMessages = await Promise.all(
        fetchedPatients.map(async (patient) => {
          const messages = await getMessages(patient.id);
          const lastMessage = messages[0];
          return {
            ...patient,
            lastMessage: lastMessage
              ? {
                  content: lastMessage.content,
                  timestamp: lastMessage.timestamp,
                }
              : undefined,
          };
        })
      );
      setPatients(patientsWithMessages);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const renderPatientItem = ({ item }: { item: PatientWithLastMessage }) => (
    <TouchableOpacity
      style={styles.patientItem}
      onPress={() => router.push(`/therapist/chat/${item.id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.avatar} />
      <View style={styles.patientInfo}>
        <CustomText style={styles.patientName}>
          {item.sex?.toLowerCase() === 'm' ? 'Mr. ' : 'Ms. '}
          {item.name}
        </CustomText>
        {item.lastMessage ? (
          <>
            <CustomText style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage.content}
            </CustomText>
            <CustomText style={styles.timestamp}>
              {format(new Date(item.lastMessage.timestamp), 'MMM d, h:mm a')}
            </CustomText>
          </>
        ) : (
          <CustomText style={styles.noMessage}>No messages yet</CustomText>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <CustomText style={styles.loadingText}>Loading patients...</CustomText>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomText style={styles.title}>Patients</CustomText>
      <FlatList
        data={patients}
        renderItem={renderPatientItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF', // Light blue background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#333',
  },
  listContent: {
    padding: 16,
  },
  patientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  noMessage: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default PatientListScreen;