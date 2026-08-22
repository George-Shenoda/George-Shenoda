import { useCallback, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, useColorScheme, View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import Hero from './src/components/Hero';
import WorkflowCarousel from './src/components/WorkflowCarousel';
import BusinessSection from './src/components/BusinessSection';
import ProjectsSection from './src/components/ProjectsSection';
import ContactForm from './src/components/ContactForm';
import Navbar, { type Section } from './src/components/Navbar';
import Footer from './src/components/Footer';
import { usePalette } from './src/theme';

export default function App() {
  const colorScheme = useColorScheme();
  const palette = usePalette(colorScheme);

  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<Partial<Record<Section, number>>>({});

  const trackSection = (section: Section) => (e: LayoutChangeEvent) => {
    sectionY.current[section] = e.nativeEvent.layout.y;
  };

  const navigate = useCallback((section: Section) => {
    const y = sectionY.current[section];
    if (y != null && scrollRef.current) {
      scrollRef.current.scrollTo({ y, animated: true });
    }
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={colorScheme === 'light' ? 'dark' : 'light'} />
      <Navbar palette={palette} onNavigate={navigate} />
      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 0 }}>
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
