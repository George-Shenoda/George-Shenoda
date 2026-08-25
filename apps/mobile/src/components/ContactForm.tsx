import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { createOutbox, submitContact, type Outbox } from '@portfolio/shared';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MailWarning,
} from 'lucide-react-native';
import Reveal from './Reveal';
import PressableScale from './PressableScale';
import { SITE_URL } from '../config';
import { createAsyncStorageStorage } from '../outbox-storage';
import { usePalette } from '../theme-mode';

const OUTBOX_KEY = 'portfolio-contact-outbox';

type Status = 'idle' | 'loading' | 'success' | 'error' | 'queued';

function ContactForm() {
  const palette = usePalette();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [queuedCount, setQueuedCount] = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const outboxRef = useRef<Outbox | null>(null);

  const outbox = useMemo(
    () =>
      createOutbox({
        storage: createAsyncStorageStorage(OUTBOX_KEY),
        submit: (payload) => submitContact(SITE_URL, payload),
      }),
    []
  );
  outboxRef.current = outbox;

  // Flush anything queued from a previous offline session on mount.
  // Step 14 adds NetInfo reconnect/launch triggers on top of this.
  useEffect(() => {
    let cancelled = false;
    outbox
      .flush()
      .then((result) => {
        if (!cancelled) setQueuedCount(result.remaining.length);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [outbox]);

  function clearBanners() {
    if (status === 'error' || status === 'queued') {
      setStatus('idle');
      setErrorMessage('');
    }
  }

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('error');
      setErrorMessage('Please fill in your name, email, and message.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const result = await submitContact(SITE_URL, { name, email, message });

      if (result.success) {
        setStatus('success');
        setName('');
        setEmail('');
        setMessage('');
      } else if (result.networkError && outboxRef.current) {
        // Offline: persist to the outbox; it auto-sends once connectivity returns.
        await outboxRef.current.add({ name, email, message });
        setQueuedCount(await outboxRef.current.pendingCount());
        setStatus('queued');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
        setErrorMessage(result.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMessage(
        'Failed to send message. Please check your connection and try again.'
      );
    }
  }

  const inputStyle: TextStyle = {
    borderWidth: 1,
    borderColor: palette.inputBorder,
    borderRadius: 14,
    padding: 12,
    fontSize: 16,
    color: palette.text,
    backgroundColor: 'transparent',
  };

  const fieldStyle = (field: string): TextStyle => ({
    ...inputStyle,
    borderColor:
      focusedField === field ? palette.primary : palette.inputBorder,
  });

  const labelStyle: TextStyle = {
    color: palette.mutedText,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  };

  const spinnerRotation = useSharedValue(0);
  useEffect(() => {
    if (status === 'loading') {
      spinnerRotation.set(
        withRepeat(withTiming(360, { duration: 800, easing: Easing.linear }), -1, false)
      );
    }
  }, [status, spinnerRotation]);
  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinnerRotation.get()}deg` }],
  }));

  return (
    <View
      style={{
        backgroundColor: palette.band,
        padding: 24,
        alignItems: 'center',
      }}
    >
      <Reveal style={{ width: '100%', maxWidth: 896 }}>
        <View
          style={{
            width: '100%',
            padding: 24,
            borderRadius: 22,
            backgroundColor: palette.contactCard,
            borderWidth: 1,
            borderColor: palette.cardBorder,
            alignItems: 'center',
            shadowColor: '#000000',
            shadowOpacity: 0.25,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 12 },
            elevation: 16,
          }}
        >
          <Text
            style={{
              color: palette.text,
              fontSize: 30,
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            Let&apos;s Engineer Your Next Solution
          </Text>
          <Text
            style={{
              color: palette.mutedText,
              fontSize: 16,
              lineHeight: 26,
              textAlign: 'center',
              maxWidth: 512,
              marginBottom: 32,
            }}
          >
            Ready to start your next project? Send me a message and let&apos;s
            get to work.
          </Text>

          {status === 'success' ? (
            <View style={{ paddingVertical: 48, alignItems: 'center', gap: 16 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 999,
                  backgroundColor: palette.emeraldTint,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={40} color={palette.emerald} />
              </View>
              <Text
                style={{ color: palette.text, fontSize: 24, fontWeight: '600' }}
              >
                Message Sent
              </Text>
              <Text
                style={{
                  color: palette.mutedText,
                  fontSize: 16,
                  lineHeight: 26,
                  textAlign: 'center',
                  maxWidth: 448,
                }}
              >
                Thank you for reaching out. I&apos;ve received your message and
                will get back to you as soon as possible.
              </Text>
              <PressableScale
                onPress={() => setStatus('idle')}
                style={{
                  marginTop: 16,
                  borderRadius: 26,
                  borderWidth: 1,
                  borderColor: palette.primary,
                  paddingHorizontal: 24,
                  paddingVertical: 20,
                }}
              >
                <Text
                  style={{ color: palette.primary, fontSize: 16, fontWeight: '500' }}
                >
                  Send Another Message
                </Text>
              </PressableScale>
            </View>
          ) : (
            <View style={{ alignSelf: 'stretch', gap: 16 }}>
              {status === 'error' && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 16,
                    borderRadius: 14,
                    backgroundColor: palette.destructiveTint,
                    borderWidth: 1,
                    borderColor: palette.destructive,
                  }}
                >
                  <AlertCircle size={20} color={palette.destructive} />
                  <Text
                    style={{
                      color: palette.destructive,
                      fontSize: 14,
                      fontWeight: '500',
                      flex: 1,
                    }}
                  >
                    {errorMessage}
                  </Text>
                </View>
              )}
              {(status === 'queued' || (queuedCount > 0 && status === 'idle')) && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 16,
                    marginBottom: 8,
                    borderRadius: 14,
                    backgroundColor: `${palette.primary}1A`,
                    borderWidth: 1,
                    borderColor: `${palette.primary}40`,
                  }}
                >
                  <MailWarning size={20} color={palette.primary} />
                  <Text
                    style={{
                      color: palette.primary,
                      fontSize: 14,
                      fontWeight: '500',
                      flex: 1,
                    }}
                  >
                    {status === 'queued'
                      ? 'You are offline — your message was saved and will send automatically once you reconnect.'
                      : `${queuedCount} saved message${
                          queuedCount === 1 ? '' : 's'
                        } will send automatically once you are back online.`}
                  </Text>
                </View>
              )}

              <View style={{ gap: 6 }}>
                <Text style={labelStyle}>Name</Text>
                <TextInput
                  placeholder="Your Name"
                  placeholderTextColor={`${palette.mutedText}99`}
                  value={name}
                  onChangeText={(value) => {
                    setName(value);
                    clearBanners();
                  }}
                  editable={status !== 'loading'}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  selectionColor={palette.primary}
                  style={fieldStyle('name')}
                />
              </View>

              <View style={{ gap: 6 }}>
                <Text style={labelStyle}>Email</Text>
                <TextInput
                  placeholder="your.email@example.com"
                  placeholderTextColor={`${palette.mutedText}99`}
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    clearBanners();
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={status !== 'loading'}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  selectionColor={palette.primary}
                  style={fieldStyle('email')}
                />
              </View>

              <View style={{ gap: 6 }}>
                <Text style={labelStyle}>Message</Text>
                <TextInput
                  placeholder="Tell me about your project, timeline, or question..."
                  placeholderTextColor={`${palette.mutedText}99`}
                  value={message}
                  onChangeText={(value) => {
                    setMessage(value);
                    clearBanners();
                  }}
                  multiline
                  numberOfLines={5}
                  editable={status !== 'loading'}
                  onFocus={() => setFocusedField('message')}
                  onBlur={() => setFocusedField(null)}
                  selectionColor={palette.primary}
                  style={[fieldStyle('message'), { minHeight: 120, textAlignVertical: 'top' }]}
                />
              </View>

              <View style={{ alignItems: 'center', gap: 12, paddingTop: 8 }}>
                <PressableScale
                  onPress={handleSubmit}
                  disabled={status === 'loading'}
                  accessibilityLabel="Send Message"
                  style={{
                    width: '100%',
                    borderRadius: 26,
                    overflow: 'hidden',
                    opacity: status === 'loading' ? 0.7 : 1,
                    shadowColor: palette.primary,
                    shadowOpacity: 0.3,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 8 },
                    elevation: 8,
                  }}
                >
                  <LinearSubmitGradient palette={palette}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        paddingVertical: 24,
                        paddingHorizontal: 40,
                      }}
                    >
                      {status === 'loading' ? (
                        <>
                          <Animated.View style={spinnerStyle}>
                            <Loader2 size={20} color="#ffffff" />
                          </Animated.View>
                          <Text
                            style={{
                              color: '#ffffff',
                              fontSize: 16,
                              fontWeight: '600',
                            }}
                          >
                            Sending Message...
                          </Text>
                        </>
                      ) : (
                        <Text
                          style={{
                            color: '#ffffff',
                            fontSize: 16,
                            fontWeight: '600',
                          }}
                        >
                          Send Message
                        </Text>
                      )}
                    </View>
                  </LinearSubmitGradient>
                </PressableScale>
                <Text style={{ color: palette.mutedText, fontSize: 14 }}>
                  Typically replies within 24 hours — no spam, ever.
                </Text>
              </View>
            </View>
          )}
        </View>
      </Reveal>
    </View>
  );
}

function LinearSubmitGradient({
  palette,
  children,
}: {
  palette: ReturnType<typeof usePalette>;
  children: ReactNode;
}) {
  return (
    <LinearGradient
      colors={[palette.primary, palette.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
}

export default ContactForm;
