'use client';

import { useEffect, useState } from 'react';
import { BackButton } from '@/components/web/BackButton';
import Reveal from '@/components/web/Reveal';
import {
  Download,
  Monitor,
  Apple,
  TerminalSquare,
  Smartphone,
  GitFork,
  Check,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

const REPO_OWNER = 'George-Shenoda';
const REPO_NAME = 'George-Shenoda';
const GITHUB_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;
const GITHUB_RELEASES_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases`;
const GITHUB_DOWNLOAD_BASE = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/latest/download`;

interface GitHubRelease {
  tag_name: string;
  name: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
    size: number;
    content_type: string;
  }>;
  published_at: string;
}

interface PlatformInfo {
  id: string;
  name: string;
  icon: React.ReactNode;
  files: Array<{
    name: string;
    filename: string;
    size?: number;
    arch?: string;
  }>;
  recommended?: boolean;
}

const FALLBACK_VERSION = '0.1.0';

const FALLBACK_PLATFORMS: PlatformInfo[] = [
  {
    id: 'windows',
    name: 'Windows',
    icon: <Monitor className="size-8" />,
    files: [
      {
        name: 'Setup (.exe)',
        filename: `George Shenoda Setup ${FALLBACK_VERSION}.exe`,
        arch: 'x64',
      },
    ],
  },
  {
    id: 'macos',
    name: 'macOS',
    icon: <Apple className="size-8" />,
    files: [
      {
        name: 'Apple Silicon (.dmg)',
        filename: `George Shenoda-${FALLBACK_VERSION}-arm64.dmg`,
        arch: 'arm64',
      },
      {
        name: 'Intel (.dmg)',
        filename: `George Shenoda-${FALLBACK_VERSION}.dmg`,
        arch: 'x64',
      },
    ],
  },
  {
    id: 'linux',
    name: 'Linux',
    icon: <TerminalSquare className="size-8" />,
    files: [
      {
        name: 'Debian/Ubuntu (.deb)',
        filename: `my_portfolio-${FALLBACK_VERSION}.deb`,
        arch: 'x64',
      },
    ],
  },
  {
    id: 'android',
    name: 'Android',
    icon: <Smartphone className="size-8" />,
    files: [
      {
        name: 'APK',
        filename: `George-Shenoda-Portfolio-v${FALLBACK_VERSION}.apk`,
        arch: 'arm64',
      },
    ],
  },
];

