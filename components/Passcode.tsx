import { shadows } from "@/constants/styles";
import { useRef, useState, useMemo, useEffect } from "react";
import { TextInput, View, Pressable } from "react-native";
import CustomText from "./CustomText";

const Passcode: React.FC = () => {
  const length = 4;
  const inputRefs = useRef<Array<TextInput | null>>(Array(length).fill(null)); // Refs for TextInput fields

  const [passcodeIsConfigured, setPasscodeIsConfigured] = useState(false);
  const [passcode, setPasscode] = useState(Array(length).fill(""));
  const isValidPasscode = useMemo(
    () =>
      passcode.every((char) => /^\d$/.test(char)) && passcode.length === length,
    [passcode]
  );
  const handleChangeText = (text: string, index: number) => {
    const updatedPasscode = [...passcode];

    if (/^\d$/.test(text)) {
      // Only allow digits
      updatedPasscode[index] = text;
      setPasscode(updatedPasscode);

      // Automatically focus on the next input
      if (index < length - 1 && text !== "") {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    const { key } = e.nativeEvent;
    // If user presses backspace and the current input is empty, move to the previous input
    if (key === "Backspace") {
      if ((index === length - 1 && passcode[index]) || index === 0) {
        passcode[index] = "";
        setPasscode([...passcode]);
      } else {
        passcode[index - 1] = "";
        setPasscode([...passcode]);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const focusFirstEmptyInput = () => {
    const firstEmptyIndex = passcode.findIndex((value) => value === "");
    if (firstEmptyIndex !== -1) {
      inputRefs.current[firstEmptyIndex]?.focus();
    } else {
      inputRefs.current[length - 1]?.focus();
    }
  };

  const savePasscode = () => {
    console.log("passcode", passcode.join(""));
    setPasscodeIsConfigured(true);
  };

  useEffect(() => {
    // can check if passcodeIsConfigured here
  }, [passcodeIsConfigured]);

  return (
    <>
      <View className="flex-row justify-between items-center mt-4 mb-6">
        {/* Placeholder for passcode dots */}
        <View className="w-full items-center">
          <Pressable
            className="flex-row justify-between mt-5 gap-2 w-full"
            onPress={focusFirstEmptyInput}
          >
            {Array.from({ length }).map((_, index) => (
              <TextInput
                tabIndex={-1} // Disable tab focus, but need to work on this for accessibility
                key={index}
                style={{ ...shadows.card }}
                className="w-full bg-white text-center text-lg rounded-3xl aspect-square "
                keyboardType="numeric"
                maxLength={1}
                ref={(ref) => (inputRefs.current[index] = ref)}
                defaultValue={passcode[index]}
                onChangeText={(text) => handleChangeText(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                pointerEvents="none"
              />
            ))}
          </Pressable>
        </View>
      </View>
      <View className="flex-1">
        <Pressable
          onPress={savePasscode}
          disabled={!isValidPasscode}
          className={`h-14 ${
            isValidPasscode ? "bg-blue200" : "bg-disabled"
          } items-center justify-center rounded-full`}
          style={shadows.card}
        >
          <CustomText className="text-white text-base font-medium">
            Activate
          </CustomText>
        </Pressable>
      </View>
    </>
  );
};

export default Passcode;
