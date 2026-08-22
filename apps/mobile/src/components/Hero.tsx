import { Linking, Pressable, Text, View } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useFonts,
  JetBrainsMono_400Regular,
} from '@expo-google-fonts/jetbrains-mono';
import Reveal from './Reveal';
import { SITE_URL } from '../config';
import type { Palette } from '../theme';

const capabilities = [
  'Embedded Systems',
  'Full-Stack Web',
  'IoT Dashboards',
  'Business Automation',
];

function Hero({ palette }: { palette: Palette }) {
  const [fontsLoaded] = useFonts({ JetBrainsMono_400Regular });

  return (
    <View style={{ paddingVertical: 72, paddingHorizontal: 24, gap: 8 }}>
      <Reveal delay={100}>
        <Text
          style={{
            color: palette.text,
            fontSize: 34,
            fontWeight: '700',
            textAlign: 'center',
          }}
        >
          Bridging Mechatronics & Code:
        </Text>
      </Reveal>
      <Reveal delay={200}>
        <MaskedView
          maskElement={
            <Text
              style={{
                fontSize: 34,
                fontWeight: '700',
                textAlign: 'center',
                backgroundColor: 'transparent',
              }}
            >
              Full-Stack Solutions & Business Automation.
            </Text>
          }
        >
          <LinearGradient
            colors={palette.gradient as unknown as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: '100%', height: 96 }}
          />
        </MaskedView>
      </Reveal>
      <Reveal delay={300}>
        <Text
          style={{
            color: palette.mutedText,
            fontSize: 14,
            lineHeight: 21,
            textAlign: 'center',
            maxWidth: 480,
            alignSelf: 'center',
          }}
        >
          I apply engineering logic to web development. I specialize in building
          responsive full-stack applications and automating business workflows,
          delivering clean code and practical solutions from concept to
          deployment.
        </Text>
      </Reveal>
      <Reveal delay={400}>
        <Text
          style={{
            color: palette.mutedText,
            fontFamily: fontsLoaded ? 'JetBrainsMono_400Regular' : undefined,
            fontSize: 12,
            letterSpacing: 1,
            textAlign: 'center',
            marginTop: 16,
          }}
        >
          {capabilities.join('  /  ')}
        </Text>
      </Reveal>
      <Reveal delay={500}>
        <Pressable
          onPress={() => {
            Linking.openURL(`${SITE_URL}/assets/resume.pdf`).catch(() => {});
          }}
          style={({ pressed }) => ({
            marginTop: 24,
            alignSelf: 'center',
            borderWidth: 1,
            borderColor: palette.primary,
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 28,
            opacity: pressed ? 0.75 : 1,
          })}
        >
          <Text
            style={{
              color: palette.primary,
              fontWeight: '600',
              fontSize: 15,
            }}
          >
            Download CV
          </Text>
        </Pressable>
      </Reveal>
    </View>
  );
}

export default Hero;
