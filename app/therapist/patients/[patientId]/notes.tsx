import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import CustomText from "@/components/CustomText";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPatientData } from "@/api/api";
import { UserWithPatientData } from "@/types/models";
import { shadows } from "@/constants/styles";

const PatientDetails = () => {
  const { patientId } = useLocalSearchParams();
  const [patient, setPatient] = useState<UserWithPatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const notesRef = useRef<TextInput>(null);
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPatient = async (patientId: number) => {
      try {
        const patients = await getAssignedPatients();
        const patient = await getPatientData(patientId);
        if (patient && patients.find((p) => p.id === patient.id)) {
          setPatient(data);
          setNotes(data.notes);
        } else {
          throw new Error("Patient is not assigned to you");
        }
        console.log(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient(Number(patientId));
  }, [patientId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#256CD0" />
      </View>
    );
  }

  async function save() {
    if (!patient) {
      return;
    }
    setSaving(true);
    await updatePatientData(patientId, { notes, ...patient });
    setSaving(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-blue100">
      <ScrollView className="flex-1 p-4">
        <View className="pt-20">
          <CustomText className="text-2xl font-semibold mb-4">Notes</CustomText>
          <TextInput
            style={shadows.card}
            ref={notesRef}
            multiline={true}
            numberOfLines={16}
            className="bg-white text-base rounded-2xl p-4 shadow-[0px_4px_20px_0px_rgba(0,_0,_0,_0.1)] font-[PlusJakartaSans] placeholder:text-gray100"
            placeholder="Enter notes about patient..."
            value={notes}
            onChangeText={setNotes}
            secureTextEntry
          />
        </View>
        <Pressable
          disabled={saving}
          onPress={save}
          className={`h-14 mt-2 ${
            saving ? "bg-gray50" : "bg-blue200"
          } items-center justify-center rounded-full`}
        >
          <CustomText className="text-white text-base font-medium">
            Save
          </CustomText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PatientDetails;
