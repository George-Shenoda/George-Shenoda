import { Children } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown, Easing } from 'react-native-reanimated';

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

function Reveal({ children, delay = 0, style }: RevealProps) {
  return (
    <Animated.View
      style={style}
      entering={FadeInDown.duration(700)
        .easing(Easing.out(Easing.cubic))
        .delay(delay)}
    >
      {children}
    </Animated.View>
  );
}

export default Reveal;

export function Stagger({
  children,
  step = 100,
  style,
}: {
  children: React.ReactNode;
  step?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const items = Children.toArray(children);
  return (
    <View style={style}>
      {items.map((child, index) => (
        <Reveal key={index} delay={(index + 1) * step}>
          {child}
        </Reveal>
      ))}
    </View>
  );
}
