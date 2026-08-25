import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
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
import Workflow from './src/components/Workflow';
import BusinessSection from './src/components/BusinessSection';
import ProjectsSection from './src/components/ProjectsSection';
import TrustSection from './src/components/TrustSection';
import ContactForm from './src/components/ContactForm';
import Navbar from './src/components/Navbar';
import Footer from './src/components/Footer';
import CVSheet from './src/components/CVSheet';
import { ScrollProvider, useScroll, type Section } from './src/scroll';
import { ThemeModeProvider, usePalette, useThemeMode } from './src/theme-mode';

SplashScreen.preventAutoHideAsync().catch(() => {});

/** Web sections get scroll-margin-top: 5rem; mirror that when jumping. */
const SCROLL_MARGIN = 80;

function PortfolioApp() {
  const palette = usePalette();
  const { scheme } = useThemeMode();
  const { onScroll, trackSection, getSectionTop, setContentHeight } = useScroll();

  const scrollRef = useRef<ScrollView>(null);

  const navigate = useCallback(
    (section: Section) => {
      const top = getSectionTop(section);
      if (top != null && scrollRef.current) {
        scrollRef.current.scrollTo({ y: Math.max(0, top - SCROLL_MARGIN), animated: true });
      }
    },
    [getSectionTop]
  );

  const scrollTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  // Step 14: both hero CV affordances open the offline CV sheet.
  const [cvOpen, setCvOpen] = useState(false);
  const openCv = useCallback(() => setCvOpen(true), []);
  const closeCv = useCallback(() => setCvOpen(false), []);

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={scheme === 'light' ? 'dark' : 'light'} />
      <Navbar onNavigate={navigate} onScrollTop={scrollTop} />
      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        onContentSizeChange={setContentHeight}
        scrollEventThrottle={16}
      >
        <Hero
          onNavigate={navigate}
          onDownloadCv={openCv}
          onViewCv={openCv}
        />
        <View onLayout={trackSection('workflow')}>
          <Workflow />
        </View>
        <BusinessSection />
        <View onLayout={trackSection('projects')}>
          <ProjectsSection />
        </View>
        <TrustSection />
        <View onLayout={trackSection('contact')}>
          <ContactForm />
        </View>
        <Footer onNavigate={navigate} />
      </ScrollView>
      <CVSheet visible={cvOpen} onClose={closeCv} />
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
  const [monoLoaded] = useMonoFonts({ JetBrainsMono_400Regular });
  const ready = interLoaded && monoLoaded;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ThemeModeProvider>
        <ScrollProvider>
          <PortfolioApp />
        </ScrollProvider>
      </ThemeModeProvider>
    </SafeAreaProvider>
  );
}
