import React, { useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  Text,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import CustomText from "@/frontend/components/CustomText";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useHydratedEffect } from "@/hooks/hooks";
import { UserWithTherapistData } from "@/types/models";
import {
  assignTherapist,
  getPatientData,
  getTherapistData,
  unassignTherapist,
} from "@/frontend/api/api";
import { useAuth } from "@/state/auth";
import useTherapistStore from "@/state/assignedTherapist";
import { BACKEND_URL } from "@/frontend/constants/globals";

const DoctorDetails = () => {
  const router = useRouter();
  const { doctorId } = useLocalSearchParams();
  const [doctor, setDoctor] = useState<UserWithTherapistData | null>(null);
  const [dataShared, setDataShared] = useState(false);
  const [hasDoctor, setHasDoctor] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const auth = useAuth();
  const therapistStore = useTherapistStore();

  // Function to handle sharing data with the doctor
  const share = async () => {
    if (hasDoctor) {
      setModalVisible(true);
    } else {
      const assigned = await assignTherapist(Number(doctorId));
      setHasDoctor(true);
      setDataShared(true);
      therapistStore.setTherapist(doctor);
    }
  };

  const handleConfirm = async () => {
    await unassignTherapist();
    await assignTherapist(Number(doctorId));
    setHasDoctor(true);
    setDataShared(true);
    setModalVisible(false);
    therapistStore.setTherapist(doctor);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const unshare = async () => {
    await unassignTherapist();
    setHasDoctor(false);
    setDataShared(false);
    therapistStore.clearTherapist();
  };

  useHydratedEffect(() => {
    const fetchData = async () => {
      try {
        if (!auth.user) {
          throw new Error("No user found");
        }
        const user = await getPatientData(auth.user?.id);
        if (user?.patient_data?.therapist_user_id) {
          setHasDoctor(true);
        }
        if (user?.patient_data?.therapist_user_id === Number(doctorId)) {
          setDataShared(true);
        }
        const doctor = await getTherapistData(Number(doctorId));
        if (doctor) {
          setDoctor(doctor);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  if (!doctor) {
    return (
      <View className="flex-1 justify-center items-center bg-blue100">
        <ActivityIndicator size="large" color="#256CD0" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-blue100">
      <ScrollView className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-6 mt-[65px]">
          <View className="flex-row items-center gap-5">
            <View className="p-1 w-16 h-16 items-center justify-center bg-gray-50 rounded-full">
              <Image
                className="w-full h-full rounded-full"
                source={{
                  uri: BACKEND_URL + doctor.image,
                }}
              />
            </View>
            <View className="flex-col">
              <CustomText className="text-[20px] font-medium text-black">
                Dr. {doctor.name}
              </CustomText>
              <CustomText className="text-gray300 text-[16px]">
                ID: {doctorId}
              </CustomText>
            </View>
          </View>
        </View>

        <View className="bg-white p-5 rounded-[20px] mb-8">
          <View className="flex-row items-center mt-1 mx-1 mb-4">
            <View className="flex-1">
              <CustomText className="text-[16px] text-gray100 mb-1">
                Date of Birth
              </CustomText>
              <CustomText className="text-[16px] text-black">
                {doctor.dob}
              </CustomText>
            </View>

            <View className="flex-1">
              <CustomText className="text-[16px] text-gray100 mb-1">
                Sex
              </CustomText>
              <CustomText className="text-[16px] text-black">
                {doctor?.sex
                  ? doctor.sex === "m"
                    ? "Male"
                    : doctor.sex === "f"
                    ? "Female"
                    : doctor.sex
                  : "-"}
              </CustomText>
            </View>
          </View>

          <View className="flex-row items-center mt-1 mx-1 mb-4">
            <View className="flex-1">
              <CustomText className="text-[16px] text-gray100 mb-1">
                Qualifications
              </CustomText>
              <CustomText className="text-[16px] text-black">
                {doctor.therapist_data?.qualifications}
              </CustomText>
            </View>
          </View>

          <View className="flex-row items-center mt-1 mx-1 mb-4">
            <View className="flex-1">
              <CustomText className="text-[16px] text-gray100 mb-1">
                Expertise
              </CustomText>
              <CustomText className="text-[16px] text-black">
                {doctor.therapist_data?.expertise}
              </CustomText>
            </View>
          </View>

          <View className="flex-row items-center mt-1 mx-1 mb-4">
            <View className="flex-1">
              <CustomText className="text-[16px] text-gray100 mb-1">
                Bio
              </CustomText>
              <CustomText className="text-[16px] text-black">
                {doctor.therapist_data?.bio}
              </CustomText>
            </View>
          </View>

          <View className="flex-row items-center mt-1 mx-1 mb-4">
            <View className="flex-1">
              <CustomText className="text-[16px] text-gray100 mb-1">
                Treatment Approach
              </CustomText>
              <CustomText className="text-[16px] text-black">
                {doctor.therapist_data?.treatment_approach}
              </CustomText>
            </View>
          </View>
        </View>
        <View className="flex-1 w-full justify-center items-center">
          {dataShared ? (
            <>
              <CustomText className="mb-2">
                You are currently sharing your data with this doctor.
              </CustomText>
              <Pressable
                onPress={unshare}
                className="h-14 w-full bg-red-500 items-center justify-center rounded-full"
              >
                <CustomText className="text-white text-base font-medium">
                  Unshare data
                </CustomText>
              </Pressable>
            </>
          ) : (
            <>
              <CustomText className="mb-2 text-center">
                Share your data with this doctor for personalised insights.
              </CustomText>
              <Pressable
                onPress={share}
                className="h-14 w-full bg-blue200 items-center justify-center rounded-full"
              >
                <CustomText className="text-white text-base font-medium">
                  Share data
                </CustomText>
              </Pressable>
            </>
          )}
        </View>

        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/40">
            <View className="bg-white pt-6 pb-4 rounded-3xl w-4/5">
              <CustomText className="text-lg font-semibold mb-2 text-center px-6">
                You already have a doctor assigned.
              </CustomText>

              <CustomText className="text-base mb-4 text-center px-6">
                Do you want to unassign your current doctor and continue with
                this doctor?
              </CustomText>

              <View className="w-full h-[1px] bg-gray-200 mb-2" />

              <View className="flex-row w-full items-stretch">
                <Pressable
                  onPress={handleCancel}
                  className="flex-1 items-center justify-center self-stretch"
                >
                  <CustomText className="text-blue-500 font-medium text-lg">
                    No
                  </CustomText>
                </Pressable>
                <View className="w-[1px] bg-gray-200 self-stretch -my-2 -mb-4" />
                <Pressable
                  onPress={handleConfirm}
                  className="flex-1 items-center justify-center self-stretch"
                >
                  <CustomText className="text-blue-500 font-medium text-lg">
                    Yes
                  </CustomText>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DoctorDetails;
