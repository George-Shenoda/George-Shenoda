import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SITE_URL } from '../config';
import type { Palette } from '../theme';

export type Section = 'workflow' | 'projects' | 'contact';

const links: Array<{ label: string; section: Section }> = [
  { label: 'Workflow', section: 'workflow' },
  { label: 'Projects', section: 'projects' },
  { label: 'Contact', section: 'contact' },
];

function Navbar({
  palette,
  onNavigate,
}: {
  palette: Palette;
  onNavigate: (section: Section) => void;
}) {
  return (
    <View style={[styles.bar, { backgroundColor: palette.band }]}>
      <Text style={[styles.brand, { color: palette.primary }]}>
        George Shenoda
      </Text>
      <View style={styles.links}>
        {links.map(({ label, section }) => (
          <Pressable
            key={section}
            onPress={() => onNavigate(section)}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text style={[styles.link, { color: palette.text }]}>{label}</Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => {
            Linking.openURL(`${SITE_URL}/assets/resume.pdf`).catch(() => {});
          }}
          style={({ pressed }) => ({
            backgroundColor: palette.primary,
            borderRadius: 999,
            paddingVertical: 6,
            paddingHorizontal: 14,
            opacity: pressed ? 0.75 : 1,
          })}
        >
          <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 13 }}>
            Resume
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 20,
    fontWeight: '700',
    flexShrink: 1,
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  link: {
    fontSize: 14,
  },
});

export default Navbar;
