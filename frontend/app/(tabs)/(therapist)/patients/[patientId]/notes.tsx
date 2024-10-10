import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams, router } from "expo-router";
import CustomText from "@/components/CustomText";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPatientData, getPatients, updatePatientData } from "@/api/api";
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
        const patients = await getPatients();
        console.log(patients);
        console.log(typeof patientId, patientId);
        if (!patients.find((p) => p.id === patientId)) {
          throw new Error("Patient is not found");
        }
        const data = await getPatientData(patientId);
        if (data) {
          setPatient(data);
          setNotes(data.patient_data!.therapist_note || "");
        } else {
          throw new Error("Patient is not found");
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
      <View className="flex-1 justify-center items-center bg-blue100">
        <ActivityIndicator size="large" color="#256CD0" />
      </View>
    );
  }

  async function save() {
    if (!patient) {
      return;
    }
    setSaving(true);
    await updatePatientData({ user_id: patient.id, therapist_note: notes });
    setSaving(false);
    router.back();
  }

  return (
    <SafeAreaView className="flex-1 bg-blue100">
      <ScrollView className="flex-1 p-4">
        <View className="pt-12">
          <CustomText className="text-2xl font-semibold mb-4">Notes</CustomText>
          <TextInput
            style={shadows.card}
            ref={notesRef}
            multiline={true}
            numberOfLines={16}
            className="bg-white text-base rounded-2xl p-4 shadow-[0px_4px_20px_0px_rgba(0,_0,_0,_0.1)] font-[PlusJakartaSans] placeholder:text-gray100 min-h-[300]"
            placeholder="Enter notes about patient..."
            value={notes}
            onChangeText={setNotes}
            secureTextEntry
          />
        </View>
        <Pressable
          disabled={saving}
          onPress={save}
          className={`h-14 mt-4 ${
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
