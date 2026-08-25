import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Circle,
  Defs,
  Mask,
  Pattern,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { ChevronDown, FileDown, FileText } from 'lucide-react-native';
import Reveal from './Reveal';
import PressableScale from './PressableScale';
import { fontFamily } from '../fonts';
import { usePalette } from '../theme-mode';
import type { Section } from '../scroll';

type HeroProps = {
  onNavigate: (section: Section) => void;
  onDownloadCv: () => void;
  onViewCv: () => void;
};

const H2_TEXT = 'Full-Stack Solutions & Business Automation.';
const PARAGRAPH =
  'I apply engineering logic to web development. I specialize in building responsive full-stack applications and automating business workflows, delivering clean code and practical solutions from concept to deployment.';
const capabilities = [
  'Embedded Systems',
  'Full-Stack Web',
  'IoT Dashboards',
  'Business Automation',
];

function Hero({ onNavigate, onDownloadCv, onViewCv }: HeroProps) {
  const palette = usePalette();

  return (
    <View style={{ overflow: 'hidden' }}>
      {/* Glow ellipse: web blur-[110px] primary/10·/20 disc approximated with a
          radial gradient fade — no per-frame cost, no real blur needed. */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 384,
          alignItems: 'center',
        }}
      >
        <Svg width="100%" height="384" style={{ maxWidth: 544 }}>
          <Defs>
            <RadialGradient id="glow" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0" stopColor={palette.glow} stopOpacity="1" />
              <Stop offset="0.55" stopColor={palette.glow} stopOpacity="0.45" />
              <Stop offset="1" stopColor={palette.glow} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#glow)" />
        </Svg>
      </View>

      {/* 28px dot grid masked by a radial ellipse (60% 65% at 50% 30%). */}
      <Svg
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        width="100%"
        height="100%"
      >
        <Defs>
          <Pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
            <Circle cx="1" cy="1" r="1" fill={palette.dot} />
          </Pattern>
          <RadialGradient id="dotFade" cx="50%" cy="30%" rx="60%" ry="65%">
            <Stop offset="0" stopColor="#ffffff" />
            <Stop offset="1" stopColor="#000000" />
          </RadialGradient>
          <Mask id="dotMask">
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#dotFade)" />
          </Mask>
        </Defs>
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#dots)"
          mask="url(#dotMask)"
        />
      </Svg>

      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 80,
          paddingBottom: 96,
          alignItems: 'center',
        }}
      >
        <Reveal delay={100}>
          <Text
            style={{
              color: palette.text,
              fontSize: 36,
              fontWeight: '700',
              lineHeight: 45,
              textAlign: 'center',
              marginTop: 24,
            }}
          >
            Bridging Mechatronics &amp; Code:
          </Text>
        </Reveal>
        <Reveal delay={200}>
          <GradientHeading palette={palette} />
        </Reveal>
        <Reveal delay={300}>
          <Text
            style={{
              color: palette.mutedText,
              fontSize: 16,
              lineHeight: 26,
              textAlign: 'center',
              maxWidth: 576,
              marginTop: 24,
            }}
          >
            {PARAGRAPH}
          </Text>
        </Reveal>
        <Reveal delay={400}>
          <Text
            style={{
              color: palette.mutedText,
              fontFamily: fontFamily.mono,
              fontSize: 14,
              letterSpacing: 0.7,
              textAlign: 'center',
              marginTop: 24,
            }}
          >
            {capabilities.join('  /  ')}
          </Text>
        </Reveal>
        <Reveal delay={500} style={{ alignSelf: 'stretch' }}>
          <View style={{ marginTop: 36, gap: 12 }}>
            {/* Gradient CTA — px-8 py-6 text-base = 72px tall, rounded-4xl (26). */}
            <PressableScale onPress={() => onNavigate('contact')} style={{ width: '100%' }}>
              <LinearGradientBridge palette={palette}>
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: '600',
                    paddingVertical: 24,
                    paddingHorizontal: 32,
                    textAlign: 'center',
                  }}
                >
                  Start a Project
                </Text>
              </LinearGradientBridge>
            </PressableScale>
            {/* Outline CTA — web outline variant: border-primary bg-background. */}
            <PressableScale
              onPress={() => onNavigate('projects')}
              style={{
                width: '100%',
                borderRadius: 26,
                borderWidth: 1,
                borderColor: palette.primary,
                backgroundColor:
                  palette.background === '#ffffff' ? '#ffffff' : 'transparent',
                overflow: 'hidden',
              }}
            >
              <Text
                style={{
                  color: palette.primary,
                  fontSize: 16,
                  fontWeight: '600',
                  paddingVertical: 24,
                  paddingHorizontal: 32,
                  textAlign: 'center',
                }}
              >
                View My Work
              </Text>
            </PressableScale>
          </View>
          <View
            style={{
              marginTop: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
            }}
          >
            <TextLink
              palette={palette}
              onPress={onDownloadCv}
              icon={<FileDown size={16} color={palette.mutedText} />}
            >
              Download CV
            </TextLink>
            <View style={{ height: 12, width: 1, backgroundColor: palette.border }} />
            <TextLink
              palette={palette}
              onPress={onViewCv}
              icon={<FileText size={16} color={palette.mutedText} />}
            >
              View CV
            </TextLink>
          </View>
        </Reveal>
      </View>

      <BouncingChevron palette={palette} onPress={() => onNavigate('workflow')} />
    </View>
  );
}