function detectPlatform(): string {
  if (typeof navigator === 'undefined') return 'windows';
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('android')) return 'android';
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'ios';
  if (ua.includes('mac')) return 'macos';
  if (ua.includes('linux')) return 'linux';
  return 'windows';
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function DownloadPage() {
  const [release, setRelease] = useState<GitHubRelease | null>(null);
  const [platforms, setPlatforms] = useState<PlatformInfo[]>(FALLBACK_PLATFORMS);
  const [error, setError] = useState<string | null>(null);
  const [recommendedPlatform] = useState<string>(() => detectPlatform());

  useEffect(() => {
    let cancelled = false;

    async function fetchRelease() {
      try {
        const response = await fetch(GITHUB_API_URL, {
          headers: {
            Accept: 'application/vnd.github.v3+json',
          },
          cache: 'no-store',
          signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }

        const data: GitHubRelease = await response.json();

        if (cancelled) return;

        const platformMap: Record<string, PlatformInfo> = {
          windows: {
            id: 'windows',
            name: 'Windows',
            icon: <Monitor className="size-8" />,
            files: [],
          },
          macos: {
            id: 'macos',
            name: 'macOS',
            icon: <Apple className="size-8" />,
            files: [],
          },
          linux: {
            id: 'linux',
            name: 'Linux',
            icon: <TerminalSquare className="size-8" />,
            files: [],
          },
          android: {
            id: 'android',
            name: 'Android',
            icon: <Smartphone className="size-8" />,
            files: [],
          },
        };

        data.assets.forEach((asset) => {
          const name = asset.name.toLowerCase();
          const size = asset.size;

          if (name.endsWith('.exe') && name.includes('setup')) {
            platformMap.windows.files.push({
              name: 'Setup (.exe)',
              filename: asset.name,
              size,
              arch: 'x64',
            });
          } else if (name.endsWith('.dmg')) {
            const arch = name.includes('arm64') ? 'arm64' : 'x64';
            platformMap.macos.files.push({
              name: `${arch === 'arm64' ? 'Apple Silicon' : 'Intel'} (.dmg)`,
              filename: asset.name,
              size,
              arch,
            });
          } else if (name.endsWith('.deb')) {
            platformMap.linux.files.push({
              name: 'Debian/Ubuntu (.deb)',
              filename: asset.name,
              size,
              arch: 'x64',
            });
          } else if (name.endsWith('.apk')) {
            platformMap.android.files.push({
              name: 'APK',
              filename: asset.name,
              size,
              arch: 'arm64',
            });
          }
        });

        const activePlatforms = Object.values(platformMap).filter((p) => p.files.length > 0);
        activePlatforms.forEach((p) => {
          p.recommended = p.id === recommendedPlatform;
        });

        setRelease(data);
        setPlatforms(activePlatforms.length > 0 ? activePlatforms : FALLBACK_PLATFORMS);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to fetch release:', err);
        setError('Unable to fetch latest release. Showing cached version info.');
        setPlatforms(FALLBACK_PLATFORMS.map((p) => ({ ...p, recommended: p.id === recommendedPlatform })));
      } finally {
        // Loading state removed - UI uses fallback platforms while fetching
      }
    }

    fetchRelease();

    return () => {
      cancelled = true;
    };
  }, [recommendedPlatform]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'George Shenoda Portfolio',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Windows, macOS, Linux, Android',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            downloadUrl: GITHUB_RELEASES_URL,
          }),
        }}
      />
      <BackButton />
      <div className="min-h-screen bg-background dark:bg-[#0d1515] py-16 px-4 sm:py-24">
        <Reveal immediate className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground">
              Download Portfolio App
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Get the native desktop and mobile apps for offline access, better performance,
              and a seamless experience across all your devices.
            </p>
          </div>

          {error && (
            <Reveal delay="100" className="mb-8">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                <AlertCircle className="size-5 shrink-0" />
                <span>{error}</span>
              </div>
            </Reveal>
          )}

          {release && (
            <Reveal delay="100" className="mb-8 text-center">
              <p className="text-muted-foreground">
                Latest release: <span className="font-medium text-foreground">{release.tag_name}</span>{' '}
                <time dateTime={release.published_at} className="ml-2">
                  {new Date(release.published_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </p>
            </Reveal>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {platforms.map((platform, index) => (
              <Reveal key={platform.id} delay={String((index + 1) * 100)}>
                <PlatformCard
                  platform={platform}
                  downloadBaseUrl={GITHUB_DOWNLOAD_BASE}
                  isRecommended={platform.recommended ?? false}
                />
              </Reveal>
            ))}
          </div>

          <Reveal delay="500" className="mt-12 text-center">
            <a
              href={GITHUB_RELEASES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-background hover:bg-muted transition-all text-foreground font-medium"
            >
              <GitFork className="size-5" />
              View All Releases on GitHub
              <ExternalLink className="size-4" />
            </a>
          </Reveal>

          <Reveal delay="600" className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              All downloads are served directly from GitHub Releases.{' '}
              <a href={GITHUB_RELEASES_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                Verify checksums and signatures
              </a>
              {' '}on the releases page.
            </p>
          </Reveal>
        </Reveal>
      </div>
    </>
  );
}

function PlatformCard({
  platform,
  downloadBaseUrl,
  isRecommended,
}: {
  platform: PlatformInfo;
  downloadBaseUrl: string;
  isRecommended: boolean;
}) {
  return (
    <div
      className={`relative rounded-3xl p-6 border transition-all duration-300 ${
        isRecommended
          ? 'border-primary/50 bg-primary/5 dark:border-primary/30 dark:bg-primary/10 shadow-lg shadow-primary/10'
          : 'border-border bg-card dark:bg-card dark:border-border hover:border-primary/30 hover:shadow-xl'
      }`}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg">
            <Check className="size-3" />
            Recommended
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <div
          className={`inline-flex items-center justify-center size-16 rounded-2xl mb-4 ${
            isRecommended
              ? 'bg-primary/20 text-primary dark:bg-primary/30'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {platform.icon}
        </div>
        <h3 className="text-xl font-bold text-foreground">{platform.name}</h3>
      </div>

      <div className="space-y-3 mb-6">
        {platform.files.map((file, fileIndex) => (
          <a
            key={`${platform.id}-${fileIndex}`}
            href={`${downloadBaseUrl}/${encodeURIComponent(file.filename)}`}
            className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all border border-border/50"
            download
          >
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium text-foreground truncate">{file.name}</p>
              {file.arch && (
                <p className="text-xs text-muted-foreground">{file.arch}</p>
              )}
            </div>
            {file.size && (
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {formatBytes(file.size)}
              </span>
            )}
            <Download className="size-5 text-primary flex-shrink-0" />
          </a>
        ))}
      </div>

      {platform.files.length === 0 && (
        <div className="text-center text-muted-foreground py-4">
          <p className="text-sm">No builds available for this platform yet.</p>
        </div>
      )}
    </div>
  );
}