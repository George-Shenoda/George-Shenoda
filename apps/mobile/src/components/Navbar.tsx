import { useState, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Keyframe,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Menu, Moon, Sun } from 'lucide-react-native';
import { usePalette, useThemeMode, type ThemePreference } from '../theme-mode';
import { useScroll, type Section } from '../scroll';

type NavbarProps = {
  onNavigate: (section: Section) => void;
  onScrollTop: () => void;
};

const NAV_LINKS: Array<{ id: Section; label: string }> = [
  { id: 'workflow', label: 'Workflow' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

const THEME_OPTIONS: Array<{ id: ThemePreference; label: string }> = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' },
];

/** Web's 100ms fade-zoom-drop dropdown entrance. */
const menuEntering = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 0.95 }, { translateY: -6 }] },
  100: { opacity: 1, transform: [{ scale: 1 }, { translateY: 0 }] },
}).duration(100);

function Navbar({ onNavigate, onScrollTop }: NavbarProps) {
  const palette = usePalette();
  const { scheme, preference, setPreference } = useThemeMode();
  const { scrollY, viewportHeight, contentHeight, activeSection } = useScroll();
  const insets = useSafeAreaInsets();

  const [openMenu, setOpenMenu] = useState<'nav' | 'theme' | null>(null);
  const [barHeight, setBarHeight] = useState(0);

  // Scroll shadow: web toggles shadow-md past 8px with a 300ms transition.
  // Crossfading a static gradient layer keeps elevation out of the animation.
  const shadowOpacity = useSharedValue(0);
  useAnimatedReaction(
    () => scrollY.get() > 8,
    (scrolled) => {
      shadowOpacity.set(withTiming(scrolled ? 1 : 0, { duration: 300 }));
    }
  );
  const shadowStyle = useAnimatedStyle(() => ({ opacity: shadowOpacity.get() }));

  // Progress fill: width animates on the UI thread; the node is absolutely
  // positioned and childless, so layout cost per frame is negligible.
  const progressStyle = useAnimatedStyle(() => {
    const max = contentHeight - viewportHeight;
    const t = max > 0 ? Math.min(1, Math.max(0, scrollY.get() / max)) : 0;
    return { width: `${t * 100}%` };
  });

  const closeMenu = () => setOpenMenu(null);

  return (
    <View>
      <BlurView
        style={StyleSheet.absoluteFill}
        intensity={40}
        tint={scheme === 'dark' ? 'dark' : 'light'}
        pointerEvents="none"
      />
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: palette.navbarBg }]}
        pointerEvents="none"
      />

      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            top: insets.top + barHeight,
            height: 10,
          },
          shadowStyle,
        ]}
      >
        <LinearGradient
          colors={
            scheme === 'dark'
              ? ['rgba(0, 0, 0, 0.35)', 'rgba(0, 0, 0, 0)']
              : ['rgba(0, 0, 0, 0.08)', 'rgba(0, 0, 0, 0)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={{ paddingTop: insets.top }}>
        <View
          onLayout={(e) => setBarHeight(e.nativeEvent.layout.height)}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Pressable onPress={onScrollTop} hitSlop={8} accessibilityRole="button">
            <Text
              style={{ color: palette.primary, fontSize: 20, fontWeight: '700' }}
            >
              George Shenoda
            </Text>
          </Pressable>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <IconTriggerButton
              onPress={() => setOpenMenu(openMenu === 'theme' ? null : 'theme')}
              accessibilityLabel="Toggle theme"
            >
              {scheme === 'dark' ? (
                <Moon size={19} color={palette.text} />
              ) : (
                <Sun size={19} color={palette.text} />
              )}
            </IconTriggerButton>
            <IconTriggerButton
              onPress={() => setOpenMenu(openMenu === 'nav' ? null : 'nav')}
              accessibilityLabel="Open navigation menu"
            >
              <Menu size={20} color={palette.text} />
            </IconTriggerButton>
          </View>
        </View>

        <View style={{ height: 2 }}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                overflow: 'hidden',
                borderRadius: 1,
              },
              progressStyle,
            ]}
          >
            <LinearGradient
              colors={[palette.primary, palette.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
      </View>

      <Modal
        transparent
        visible={openMenu !== null}
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeMenu}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={closeMenu}
          accessibilityLabel="Dismiss menu"
        >
          <View
            style={{
              flex: 1,
              alignItems: 'flex-end',
              paddingRight: 16,
            }}
          >
            <Animated.View
              entering={menuEntering}
              style={{
                position: 'absolute',
                top: insets.top + barHeight + 16 + 4,
                right: 16,
                minWidth: 176,
                borderRadius: 22,
                padding: 6,
                backgroundColor: palette.popover,
                borderWidth: 1,
                borderColor: palette.cardBorder,
                shadowColor: '#000000',
                shadowOpacity: 0.15,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
                elevation: 8,
              }}
            >
              {openMenu === 'theme'
                ? THEME_OPTIONS.map(({ id, label }) => (
                    <MenuItem
                      key={id}
                      label={label}
                      active={preference === id}
                      palette={palette}
                      onPress={() => {
                        setPreference(id);
                        closeMenu();
                      }}
                    />
                  ))
                : NAV_LINKS.map(({ id, label }) => (
                    <MenuItem
                      key={id}
                      label={label}
                      active={activeSection === id}
                      palette={palette}
                      onPress={() => {
                        onNavigate(id);
                        closeMenu();
                      }}
                    />
                  ))}
            </Animated.View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function IconTriggerButton({
  children,
  onPress,
  accessibilityLabel,
}: {
  children: ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  const palette = usePalette();
  const { scheme } = useThemeMode();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: 26,
        borderWidth: 1,
        borderColor: palette.primary,
        backgroundColor:
          scheme === 'light' ? palette.background : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {children}
    </Pressable>
  );
}

function MenuItem({
  label,
  active,
  onPress,
  palette,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  palette: ReturnType<typeof usePalette>;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="menuitem"
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 14,
        backgroundColor: pressed ? palette.accent : 'transparent',
      })}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: active ? '600' : '400',
          color: active ? palette.primary : palette.text,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default Navbar;
