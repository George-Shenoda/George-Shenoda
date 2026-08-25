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

type CVSheetProps = {
  visible: boolean;
  onClose: () => void;
};

/**
 * Paper-surface CV document rendered from the shared cv data. Colors are fixed
 * (warm paper + near-black ink) regardless of the app's active theme, mirroring
 * the web /cv page. Fully offline: data is bundled via @portfolio/shared and
 * "Save PDF" shares the bundled resume.pdf through the OS share sheet.
 */
function CVSheet({ visible, onClose }: CVSheetProps) {
  const insets = useSafeAreaInsets();
  const [saving, setSaving] = useState(false);

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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="dark-content" />
      <View style={[styles.backdrop, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>Curriculum Vitae</Text>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close CV"
            hitSlop={8}
            style={({ pressed }) => [
              styles.closeButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <X size={22} color="#171717" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.sheet,
            { paddingBottom: insets.bottom + 24 },
          ]}
        >
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.headline}>{profile.headline}</Text>
          <View style={styles.metaRow}>
            <MetaText>{profile.location}</MetaText>
            <MetaDot />
            <MetaText onPress={() => openUrl(`mailto:${profile.email}`)}>
              {profile.email}
            </MetaText>
            {links.map(({ label, href }) => (
              <View key={label} style={styles.metaItem}>
                <MetaDot />
                <MetaText onPress={() => openUrl(href)}>{label}</MetaText>
              </View>
            ))}
          </View>

          <Text style={styles.summary}>{summary}</Text>

          <SectionLabel>Experience</SectionLabel>
          <View style={{ gap: 20 }}>
            {experience.map((entry) => (
              <View key={`${entry.company}-${entry.period}`} style={{ gap: 6 }}>
                <View style={styles.rowBaseline}>
                  <Text style={styles.entryTitle}>
                    {entry.role}
                    <Text style={styles.entryCompany}> — {entry.company}</Text>
                  </Text>
                  <Text style={styles.period}>{entry.period}</Text>
                </View>
                <View style={{ gap: 4 }}>
                  {entry.highlights.map((highlight) => (
                    <Bullet key={highlight}>{highlight}</Bullet>
                  ))}
                </View>
              </View>
            ))}
          </View>

          <SectionLabel>Selected Projects</SectionLabel>
          <View style={{ gap: 14 }}>
            {projects.map((project) => (
              <View key={project.id} style={{ gap: 2 }}>
                <View style={styles.rowBaseline}>
                  <Text style={styles.projectTitle}>
                    {project.link ? (
                      <Text onPress={() => openUrl(project.link!)}>
                        {project.name}
                      </Text>
                    ) : (
                      project.name
                    )}
                  </Text>
                  <Text style={styles.techMono}>{project.techstack.join(' · ')}</Text>
                </View>
                <Text style={styles.body}>{project.description}</Text>
              </View>
            ))}
          </View>

          <SectionLabel>Education</SectionLabel>
          {education.map((entry) => (
            <View key={entry.degree} style={styles.rowBaseline}>
              <Text style={styles.projectTitle}>
                {entry.degree}
                <Text style={styles.entryCompany}> — {entry.school}</Text>
              </Text>
              <Text style={styles.period}>{entry.period}</Text>
            </View>
          ))}

          <SectionLabel>Skills</SectionLabel>
          <View style={{ gap: 8 }}>
            {skillGroups.map((group) => (
              <View key={group.label} style={{ flexDirection: 'row', gap: 8 }}>
                <Text style={styles.skillLabel}>{group.label}</Text>
                <Text style={[styles.body, { flex: 1 }]}>{group.items.join(', ')}</Text>
              </View>
            ))}
          </View>

          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <SectionLabel>Certifications</SectionLabel>
              <View style={{ gap: 6 }}>
                {certifications.map((certification) => (
                  <Text key={certification.title} style={styles.listItem}>
                    <Text style={styles.semiBold}>{certification.title}</Text>
                    <Text style={styles.meta}> — {certification.issuer} {certification.year}</Text>
                  </Text>
                ))}
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <SectionLabel>Languages</SectionLabel>
              <View style={{ gap: 6 }}>
                {languages.map((language) => (
                  <Text key={language.name} style={styles.listItem}>
                    <Text style={styles.semiBold}>{language.name}</Text>
                    <Text style={styles.meta}> — {language.level}</Text>
                  </Text>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.footerRule} />
          <Text style={styles.footer}>
            {profile.name} — {profile.headline}.
          </Text>
        </ScrollView>

        <View
          style={[
            styles.actions,
            { paddingBottom: insets.bottom + 12 },
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
              backgroundColor: '#171717',
              paddingVertical: 16,
            }}
          >
            <Text
              style={{
                color: '#faf9f7',
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
                color: '#525252',
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

const ink = '#171717';
const mutedInk = '#525252';
const teal = '#0f7173';
const hairline = '#d6d3cb';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#e9e7e2',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: '#e2dfd9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    flexGrow: 1,
    backgroundColor: '#faf9f7',
    marginHorizontal: 12,
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  name: {
    color: ink,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headline: {
    color: teal,
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
    color: '#333333',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 24,
  },
  sectionLabel: {
    color: teal,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    marginBottom: 12,
  },
  entryTitle: {
    color: ink,
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 1,
  },
  entryCompany: {
    color: mutedInk,
    fontWeight: '500',
  },
  projectTitle: {
    color: ink,
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  techMono: {
    color: mutedInk,
    fontFamily: fontFamily.mono,
    fontSize: 12,
  },
  period: {
    color: mutedInk,
    fontFamily: fontFamily.mono,
    fontSize: 13,
  },
  body: {
    color: '#333333',
    fontSize: 14,
    lineHeight: 21,
  },
  skillLabel: {
    color: ink,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    width: 128,
  },
  listItem: {
    color: '#333333',
    fontSize: 14,
    lineHeight: 21,
  },
  semiBold: {
    fontWeight: '600',
    color: ink,
  },
  meta: {
    color: mutedInk,
  },
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
    borderTopColor: hairline,
    marginTop: 40,
    paddingTop: 12,
  },
  footer: {
    color: '#7a7a74',
    fontSize: 11,
  },
  actions: {
    backgroundColor: '#faf9f7',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: hairline,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 4,
  },
});

function MetaText({ children, onPress }: { children: ReactNode; onPress?: () => void }) {
  return (
    <Text onPress={onPress} style={{ color: mutedInk, fontSize: 13 }}>
      {children}
    </Text>
  );
}

function MetaDot() {
  return (
    <Text style={{ color: mutedInk, fontSize: 13, marginHorizontal: 8 }}>·</Text>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
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
      <Text style={styles.sectionLabel}>{children}</Text>
      <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: hairline }} />
    </View>
  );
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, paddingLeft: 8 }}>
      <Text style={{ color: '#333333', fontSize: 14, lineHeight: 21 }}>•</Text>
      <Text style={[styles.body, { flex: 1 }]}>{children}</Text>
    </View>
  );
}

export default CVSheet;
