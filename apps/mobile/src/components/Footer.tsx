import { StyleSheet, Text, View } from 'react-native';
import type { Palette } from '../theme';

function Footer({ palette }: { palette: Palette }) {
  return (
    <View style={[styles.bar, { backgroundColor: palette.band }]}>
      <Text style={[styles.brand, { color: palette.primary }]}>
        George Shenoda
      </Text>
      <Text style={{ color: palette.mutedText, fontSize: 12 }}>
        © {new Date().getFullYear()} George Shenoda. All rights reserved.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  brand: {
    fontSize: 20,
    fontWeight: '700',
  },
});

export default Footer;
