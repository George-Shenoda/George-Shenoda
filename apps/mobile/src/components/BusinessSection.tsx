import { Text, View } from 'react-native';
import Reveal from './Reveal';
import type { Palette } from '../theme';

const points = [
  'Automated Email Workflows & Notifications',
  'Real-time Data Dashboards & Syncing',
  'Third-party API Interfacing & Webhooks',
];

function BusinessSection({ palette }: { palette: Palette }) {
  return (
    <View style={{ paddingVertical: 72, paddingHorizontal: 24, gap: 16 }}>
      <Reveal>
        <Text
          style={{
            color: palette.text,
            fontSize: 28,
            fontWeight: '700',
          }}
        >
          Business Automation & Optimization
        </Text>
      </Reveal>
      <Reveal delay={100}>
        <Text style={{ color: palette.mutedText, fontSize: 14, lineHeight: 22 }}>
          Beyond standard web interfaces, I engineer automated workflows that
          eliminate manual tasks. By leveraging Node.js and integrating custom
          APIs, I connect disparate business tools into unified, real-time
          systems.
        </Text>
      </Reveal>
      <View style={{ gap: 12, marginTop: 8 }}>
        {points.map((point, index) => (
          <Reveal key={point} delay={200 + index * 100}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 999,
                  backgroundColor: `${palette.primary}26`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: palette.primary, fontSize: 12 }}>✓</Text>
              </View>
              <Text
                style={{ color: palette.text, fontSize: 13, fontWeight: '500', flex: 1 }}
              >
                {point}
              </Text>
            </View>
          </Reveal>
        ))}
      </View>
    </View>
  );
}

export default BusinessSection;
