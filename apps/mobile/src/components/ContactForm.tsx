import { useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  View,
  Pressable,
  type TextStyle,
} from 'react-native';
import { submitContact } from '@portfolio/shared';
import { SITE_URL } from '../config';
import Reveal from './Reveal';
import type { Palette } from '../theme';

function ContactForm({ palette }: { palette: Palette }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const inputStyle: TextStyle = {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: palette.text,
    fontSize: 14,
  };

  async function handleSubmit() {
    setStatus('loading');
    setErrorMessage('');

    const result = await submitContact(SITE_URL, { name, email, message });

    if (result.success) {
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } else {
      setStatus('error');
      setErrorMessage(result.error ?? 'Something went wrong. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <View
        style={{
          backgroundColor: palette.section,
          paddingVertical: 64,
          paddingHorizontal: 24,
          gap: 12,
        }}
      >
        <Text
          style={{
            color: palette.text,
            fontSize: 24,
            fontWeight: '700',
            textAlign: 'center',
          }}
        >
          Message Sent Successfully!
        </Text>
        <Text
          style={{ color: palette.mutedText, fontSize: 13, textAlign: 'center' }}
        >
          Thank you for reaching out. I&apos;ve received your message and will
          get back to you as soon as possible.
        </Text>
        <Pressable onPress={() => setStatus('idle')}>
          <Text
            style={{
              textAlign: 'center',
              color: palette.primary,
              fontWeight: '600',
              marginTop: 8,
            }}
          >
            Send Another Message
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: palette.section,
        paddingVertical: 64,
        paddingHorizontal: 24,
        gap: 16,
      }}
    >
      <Reveal>
        <Text
          style={{
            color: palette.text,
            fontSize: 28,
            fontWeight: '700',
            textAlign: 'center',
          }}
        >
          Let&apos;s Engineer Your Next Solution
        </Text>
      </Reveal>
      <Reveal delay={100}>
        <Text
          style={{
            color: palette.mutedText,
            fontSize: 13,
            textAlign: 'center',
          }}
        >
          Ready to start your next project? Send me a message and let&apos;s get
          to work.
        </Text>
      </Reveal>
      {status === 'error' ? (
        <Text style={{ color: '#ef4444', fontSize: 13, textAlign: 'center' }}>
          {errorMessage}
        </Text>
      ) : null}
      <TextInput
        placeholder="Your Name"
        placeholderTextColor={palette.mutedText}
        value={name}
        onChangeText={setName}
        editable={status !== 'loading'}
        style={inputStyle}
      />
      <TextInput
        placeholder="your.email@example.com"
        placeholderTextColor={palette.mutedText}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={status !== 'loading'}
        style={inputStyle}
      />
      <TextInput
        placeholder="Tell me about your project, timeline, or question..."
        placeholderTextColor={palette.mutedText}
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={5}
        editable={status !== 'loading'}
        style={[inputStyle, { minHeight: 110, textAlignVertical: 'top' }]}
      />
      <Pressable
        onPress={handleSubmit}
        disabled={status === 'loading'}
        style={({ pressed }) => ({
          backgroundColor: palette.primary,
          opacity: status === 'loading' || pressed ? 0.75 : 1,
          borderRadius: 12,
          paddingVertical: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        })}
      >
        {status === 'loading' ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : null}
        <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 15 }}>
          {status === 'loading' ? 'Sending Message...' : 'Send Message'}
        </Text>
      </Pressable>
    </View>
  );
}

export default ContactForm;
