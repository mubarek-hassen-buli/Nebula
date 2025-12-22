import React, { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  autoFocus?: boolean;
}

export function OTPInput({ 
  length = 6, 
  value, 
  onChange,
  autoFocus = true 
}: OTPInputProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length === 0) {
      // Handle backspace
      const newOTP = value.split('');
      newOTP[index] = '';
      onChange(newOTP.join(''));
      
      // Move to previous input
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (numericText.length === 1) {
      // Single digit entered
      const newOTP = value.split('');
      newOTP[index] = numericText;
      onChange(newOTP.join(''));
      
      // Move to next input
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (numericText.length === length) {
      // Pasted full OTP
      onChange(numericText.slice(0, length));
      inputRefs.current[length - 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          style={[
            styles.input,
            focusedIndex === index && styles.inputFocused,
            value[index] && styles.inputFilled,
          ]}
          value={value[index] || ''}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => setFocusedIndex(index)}
          keyboardType="number-pad"
          maxLength={1}
          autoFocus={autoFocus && index === 0}
          selectTextOnFocus
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  input: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  inputFocused: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  inputFilled: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
});
