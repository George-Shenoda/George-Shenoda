import { Dimensions, FlatList, Text, View } from 'react-native';
import Reveal from './Reveal';
import type { Palette } from '../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.78, 320);
const CARD_GAP = 16;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;
const EDGE_INSET = Math.max((SCREEN_WIDTH - CARD_WIDTH) / 2, 24);

const steps = [
  {
    title: '1. Discovery',
    description:
      'Deep dive into your business workflows. Defining core application logic, data constraints, and identifying opportunities for digital automation.',
    accent: 'tertiary' as const,
  },
  {
    title: '2. Architecture',
    description:
      'Structuring scalable database models (like MongoDB) and mapping out secure API routes. Selecting the optimal modern stack (Next.js, Node.js) for high performance.',
    accent: 'secondary' as const,
  },
  {
    title: '3. Development',
    description:
      'Building modular, responsive UI components with Tailwind CSS and TypeScript. Writing clean, maintainable backend code focused on seamless state management.',
    accent: 'tertiary' as const,
  },
  {
    title: '4. Launch',
    description:
      'Deploying optimized builds to production. Setting up continuous integration, performance monitoring, and ensuring a smooth, fully-documented handoff.',
    accent: 'secondary' as const,
  },
];

function StepCard({ step, index, palette }: { step: (typeof steps)[number]; index: number; palette: Palette }) {
  return (
    <View
      style={{
        width: CARD_WIDTH,
        backgroundColor: palette.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: palette.border,
        padding: 20,
        gap: 10,
      }}
    >
      <View
        style={{
          alignSelf: 'flex-start',
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor:
            step.accent === 'tertiary'
              ? `${palette.tertiary}1A`
              : `${palette.secondary}1A`,
        }}
      >
        <Text style={{ color: palette[step.accent], fontSize: 11 }}>
          Step {index + 1} of {steps.length}
        </Text>
      </View>
      <Text style={{ color: palette.text, fontSize: 18, fontWeight: '700' }}>
        {step.title}
      </Text>
      <Text style={{ color: palette.mutedText, fontSize: 13, lineHeight: 20 }}>
        {step.description}
      </Text>
    </View>
  );
}

function WorkflowCarousel({ palette }: { palette: Palette }) {
  return (
    <View style={{ backgroundColor: palette.section, paddingVertical: 64 }}>
      <Reveal>
        <Text
          style={{
            color: palette.text,
            fontSize: 28,
            fontWeight: '700',
            textAlign: 'center',
          }}
        >
          Concept to Deployment
        </Text>
      </Reveal>
      <Reveal delay={100}>
        <Text
          style={{
            color: palette.mutedText,
            fontSize: 13,
            lineHeight: 20,
            textAlign: 'center',
            marginHorizontal: 32,
            marginTop: 12,
          }}
        >
          Applying engineering precision to full-stack development. A
          structured, independent workflow designed to build scalable web
          applications and automate complex business processes.
        </Text>
      </Reveal>
      <Reveal delay={200}>
        <FlatList
          data={steps}
          keyExtractor={(item) => item.title}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={SNAP_INTERVAL}
          snapToAlignment="start"
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: EDGE_INSET }}
          style={{ marginTop: 32, flexGrow: 0 }}
          renderItem={({ item, index }) => (
            <StepCard step={item} index={index} palette={palette} />
          )}
        />
      </Reveal>
    </View>
  );
}

export default WorkflowCarousel;
