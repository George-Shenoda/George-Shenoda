import type { ComponentType } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Reveal from './Reveal';
import { usePalette } from '../theme-mode';

type IconComponent = ComponentType<{ size?: number; color?: string }>;

type CardProps = {
  icon: IconComponent;
  /** Tile accent family, mirroring web iconClassName tints. */
  tint: 'primary' | 'secondary';
  title: string;
  description: string;
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

/** Web Cards.tsx at <768px truth: p-6 rounded-xl gap-4, p-4 rounded-2xl tinted
 * icon tile, xl bold title, base muted description. Hover lifts dropped (no hover). */
function Card({ icon: Icon, tint, title, description, delay = 0, style }: CardProps) {
  const palette = usePalette();

  const tileColor =
    tint === 'primary'
      ? { bg: `${palette.tertiary}1A`, fg: palette.primary, ring: `${palette.tertiary}33` }
      : { bg: `${palette.secondary}1A`, fg: palette.secondary, ring: `${palette.secondary}33` };

  return (
    <Reveal delay={delay} style={style}>
      <View
        style={{
          padding: 24,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: palette.cardBorder,
          backgroundColor: palette.card,
          gap: 16,
          shadowColor: '#000000',
          shadowOpacity: 0.05,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        }}
      >
        <View
          style={{
            alignSelf: 'flex-start',
            padding: 16,
            borderRadius: 18,
            backgroundColor: tileColor.bg,
            borderWidth: 1,
            borderColor: tileColor.ring,
          }}
        >
          <Icon size={24} color={tileColor.fg} />
        </View>
        <View style={{ gap: 8 }}>
          <Text style={{ color: palette.text, fontSize: 20, fontWeight: '700' }}>
            {title}
          </Text>
          <Text style={{ color: palette.mutedText, fontSize: 16, lineHeight: 26 }}>
            {description}
          </Text>
        </View>
      </View>
    </Reveal>
  );
}

export default Card;
