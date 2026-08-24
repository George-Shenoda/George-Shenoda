import { useCallback, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ScrollView, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  useFonts as useMonoFonts,
  JetBrainsMono_400Regular,
} from '@expo-google-fonts/jetbrains-mono';
import Hero from './src/components/Hero';
import WorkflowCarousel from './src/components/WorkflowCarousel';
import BusinessSection from './src/components/BusinessSection';
import ProjectsSection from './src/components/ProjectsSection';
import ContactForm from './src/components/ContactForm';
import Navbar from './src/components/Navbar';
import Footer from './src/components/Footer';
import { ScrollProvider, useScroll, type Section } from './src/scroll';
import { usePalette } from './src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function PortfolioApp() {
  const colorScheme = useColorScheme();
  const palette = usePalette(colorScheme);
  const { onScroll, trackSection, getSectionTop } = useScroll();

  const scrollRef = useRef<ScrollView>(null);

  const navigate = useCallback(
    (section: Section) => {
      const y = getSectionTop(section);
      if (y != null && scrollRef.current) {
        scrollRef.current.scrollTo({ y, animated: true });
      }
    },
    [getSectionTop]
  );

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={colorScheme === 'light' ? 'dark' : 'light'} />
      <Navbar palette={palette} onNavigate={navigate} />
      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 0 }}
      >
        <Hero palette={palette} onNavigate={navigate} />
        <View onLayout={trackSection('workflow')}>
          <WorkflowCarousel palette={palette} />
        </View>
        <BusinessSection palette={palette} />
        <View onLayout={trackSection('projects')}>
          <ProjectsSection palette={palette} />
        </View>
        <View onLayout={trackSection('contact')}>
          <ContactForm palette={palette} />
        </View>
        <Footer palette={palette} />
      </ScrollView>
    </View>
  );
}

export default function App() {
  const [interLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [monoLoaded] = useFonts({ JetBrainsMono_400Regular });
  const ready = interLoaded && monoLoaded;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ScrollProvider>
        <PortfolioApp />
      </ScrollProvider>
    </SafeAreaProvider>
  );
}
