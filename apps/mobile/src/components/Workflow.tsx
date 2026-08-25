import { View, Text } from 'react-native';
import {
  Code,
  DraftingCompass,
  Lightbulb,
  Rocket,
} from 'lucide-react-native';
import Card from './Card';
import Reveal from './Reveal';
import { usePalette } from '../theme-mode';

const steps = [
  {
    title: '1. Discovery',
    description:
      'Deep dive into your business workflows. Defining core application logic, data constraints, and identifying opportunities for digital automation.',
    icon: Lightbulb,
    tint: 'primary' as const,
    delay: 0,
  },
  {
    title: '2. Architecture',
    description:
      'Structuring scalable database models (like MongoDB) and mapping out secure API routes. Selecting the optimal modern stack (Next.js, Node.js) for high performance.',
    icon: DraftingCompass,
    tint: 'secondary' as const,
    delay: 150,
  },
  {
    title: '3. Development',
    description:
      'Building modular, responsive UI components with Tailwind CSS and TypeScript. Writing clean, maintainable backend code focused on seamless state management.',
    icon: Code,
    tint: 'primary' as const,
    delay: 300,
  },
  {
    title: '4. Launch',
    description:
      'Deploying optimized builds to production. Setting up continuous integration, performance monitoring, and ensuring a smooth, fully-documented handoff.',
    icon: Rocket,
    tint: 'secondary' as const,
    delay: 500,
  },
];

function Workflow() {
  const palette = usePalette();

  return (
    <View
      style={{
        backgroundColor: palette.band,
        paddingTop: 80,
        paddingBottom: 80,
        paddingHorizontal: 16,
      }}
    >
      <Reveal>
        <Text
          style={{
            color: palette.text,
            fontSize: 30,
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          Concept to Deployment
        </Text>
      </Reveal>
      <Reveal delay={100}>
        <Text
          style={{
            color: palette.mutedText,
            fontSize: 16,
            lineHeight: 26,
            textAlign: 'center',
            maxWidth: 576,
            alignSelf: 'center',
          }}
        >
          Applying engineering precision to full-stack development. A structured,
          independent workflow designed to build scalable web applications and
          automate complex business processes.
        </Text>
      </Reveal>
      <View style={{ marginTop: 40, gap: 32 }}>
        {steps.map(({ title, description, icon, tint, delay }) => (
          <Card
            key={title}
            icon={icon}
            tint={tint}
            title={title}
            description={description}
            delay={delay}
          />
        ))}
      </View>
    </View>
  );
}

export default Workflow;
