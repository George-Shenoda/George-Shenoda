import { Text, View } from 'react-native';
import { CalendarCheck, FileText, KeyRound } from 'lucide-react-native';
import { projects } from '@portfolio/shared';
import Card from './Card';
import Reveal from './Reveal';
import { fontFamily } from '../fonts';
import { usePalette } from '../theme-mode';

const stats = [
  { value: `${projects.length}+`, label: 'Projects delivered' },
  { value: '24h', label: 'Response time' },
  { value: '100%', label: 'Code ownership, yours' },
];

const cards = [
  {
    icon: CalendarCheck,
    tint: 'secondary' as const,
    title: 'Free intro call',
    description:
      'Walk me through your idea and constraints. You get an honest feasibility read and a rough estimate before any commitment — no pressure, no obligation.',
    delay: 0,
  },
  {
    icon: FileText,
    tint: 'primary' as const,
    title: 'Fixed-scope quotes',
    description:
      'Every project begins with a written scope: deliverables, timeline, and price agreed upfront. If something changes, you hear it from me first — never on an invoice.',
    delay: 150,
  },
  {
    icon: KeyRound,
    tint: 'secondary' as const,
    title: 'Full handoff, no lock-in',
    description:
      "You own the code from day one. Documented repositories, credentials handed over, and a walkthrough session so your team can run and extend it without me.",
    delay: 300,
  },
];

/** Raw-background trust strip between the banded sections (web section order parity). */
function TrustSection() {
  const palette = usePalette();

  return (
    <View
      style={{
        backgroundColor: palette.background,
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
          A Low-Risk Way to Start
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
          Hiring a developer is a leap of trust. Here is how I make sure you are
          never guessing about cost, progress, or ownership.
        </Text>
      </Reveal>

      <Reveal delay={150}>
        <View
          style={{
            marginTop: 48,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            columnGap: 56,
            rowGap: 32,
          }}
        >
          {stats.map(({ value, label }) => (
            <View key={label} style={{ alignItems: 'center', gap: 4 }}>
              <Text
                style={{
                  color: palette.primary,
                  fontFamily: fontFamily.mono,
                  fontSize: 36,
                  fontWeight: '700',
                  fontVariant: ['tabular-nums'],
                }}
              >
                {value}
              </Text>
              <Text
                style={{ color: palette.mutedText, fontSize: 16, fontWeight: '500' }}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>
      </Reveal>

      <View style={{ marginTop: 56, gap: 24 }}>
        {cards.map(({ icon, tint, title, description, delay }) => (
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

export default TrustSection;
