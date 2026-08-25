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
import PrivacySheet from './src/components/PrivacySheet';
import { ScrollProvider, useScroll, type Section } from './src/scroll';
import { ThemeModeProvider, usePalette, useThemeMode } from './src/theme-mode';
import { initAnalytics, logScreen } from './src/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { projects as bundledProjects, type Project } from '@portfolio/shared';
import { SITE_URL } from './src/config';

SplashScreen.preventAutoHideAsync().catch(() => {});

const CACHE_KEY = 'projects-cache-v1';

type ProjectsCache = {
  savedAt: number;
  projects: Project[];
};

function PortfolioApp() {
  const palette = usePalette();
  const { scheme } = useThemeMode();
  const { onScroll, trackSection, getSectionTop, setContentHeight, activeSection } =
    useScroll();

  const scrollRef = useRef<ScrollView>(null);

  // Firebase Analytics: app open + section-level screen views (best-effort).
  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    logScreen(activeSection);
  }, [activeSection]);

  // Projects state shared with TrustSection for live badge count
  const [projects, setProjects] = useState<Project[]>(bundledProjects);
  const [cachedAt, setCachedAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        if (raw && !cancelled) {
          const parsed: unknown = JSON.parse(raw);
          const cache = parsed as Partial<ProjectsCache> | null;
          if (
            cache &&
            Array.isArray(cache.projects) &&
            cache.projects.length > 0 &&
            typeof cache.savedAt === 'number'
          ) {
            setProjects(cache.projects);
            setCachedAt(cache.savedAt);
          }
        }
      } catch {}

      try {
        const res = await fetch(`${SITE_URL}/api/projects`);
        if (!res.ok || cancelled) return;
        const data: unknown = await res.json();
        if (!Array.isArray(data) || data.length === 0 || cancelled) return;
        setProjects(data as Project[]);
        setCachedAt(null);
        const nextCache: ProjectsCache = {
          savedAt: Date.now(),
          projects: data as Project[],
        };
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify(nextCache)).catch(() => {});
      } catch {}
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const navigate = useCallback(
    (section: Section) => {
      const top = getSectionTop(section);
      if (top != null && scrollRef.current) {
        // Account for sticky navbar height (insets.top + 78px content) + safe area
        // Navbar is ~137px on notched iPhones (59px insets + 78px); use 140 for buffer
        const navbarOffset = 140;
        scrollRef.current.scrollTo({ y: Math.max(0, top - navbarOffset), animated: true });
      } else if (scrollRef.current) {
        // Fallback: approximate section positions from layout analysis
        // Hero ~880, Workflow ~2462, BusinessSection ~2908, ProjectsSection ~5440, TrustSection ~6880, ContactForm ~7516
        const fallbackTops: Record<Section, number> = {
          workflow: 960,
          projects: 2990,
          contact: 6960,
        };
        const navbarOffset = 140;
        scrollRef.current.scrollTo({ y: Math.max(0, fallbackTops[section] - navbarOffset), animated: true });
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

  // Privacy sheet state
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const openPrivacy = useCallback(() => setPrivacyOpen(true), []);
  const closePrivacy = useCallback(() => setPrivacyOpen(false), []);

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={scheme === 'light' ? 'dark' : 'light'} />
      <Navbar onNavigate={navigate} onScrollTop={scrollTop} onHome={scrollTop} />
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
          <ProjectsSection projects={projects} cachedAt={cachedAt} />
        </View>
        <TrustSection projectsCount={projects.length} />
        <View onLayout={trackSection('contact')}>
          <ContactForm />
        </View>
        <Footer onNavigate={navigate} onNavigateToPrivacy={openPrivacy} />
      </ScrollView>
      <CVSheet visible={cvOpen} onClose={closeCv} />
      <PrivacySheet visible={privacyOpen} onClose={closePrivacy} />
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