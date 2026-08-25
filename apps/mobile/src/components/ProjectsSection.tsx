import { useEffect, useState } from 'react';
import {
  Image,
  Linking,
  FlatList,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  projects as bundledProjects,
  type Project,
} from '@portfolio/shared';
import { ArrowUpRight } from 'lucide-react-native';
import PressableScale from './PressableScale';
import Reveal from './Reveal';
import { SITE_URL, resolveAssetUrl } from '../config';
import { usePalette } from '../theme-mode';

const INITIAL_COUNT = 6;
const LOAD_STEP = 6;
const CACHE_KEY = 'projects-cache-v1';

type ProjectsCache = {
  savedAt: number;
  projects: Project[];
};

function delayForIndex(index: number): number {
  const position = index % 3;
  return position === 1 ? 150 : position === 2 ? 300 : 0;
}

function ProjectsSection() {
  const palette = usePalette();
  // Bundled snapshot first (offline-safe); then last-cached; then remote-first
  // refresh mirrors the web app so data edits propagate without reinstall.
  const [projects, setProjects] = useState<Project[]>(bundledProjects);
  const [cachedAt, setCachedAt] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

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

  const visibleProjects = projects.slice(0, visibleCount);
  const remainingCount = projects.length - visibleProjects.length;

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
          Featured Projects
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
          A selection of applications I have designed and built, combining
          full-stack development with practical engineering solutions.
        </Text>
      </Reveal>

      <FlatList
        data={visibleProjects}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={{ paddingTop: 40, gap: 32 }}
        renderItem={({ item, index }) => (
          <Reveal delay={delayForIndex(index)}>
            <ProjectCard project={item} palette={palette} />
          </Reveal>
        )}
      />

      {cachedAt !== null && (
        <Text
          style={{
            marginTop: 24,
            textAlign: 'center',
            color: palette.mutedText,
            fontSize: 12,
          }}
        >
          Offline — showing projects saved{' '}
          {new Date(cachedAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      )}

      {remainingCount > 0 && (
        <Reveal delay={150} style={{ marginTop: 56 }}>
          <View style={{ alignItems: 'center', gap: 12 }}>
            <PressableScale
              onPress={() =>
                setVisibleCount((count) => Math.min(count + LOAD_STEP, projects.length))
              }
              style={{
                borderRadius: 26,
                borderWidth: 1,
                borderColor: palette.primary,
                backgroundColor:
                  palette.background === '#ffffff' ? '#ffffff' : 'transparent',
                overflow: 'hidden',
                paddingVertical: 24,
                paddingHorizontal: 32,
              }}
            >
              <Text
                style={{
                  color: palette.primary,
                  fontSize: 16,
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                Load More ({remainingCount} more)
              </Text>
            </PressableScale>
            <Text style={{ color: palette.mutedText, fontSize: 14 }}>
              Showing {visibleProjects.length} of {projects.length} projects
            </Text>
          </View>
        </Reveal>
      )}
    </View>
  );
}

function ProjectCard({
  project,
  palette,
}: {
  project: Project;
  palette: ReturnType<typeof usePalette>;
}) {
  return (
    <PressableScale
      onPress={() => Linking.openURL(project.link).catch(() => {})}
      accessibilityLabel={`Open ${project.title}`}
      style={{
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#000000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      }}
    >
      <View
        style={{
          backgroundColor: palette.card,
          borderWidth: 1,
          borderColor: palette.cardBorder,
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        <Image
          source={{ uri: resolveAssetUrl(project.image) }}
          style={{ width: '100%', aspectRatio: 16 / 9 }}
          resizeMode="cover"
        />
        <View style={{ padding: 24, gap: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={{ color: palette.text, fontSize: 20, fontWeight: '700', flexShrink: 1 }}
            >
              {project.title}
            </Text>
            <ArrowUpRight size={20} color={palette.mutedText} />
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {project.techstack.map((tech) => (
              <View
                key={tech}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: `${palette.secondary}40`,
                  backgroundColor: `${palette.secondary}1A`,
                }}
              >
                <Text style={{ color: palette.secondary, fontSize: 13, fontWeight: '500' }}>
                  {tech}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

export default ProjectsSection;
