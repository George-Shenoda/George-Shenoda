import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, useColorScheme, View } from 'react-native';
import Hero from './src/components/Hero';
import WorkflowCarousel from './src/components/WorkflowCarousel';
import BusinessSection from './src/components/BusinessSection';
import ProjectsSection from './src/components/ProjectsSection';
import ContactForm from './src/components/ContactForm';
import { usePalette } from './src/theme';

export default function App() {
  const colorScheme = useColorScheme();
  const palette = usePalette(colorScheme);

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={colorScheme === 'light' ? 'dark' : 'light'} />
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        <Hero palette={palette} />
        <WorkflowCarousel palette={palette} />
        <BusinessSection palette={palette} />
        <ProjectsSection palette={palette} />
        <ContactForm palette={palette} />
        <Text
          style={{
            color: palette.mutedText,
            fontSize: 12,
            textAlign: 'center',
            paddingVertical: 24,
          }}
        >
          © {new Date().getFullYear()} George Shenoda
        </Text>
      </ScrollView>
    </View>
  );
}
