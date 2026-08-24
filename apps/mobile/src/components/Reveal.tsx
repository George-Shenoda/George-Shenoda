import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useScroll } from '../scroll';

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

/** Web Reveal vocabulary: FadeInUp 16px→0, 700ms ease-out cubic, fires once when the
 * node is 40px above the fold. Runs entirely on the UI thread; reduced motion renders
 * statically. */
function Reveal({ children, delay = 0, style }: RevealProps) {
  const reducedMotion = useReducedMotion();
  const { scrollY, viewportHeight } = useScroll();
  const layoutY = useSharedValue(Number.POSITIVE_INFINITY);
  const progress = useSharedValue(0);
  const started = useSharedValue(false);

  const maybeStart = () => {
    'worklet';
    if (started.get()) return;
    if (layoutY.get() <= scrollY.get() + viewportHeight - 40) {
      started.set(true);
      progress.set(
        withDelay(
          delay,
          withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) })
        )
      );
    }
  };

  useAnimatedReaction(() => scrollY.get(), () => maybeStart());
  useAnimatedReaction(() => layoutY.get(), () => maybeStart());

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ translateY: 16 * (1 - progress.get()) }],
  }));

  if (reducedMotion) {
    return <View style={style}>{children}</View>;
  }

  return (
    <Animated.View
      style={[style, animatedStyle]}
      onLayout={(e) => {
        layoutY.set(e.nativeEvent.layout.y);
      }}
    >
      {children}
    </Animated.View>
  );
}

export default Reveal;
