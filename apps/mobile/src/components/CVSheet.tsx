import { useState, type ReactNode } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { cv } from '@portfolio/shared';
import PressableScale from './PressableScale';
import { shareResumePdf } from '../cv-pdf';
import { fontFamily } from '../fonts';
import { usePalette } from '../theme-mode';

type CVSheetProps = {
  visible: boolean;
  onClose: () => void;
};

/**
 * Paper-surface CV document rendered from the shared cv data. Colors adapt
 * to the app's active theme (light/dark), mirroring the web /cv page.
 * Fully offline: data is bundled via @portfolio/shared and "Save PDF" shares
 * the bundled resume.pdf through the OS share sheet.
 */
function CVSheet({ visible, onClose }: CVSheetProps) {
  const insets = useSafeAreaInsets();
  const [saving, setSaving] = useState(false);
  const palette = usePalette();

  const { profile, links, summary, experience, education, projects, skillGroups, certifications, languages } = cv;

  async function handleSavePdf() {
    if (saving) return;
    setSaving(true);
    try {
      await shareResumePdf();
    } catch {
      // Share sheet unavailable/cancelled — nothing to surface in the document.
    } finally {
      setSaving(false);
    }
  }

  function openUrl(url: string) {
    Linking.openURL(url).catch(() => {});
  }

  const isLight = palette.background === '#ffffff';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} />
      <View style={[styles.backdrop, { paddingTop: insets.top, backgroundColor: palette.band }]}>
        <View style={[styles.topBar, { backgroundColor: palette.background, borderBottomColor: palette.cardBorder }]}>
          <Text style={[styles.sectionLabel, { marginBottom: 0, color: palette.primary }]}>Curriculum Vitae</Text>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close CV"
            hitSlop={8}
            style={({ pressed }) => [
              styles.closeButton,
              { opacity: pressed ? 0.6 : 1, backgroundColor: palette.accent },
            ]}
          >
            <X size={22} color={palette.text} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.sheet,
            { paddingBottom: insets.bottom + 24, backgroundColor: palette.card },
          ]}
        >
          <Text style={[styles.name, { color: palette.text }]}>{profile.name}</Text>
          <Text style={[styles.headline, { color: palette.primary }]}>{profile.headline}</Text>
          <View style={styles.metaRow}>
            <MetaText palette={palette}>{profile.location}</MetaText>
            <MetaDot palette={palette} />
            <MetaText palette={palette} onPress={() => openUrl(`mailto:${profile.email}`)}>
              {profile.email}
            </MetaText>
            {links.map(({ label, href }) => (
              <View key={label} style={styles.metaItem}>
                <MetaDot palette={palette} />
                <MetaText palette={palette} onPress={() => openUrl(href)}>{label}</MetaText>
              </View>
            ))}
          </View>

          <Text style={[styles.summary, { color: palette.text }]}>{summary}</Text>

          <SectionLabel palette={palette}>Experience</SectionLabel>
          <View style={{ gap: 20 }}>
            {experience.map((entry) => (
              <View key={`${entry.company}-${entry.period}`} style={{ gap: 6 }}>
                <View style={styles.rowBaseline}>
                  <Text style={[styles.entryTitle, { color: palette.text }]}>
                    {entry.role}
                    <Text style={[styles.entryCompany, { color: palette.mutedText }]}> — {entry.company}</Text>
                  </Text>
                  <Text style={[styles.period, { color: palette.mutedText }]}>{entry.period}</Text>
                </View>
                <View style={{ gap: 4 }}>
                  {entry.highlights.map((highlight) => (
                    <Bullet key={highlight} palette={palette}>{highlight}</Bullet>
                  ))}
                </View>
              </View>
            ))}
          </View>

          <SectionLabel palette={palette}>Selected Projects</SectionLabel>
          <View style={{ gap: 14 }}>
            {projects.map((project) => (
              <View key={project.id} style={{ gap: 2 }}>
                <View style={styles.rowBaseline}>
                  <Text style={[styles.projectTitle, { color: palette.text }]}>
                    {project.link ? (
                      <Text onPress={() => openUrl(project.link!)} style={{ color: palette.primary }}>
                        {project.name}
                      </Text>
                    ) : (
                      project.name
                    )}
                  </Text>
                  <Text style={[styles.techMono, { color: palette.mutedText }]}>{project.techstack.join(' · ')}</Text>
                </View>
                <Text style={[styles.body, { color: palette.text }]}>{project.description}</Text>
              </View>
            ))}
          </View>

          <SectionLabel palette={palette}>Education</SectionLabel>
          {education.map((entry) => (
            <View key={entry.degree} style={styles.rowBaseline}>
              <Text style={[styles.projectTitle, { color: palette.text }]}>
                {entry.degree}
                <Text style={[styles.entryCompany, { color: palette.mutedText }]}> — {entry.school}</Text>
              </Text>
              <Text style={[styles.period, { color: palette.mutedText }]}>{entry.period}</Text>
            </View>
          ))}

          <SectionLabel palette={palette}>Skills</SectionLabel>
          <View style={{ gap: 8 }}>
            {skillGroups.map((group) => (
              <View key={group.label} style={{ flexDirection: 'row', gap: 8 }}>
                <Text style={[styles.skillLabel, { color: palette.text }]}>{group.label}</Text>
                <Text style={[styles.body, { flex: 1, color: palette.text }]}>{group.items.join(', ')}</Text>
              </View>
            ))}
          </View>

          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <SectionLabel palette={palette}>Certifications</SectionLabel>
              <View style={{ gap: 6 }}>
                {certifications.map((certification) => (
                  <Text key={certification.title} style={styles.listItem}>
                    <Text style={[styles.semiBold, { color: palette.text }]}>{certification.title}</Text>
                    <Text style={[styles.meta, { color: palette.mutedText }]}> — {certification.issuer} {certification.year}</Text>
                  </Text>
                ))}
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <SectionLabel palette={palette}>Languages</SectionLabel>
              <View style={{ gap: 6 }}>
                {languages.map((language) => (
                  <Text key={language.name} style={styles.listItem}>
                    <Text style={[styles.semiBold, { color: palette.text }]}>{language.name}</Text>
                    <Text style={[styles.meta, { color: palette.mutedText }]}> — {language.level}</Text>
                  </Text>
                ))}
              </View>
            </View>
          </View>

          <View style={[styles.footerRule, { borderTopColor: palette.cardBorder }]} />
          <Text style={[styles.footer, { color: palette.mutedText }]}>
            {profile.name} — {profile.headline}.
          </Text>
        </ScrollView>

        <View
          style={[
            styles.actions,
            { paddingBottom: insets.bottom + 12, backgroundColor: palette.card, borderTopColor: palette.cardBorder },
          ]}
        >
          <PressableScale
            onPress={handleSavePdf}
            disabled={saving}
            accessibilityLabel="Save PDF"
            style={{
              opacity: saving ? 0.7 : 1,
              borderRadius: 14,
              overflow: 'hidden',
              backgroundColor: palette.text,
              paddingVertical: 16,
            }}
          >
            <Text
              style={{
                color: palette.background,
                fontSize: 15,
                fontWeight: '600',
                textAlign: 'center',
              }}
            >
              {saving ? 'Preparing PDF…' : 'Save PDF'}
            </Text>
          </PressableScale>
          <Pressable onPress={onClose} accessibilityRole="button" hitSlop={8}>
            <Text
              style={{
                color: palette.mutedText,
                fontSize: 14,
                fontWeight: '500',
                textAlign: 'center',
                paddingVertical: 10,
              }}
            >
              Close
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    flexGrow: 1,
    marginHorizontal: 12,
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  name: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headline: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    rowGap: 4,
    marginTop: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summary: {
    fontSize: 15,
    lineHeight: 23,
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    marginBottom: 12,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 1,
  },
  entryCompany: {
    fontWeight: '500',
  },
  projectTitle: {
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  techMono: {
    fontFamily: fontFamily.mono,
    fontSize: 12,
  },
  period: {
    fontFamily: fontFamily.mono,
    fontSize: 13,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
  },
  skillLabel: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    width: 128,
  },
  listItem: {
    fontSize: 14,
    lineHeight: 21,
  },
  semiBold: {
    fontWeight: '600',
  },
  meta: {},
  rowBaseline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    columnGap: 16,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 32,
    marginTop: 32,
  },
  footerRule: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 40,
    paddingTop: 12,
  },
  footer: {
    fontSize: 11,
  },
  actions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 4,
  },
});

function MetaText({ children, onPress, palette }: { children: ReactNode; onPress?: () => void; palette: ReturnType<typeof usePalette> }) {
  return (
    <Text onPress={onPress} style={{ color: palette.mutedText, fontSize: 13 }}>
      {children}
    </Text>
  );
}

function MetaDot({ palette }: { palette: ReturnType<typeof usePalette> }) {
  return (
    <Text style={{ color: palette.mutedText, fontSize: 13, marginHorizontal: 8 }}>·</Text>
  );
}

function SectionLabel({ children, palette }: { children: ReactNode; palette: ReturnType<typeof usePalette> }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 32,
        marginBottom: 12,
      }}
    >
      <Text style={[styles.sectionLabel, { color: palette.primary }]}>{children}</Text>
      <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: palette.cardBorder }} />
    </View>
  );
}

function Bullet({ children, palette }: { children: ReactNode; palette: ReturnType<typeof usePalette> }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, paddingLeft: 8 }}>
      <Text style={{ color: palette.text, fontSize: 14, lineHeight: 21 }}>•</Text>
      <Text style={[styles.body, { flex: 1, color: palette.text }]}>{children}</Text>
    </View>
  );
}

export default CVSheet;
