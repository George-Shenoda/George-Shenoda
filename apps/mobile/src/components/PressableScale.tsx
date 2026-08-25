import type { ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type PressableScaleProps = {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  hitSlop?: number | { top?: number; bottom?: number; left?: number; right?: number };
  accessibilityLabel?: string;
};

/** Web's active:scale-[0.98] press vocabulary. Scale runs on the UI thread and
 * interrupts cleanly mid-flight; reduced motion leaves it static. */
function PressableScale({
  children,
  onPress,
  disabled,
  style,
  hitSlop,
  accessibilityLabel,
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() =>
        scale.set(withTiming(0.97, { duration: 120, easing: Easing.out(Easing.cubic) }))
      }
      onPressOut={() =>
        scale.set(withTiming(1, { duration: 120, easing: Easing.out(Easing.cubic) }))
      }
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}

export default PressableScale;