function LinearGradientBridge({
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
      style={{
        borderRadius: 26,
        overflow: 'hidden',
        shadowColor: palette.primary,
        shadowOpacity: 0.4,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
      }}
    >
      {children}
    </LinearGradient>
  );
}

/** Auto-height gradient-clipped H2: an invisible twin Text sizes the container and
 * the gradient fills it absolutely — fixes the old fixed-96px MaskedView bug. */
function GradientHeading({ palette }: { palette: ReturnType<typeof usePalette> }) {
  const headingStyle = {
    fontSize: 36,
    fontWeight: '700' as const,
    lineHeight: 45,
    textAlign: 'center' as const,
    marginTop: 8,
  };
  return (
    <MaskedView
      maskElement={
        <Text style={[headingStyle, { backgroundColor: 'transparent', color: '#000000' }]}>
          {H2_TEXT}
        </Text>
      }
    >
      <View>
        <Text style={[headingStyle, { color: 'transparent', opacity: 0 }]}>
          {H2_TEXT}
        </Text>
        <LinearFill colors={palette.gradient} />
      </View>
    </MaskedView>
  );
}

function LinearFill({ colors }: { colors: readonly [string, string] }) {
  return (
    <LinearGradient
      colors={colors as unknown as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
  );
}

function TextLink({
  children,
  onPress,
  icon,
  palette,
}: {
  children: ReactNode;
  onPress: () => void;
  icon: ReactNode;
  palette: ReturnType<typeof usePalette>;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      hitSlop={8}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      {icon}
      <Text style={{ color: palette.mutedText, fontSize: 14, fontWeight: '500' }}>
        {children}
      </Text>
    </Pressable>
  );
}

/** Web motion-safe:animate-bounce — UI-thread loop, disabled under reduced motion. */
function BouncingChevron({
  palette,
  onPress,
}: {
  palette: ReturnType<typeof usePalette>;
  onPress: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const bounce = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    bounce.set(
      withRepeat(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      )
    );
  }, [reducedMotion, bounce]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: 6 * bounce.get() }],
  }));

  return (
    <Animated.View
      pointerEvents="box-none"
      style={{ position: 'absolute', bottom: 32, left: 0, right: 0, alignItems: 'center' }}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Scroll to workflow"
        hitSlop={12}
      >
        <Animated.View style={animatedStyle}>
          <ChevronDown size={24} color={palette.mutedText} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default Hero;
