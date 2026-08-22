import { useEffect, useState } from 'react';
import {
  Image,
  Linking,
  FlatList,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  projects as bundledProjects,
  type Project,
} from '@portfolio/shared';
import { SITE_URL, resolveAssetUrl } from '../config';
import Reveal from './Reveal';
import type { Palette } from '../theme';

const INITIAL_COUNT = 6;
const LOAD_STEP = 6;

function ProjectsSection({ palette }: { palette: Palette }) {
  const { width: windowWidth } = useWindowDimensions();
  // Bundled snapshot first (offline-safe); remote refresh mirrors the web app.
  const [projects, setProjects] = useState<Project[]>(bundledProjects);
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  useEffect(() => {
    let cancelled = false;
    fetch(`${SITE_URL}/api/projects`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Project[] | null) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setProjects(data);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleProjects = projects.slice(0, visibleCount);
  const remainingCount = projects.length - visibleProjects.length;

  const cardWidth = Math.min(windowWidth - 48, 360);

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
          Featured Projects
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
          A selection of applications I have designed and built, combining
          full-stack development with practical engineering solutions.
        </Text>
      </Reveal>
      <FlatList
        data={visibleProjects}
        keyExtractor={(item) => item.title}
        scrollEnabled={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 32,
          gap: 24,
        }}
        renderItem={({ item }) => (
          <View
            style={{
              width: cardWidth,
              alignSelf: 'center',
              backgroundColor: palette.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: palette.border,
              overflow: 'hidden',
            }}
          >
            <Image
              source={{ uri: resolveAssetUrl(item.image) }}
              style={{ width: '100%', aspectRatio: 16 / 9 }}
              resizeMode="cover"
            />
            <View style={{ padding: 16, gap: 10 }}>
              <Text
                style={{ color: palette.text, fontSize: 17, fontWeight: '700' }}
              >
                {item.title}
              </Text>
              <View
                style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
              >
                {item.techstack.map((tech) => (
                  <View
                    key={tech}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: `${palette.secondary}44`,
                      backgroundColor: `${palette.secondary}1A`,
                    }}
                  >
                    <Text style={{ color: palette.secondary, fontSize: 11 }}>
                      {tech}
                    </Text>
                  </View>
                ))}
              </View>
              <Text
                onPress={() => Linking.openURL(item.link)}
                style={{ color: palette.primary, fontSize: 13, fontWeight: '600' }}
              >
                View project →
              </Text>
            </View>
          </View>
        )}
      />
      {remainingCount > 0 && (
        <Reveal delay={150}>
          <Text
            onPress={() =>
              setVisibleCount((count) =>
                Math.min(count + LOAD_STEP, projects.length)
              )
            }
            style={{
              marginTop: 28,
              textAlign: 'center',
              color: palette.text,
              fontSize: 14,
              fontWeight: '600',
              paddingHorizontal: 24,
            }}
          >
            Load More ({remainingCount} more)
          </Text>
          <Text
            style={{
              marginTop: 8,
              textAlign: 'center',
              color: palette.mutedText,
              fontSize: 11,
            }}
          >
            Showing {visibleProjects.length} of {projects.length} projects
          </Text>
        </Reveal>
      )}
    </View>
  );
}

export default ProjectsSection;
