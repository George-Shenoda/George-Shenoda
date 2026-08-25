import { Text, View } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import Reveal from './Reveal';
import { usePalette } from '../theme-mode';

const points = [
  'Automated Email Workflows & Notifications',
  'Real-time Data Dashboards & Syncing',
  'Third-party API Interfacing & Webhooks',
];

function BusinessSection() {
  const palette = usePalette();

  return (
    <View style={{ paddingVertical: 96, paddingHorizontal: 16, gap: 48 }}>
      <Reveal>
        <Text
          style={{
            color: palette.text,
            fontSize: 30,
            fontWeight: '700',
            marginBottom: 16,
          }}
        >
          Business Automation &amp; Optimization
        </Text>
        <Text style={{ color: palette.mutedText, fontSize: 16, lineHeight: 26 }}>
          Beyond standard web interfaces, I engineer automated workflows that
          eliminate manual tasks. By leveraging Node.js and integrating custom
          APIs, I connect disparate business tools into unified, real-time
          systems.
        </Text>
        <View style={{ marginTop: 32, gap: 16 }}>
          {points.map((point) => (
            <View key={point} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <CheckCircle size={20} color={palette.primary} />
              <Text style={{ color: palette.text, fontSize: 16, fontWeight: '500', flex: 1 }}>
                {point}
              </Text>
            </View>
          ))}
        </View>
      </Reveal>
    </View>
  );
}

export default BusinessSection;
