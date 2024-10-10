import React from "react";
import {
  View,
  TextInput,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  Image,
} from "react-native";
import {} from "nativewind";
import EditPen from "@/assets/icons/edit-pen.svg";
import CustomText from "@/components/CustomText";
import { shadows } from "@/constants/styles";
import { useState } from "react";
import { router } from "expo-router";
import { getPatientData, getUser, updateUser } from "@/api/api";
import { useAuth } from "@/state/auth";
import Male from "@/assets/icons/male.svg";
import Female from "@/assets/icons/female.svg";
import Briefcase from "@/assets/icons/briefcase.svg";
import Calendar from "@/assets/icons/calendar.svg";
import UserIcon from "@/assets/icons/user.svg";
import { Sex } from "@/types/globals";
import { differenceInYears, format, isValid, parse, set } from "date-fns";
import { useHydratedEffect } from "@/hooks/hooks";
import * as ImagePicker from "expo-image-picker";
import { BACKEND_URL } from "@/constants/globals";

const UserDetails = () => {
  type Errors = {
    dob?: string;
    sex?: string;
    occupation?: string;
    name?: string;
  };

  const [email, setEmail] = useState("");
  const [id, setId] = useState(0);
  const [dob, setDob] = useState(new Date());
  const [selectedSex, setSelectedSex] = useState<Sex | null>(null);
  const [occupation, setOccupation] = useState("");
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const auth = useAuth();

  useHydratedEffect(() => {
    const fetchData = async () => {
      try {
        if (auth.user) {
          setEmail(auth.user.email);
          setId(auth.user.id);
          setName(auth.user.name);
          setOccupation(auth.user.occupation);
          setDob(new Date(auth.user.dob));
          setSelectedSex(auth.user.sex as Sex | null);
          setYear(auth.user.dob.split("-")[0]);
          setMonth(auth.user.dob.split("-")[1]);
          setDay(auth.user.dob.split("-")[2]);
          setImage(auth.user.image);
          return;
        }
        const token = auth.token;
        if (!token) {
          throw new Error("No token found");
        }
        auth.setToken(token);

        const user = await getUser();
        if (!user) {
          throw new Error("No user found");
        }
        auth.setUser(user);
        setEmail(user.email);
        setId(user.id);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async () => {
    let base64Image = null;
    if (image !== auth.user?.image && image) {
      const imageBlob = await fetch(image).then((r) => r.blob());
      base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(imageBlob);
      });
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      base64Image = (base64Image as string).split(",")[1];
    }

    const dateString = `${year}-${month}-${day}`;
    const date = format(
      parse(dateString, "yyyy-MM-dd", new Date()),
      "yyyy-MM-dd"
    );
    console.log(date);
    const data = {
      email: email,
      sex: selectedSex,
      occupation: occupation,
      dob: date,
      name: name,
      image: base64Image,
    };

    try {
      const response = await updateUser(data);
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  const handleDateChange = (value: string, type: "day" | "month" | "year") => {
    if (type === "day") {
      if (/^\d{0,2}$/.test(value)) setDay(value);
    } else if (type === "month") {
      if (/^\d{0,2}$/.test(value)) setMonth(value);
    } else if (type === "year") {
      if (/^\d{0,4}$/.test(value)) setYear(value);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    if (!occupation.trim()) newErrors.occupation = "Occupation is required";
    if (!selectedSex) newErrors.sex = "Sex is required";
    if (name.trim().length < 1) newErrors.name = "Name is required";
    if (!day || !month || !year) {
      newErrors.dob = "Complete date of birth is required";
    } else {
      const dateString = `${year}-${month}-${day}`;
      const date = parse(dateString, "yyyy-MM-dd", new Date());
      console.log(date, year, month, day);
      if (!isValid(date)) {
        newErrors.dob = "Invalid date of birth";
      } else {
        const age = differenceInYears(new Date(), date);
        if (age < 13) {
          newErrors.dob = "You must be at least 13 years old";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await onSubmit();
      const patient = await getPatientData(id);
      auth.setUser(patient);
      router.back();
    } catch (error) {
      alert(error);
      console.error("Failed to submit form:", error);
    }
    setLoading(false);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const img = result.assets[0];

      if (
        (img.type && img.type !== "image") ||
        (img.mimeType && !img.mimeType.startsWith("image"))
      ) {
        return;
      }
      setImage(img.uri);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 p-4 pt-20 bg-blue100 justify-between">
        <View>
          {/* Title */}
          <CustomText className="text-2xl font-semibold text-black">
            Update Profile
          </CustomText>
          {/* Subtitle */}
          <View className="w-full h-px bg-gray50 my-6" />
          <View className="flex justify-center items-center">
            <View
              className="relative bg-white rounded-2xl w-[150] h-[150]"
              style={shadows.card}
            >
              {image && (
                <>
                  <Image
                    source={{
                      uri:
                        image !== auth.user?.image
                          ? image
                          : BACKEND_URL + image,
                    }}
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                    }}
                    className="rounded-xl"
                    resizeMode="cover"
                  />
                  <View className="absolute bottom-2 right-2 rounded-full bg-white h-8 w-8 shadow-md flex justify-center items-center">
                    <Pressable onPress={pickImage}>
                      <EditPen
                        width="16"
                        height="16"
                        stroke={"rgba(0, 0, 0, 0.7)"}
                      />
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          </View>
          {/* Name Input */}
          <CustomText className="mb-2 text-base text-black font-medium">
            Name
          </CustomText>
          <Pressable className={`mb-4`} tabIndex={-1}>
            <View className="relative">
              <TextInput
                style={{ ...shadows.card }}
                className="h-14 bg-white text-base rounded-2xl pl-12 pr-4 font-[PlusJakartaSans] placeholder:text-gray100"
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
              />
              <View className="absolute left-4 top-0 h-full w-6 flex items-center justify-center">
                <UserIcon
                  width={24}
                  height={24}
                  strokeWidth={1.5}
                  pointerEvents="none"
                  className="fill-gray200"
                />
              </View>
            </View>
          </Pressable>

          {errors.name && (
            <CustomText className="text-red-500 mb-4">{errors.name}</CustomText>
          )}
          {/* Occupation Input */}
          <CustomText className="mb-2 text-base text-black font-medium">
            Occupation
          </CustomText>
          <Pressable className={`mb-4`} tabIndex={-1}>
            <View className="relative">
              <TextInput
                style={{ ...shadows.card }}
                className="h-14 bg-white text-base rounded-2xl pl-12 pr-4 font-[PlusJakartaSans] placeholder:text-gray100"
                placeholder="Enter your occupation"
                value={occupation}
                onChangeText={setOccupation}
              />
              <View className="absolute left-4 top-0 h-full w-6 flex items-center justify-center">
                <Briefcase
                  width={24}
                  height={24}
                  strokeWidth={1.5}
                  pointerEvents="none"
                  className="fill-gray200"
                />
              </View>
            </View>
          </Pressable>

          {errors.occupation && (
            <CustomText className="text-red-500 mb-4">
              {errors.occupation}
            </CustomText>
          )}
          {/* Sex Selection */}
          <CustomText className="mb-2 text-base text-black font-medium">
            Sex
          </CustomText>
          <View className="flex-row">
            <Pressable
              className={`flex-1 flex-row items-center justify-center py-3 rounded-2xl border-2 ${
                selectedSex === "m"
                  ? "border-blue200 bg-white"
                  : "border-transparent bg-white opacity-60"
              }`}
              onPress={() => setSelectedSex("m")}
            >
              <Male
                width={24}
                height={24}
                className={
                  selectedSex === "m" ? "fill-blue200" : "fill-gray200"
                }
              />
              <CustomText
                className={`ml-2 text-base ${
                  selectedSex === "m"
                    ? "text-blue200 font-medium"
                    : "text-black"
                }`}
              >
                Male
              </CustomText>
            </Pressable>
            <Pressable
              className={`flex-1 flex-row items-center justify-center py-3 ml-2 rounded-2xl border-2 ${
                selectedSex === "f"
                  ? "border-blue200 bg-white"
                  : "border-transparent bg-white opacity-60"
              }`}
              onPress={() => setSelectedSex("f")}
            >
              <Female
                width={24}
                height={24}
                className={
                  selectedSex === "f" ? "fill-blue200" : "fill-gray200"
                }
              />
              <CustomText
                className={`ml-2 text-base ${
                  selectedSex === "f"
                    ? "text-blue200 font-medium"
                    : "text-black"
                }`}
              >
                Female
              </CustomText>
            </Pressable>
          </View>
          {errors.sex && (
            <CustomText className="text-red-500 mb-4">{errors.sex}</CustomText>
          )}
          {/* Date of Birth Input */}
          <CustomText className="mt-6 text-sm text-black">
            Date of birth
          </CustomText>
          {
            <View className="mt-2 flex-row">
              <Pressable tabIndex={-1}>
                <TextInput
                  placeholder="DD"
                  style={shadows.card}
                  className="h-14 w-16 bg-white text-base rounded-2xl px-4 text-center font-[PlusJakartaSans] placeholder:text-gray100"
                  value={day}
                  keyboardType="numeric"
                  onChangeText={(value) => handleDateChange(value, "day")}
                />
              </Pressable>
              <Pressable tabIndex={-1}>
                <TextInput
                  placeholder="MM"
                  style={shadows.card}
                  className="h-14 w-16 bg-white text-base rounded-2xl ml-2 px-4 text-center font-[PlusJakartaSans] placeholder:text-gray100"
                  value={month}
                  keyboardType="numeric"
                  onChangeText={(value) => handleDateChange(value, "month")}
                />
              </Pressable>
              <Pressable tabIndex={-1}>
                <TextInput
                  placeholder="YYYY"
                  style={shadows.card}
                  className="h-14 w-32 bg-white text-base rounded-2xl ml-2 px-4 text-center font-[PlusJakartaSans] placeholder:text-gray100"
                  value={year}
                  keyboardType="numeric"
                  onChangeText={(value) => handleDateChange(value, "year")}
                />
              </Pressable>
            </View>
          }
          {errors.dob && (
            <CustomText className="text-red-500 mt-2">{errors.dob}</CustomText>
          )}
        </View>
        <Pressable
          disabled={loading}
          onPress={submit}
          className={`h-14 ${
            loading ? "bg-gray50" : "bg-blue200"
          } items-center justify-center rounded-full`}
        >
          <CustomText className="text-white text-base font-medium">
            Save
          </CustomText>
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default UserDetails;
