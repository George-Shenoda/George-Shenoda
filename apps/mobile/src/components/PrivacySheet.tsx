import { useState, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { usePalette } from '../theme-mode';
import PressableScale from './PressableScale';
import { fontFamily } from '../fonts';

type PrivacySheetProps = {
  visible: boolean;
  onClose: () => void;
};

function PrivacySheet({ visible, onClose }: PrivacySheetProps) {
  const insets = useSafeAreaInsets();
  const palette = usePalette();

  const isLight = palette.background === '#ffffff';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} />
      <View style={[styles.backdrop, { paddingTop: insets.top, backgroundColor: palette.band }]}>
        <View style={[styles.topBar, { backgroundColor: palette.background, borderBottomColor: palette.cardBorder }]}>
          <Text style={[styles.title, { color: palette.text }]}>Privacy Policy</Text>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close Privacy Policy"
            hitSlop={8}
            style={({ pressed }) => [
              styles.closeButton,
              { opacity: pressed ? 0.6 : 1, backgroundColor: palette.accent },
            ]}
          >
            <X size={22} color={palette.text} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.sheet,
            { paddingBottom: insets.bottom + 24, backgroundColor: palette.card },
          ]}
        >
          <Text style={[styles.lastUpdated, { color: palette.mutedText }]}>Last updated: August 2026</Text>

          <Section style={{ marginTop: 24 }}>
            <SectionTitle palette={palette}>1. Information We Collect</SectionTitle>
            <SectionBody palette={palette}>
              This portfolio app does not collect, store, or transmit any personal
              information from your device. No analytics, tracking, or third-party
              data collection occurs during your use of this application.
            </SectionBody>
          </Section>

          <Section style={{ marginTop: 20 }}>
            <SectionTitle palette={palette}>2. Contact Form Data</SectionTitle>
            <SectionBody palette={palette}>
              If you choose to submit a message via the contact form, the data you
              provide (name, email, message) is sent directly to the site owner's
              email service. This data is not stored within the app itself. The
              desktop version may queue messages locally for offline sending, but
              this data remains on your device until successfully transmitted.
            </SectionBody>
          </Section>

          <Section style={{ marginTop: 20 }}>
            <SectionTitle palette={palette}>3. Local Storage</SectionTitle>
            <SectionBody palette={palette}>
              The app stores only your theme preference (light/dark/system) locally
              using AsyncStorage. This preference is never transmitted anywhere.
            </SectionBody>
          </Section>

          <Section style={{ marginTop: 20 }}>
            <SectionTitle palette={palette}>4. Network Requests</SectionTitle>
            <SectionBody palette={palette}>
              The app makes network requests only when you:
              <Bullet palette={palette}>Load project images from the portfolio server</Bullet>
              <Bullet palette={palette}>Submit a contact form message</Bullet>
              <Bullet palette={palette}>Check for app updates (Expo)</Bullet>
              No background requests or telemetry are sent.
            </SectionBody>
          </Section>

          <Section style={{ marginTop: 20 }}>
            <SectionTitle palette={palette}>5. Third-Party Services</SectionTitle>
            <SectionBody palette={palette}>
              This app uses Expo for development and build tooling. When running
              in Expo Go, Expo's own privacy policy applies. The standalone app
              includes no third-party SDKs for analytics, advertising, or tracking.
            </SectionBody>
          </Section>

          <Section style={{ marginTop: 20 }}>
            <SectionTitle palette={palette}>6. Your Rights</SectionTitle>
            <SectionBody palette={palette}>
              Since no personal data is collected or stored by this app, there is
              no data to access, rectify, or delete. If you submitted a contact
              form message and wish to have it removed, please contact the site
              owner directly via email.
            </SectionBody>
          </Section>

          <Section style={{ marginTop: 20 }}>
            <SectionTitle palette={palette}>7. Changes to This Policy</SectionTitle>
            <SectionBody palette={palette}>
              Any updates will be posted within the app with a revised "Last
              updated" date. Continued use constitutes acceptance.
            </SectionBody>
          </Section>

          <Section style={{ marginTop: 20 }}>
            <SectionTitle palette={palette}>8. Contact</SectionTitle>
            <SectionBody palette={palette}>
              Questions about this policy? Reach out via the contact form in this
              app or email george@shenoda.dev.
            </SectionBody>
          </Section>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    flexGrow: 1,
    marginHorizontal: 12,
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  lastUpdated: {
    fontSize: 13,
    fontFamily: fontFamily.mono,
    marginBottom: 8,
  },
  section: {
    gap: 8,
  },
});

function Section({ children, style }: { children: ReactNode; style?: any }) {
  return <View style={[styles.section, style]}>{children}</View>;
}

function SectionTitle({ children, palette }: { children: ReactNode; palette: ReturnType<typeof usePalette> }) {
  return (
    <Text style={{ fontSize: 16, fontWeight: '700', color: palette.text }}>
      {children}
    </Text>
  );
}

function SectionBody({ children, palette }: { children: ReactNode; palette: ReturnType<typeof usePalette> }) {
  return (
    <Text style={{ fontSize: 14, lineHeight: 22, color: palette.text }}>
      {children}
    </Text>
  );
}

function Bullet({ children, palette }: { children: ReactNode; palette: ReturnType<typeof usePalette> }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, paddingLeft: 8, marginTop: 4 }}>
      <Text style={{ fontSize: 14, lineHeight: 22, color: palette.text }}>•</Text>
      <Text style={{ fontSize: 14, lineHeight: 22, color: palette.text, flex: 1 }}>
        {children}
      </Text>
    </View>
  );
}

export default PrivacySheet;