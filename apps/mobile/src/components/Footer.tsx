import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePalette } from '../theme-mode';
import type { Section } from '../scroll';

type FooterProps = {
  onNavigate: (section: Section) => void;
  onNavigateToPrivacy: () => void;
};

const links: Array<{ label: string; section: Section }> = [
  { label: 'Workflow', section: 'workflow' },
  { label: 'Projects', section: 'projects' },
  { label: 'Contact', section: 'contact' },
];

function Footer({ onNavigate, onNavigateToPrivacy }: FooterProps) {
  const palette = usePalette();

  return (
    <View
      style={[
        styles.stack,
        {
          backgroundColor: palette.band,
          paddingHorizontal: 32,
          paddingVertical: 32,
          gap: 16,
        },
      ]}
    >
      <Text style={{ color: palette.primary, fontSize: 20, fontWeight: '700' }}>
        George Shenoda
      </Text>
      <View style={styles.row}>
        {links.map(({ label, section }) => (
          <Pressable
            key={section}
            onPress={() => onNavigate(section)}
            hitSlop={8}
            accessibilityRole="link"
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text style={{ color: palette.mutedText, fontSize: 14, fontWeight: '500' }}>
              {label}
            </Text>
          </Pressable>
        ))}
        <Pressable
          onPress={onNavigateToPrivacy}
          hitSlop={8}
          accessibilityRole="link"
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Text style={{ color: palette.mutedText, fontSize: 14, fontWeight: '500' }}>
            Privacy
          </Text>
        </Pressable>
      </View>
      <Text style={{ color: palette.mutedText, fontSize: 14 }}>
        © {new Date().getFullYear()} George Shenoda. All rights reserved.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
});

export default Footer;
