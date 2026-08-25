import { createContext, useContext, useState, type ReactNode } from 'react';
import {
  useWindowDimensions,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

export type Section = 'workflow' | 'projects' | 'contact';

const SECTION_ORDER: Section[] = ['workflow', 'projects', 'contact'];

/** Web navbar parity: a section is active once its top passes 160px from the viewport top. */
const ACTIVE_LINE = 160;

type ScrollContextValue = {
  /** UI-thread scroll position — never read during render. */
  scrollY: SharedValue<number>;
  viewportHeight: number;
  contentHeight: number;
  setContentHeight: (height: number) => void;
  activeSection: Section | '';
  onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  trackSection: (section: Section) => (e: LayoutChangeEvent) => void;
  /** Event-handler only (not during render): content-space top of a tracked section. */
  getSectionTop: (section: Section) => number | undefined;
};

const ScrollContext = createContext<ScrollContextValue | null>(null);

export function ScrollProvider({ children }: { children: ReactNode }) {
  const scrollY = useSharedValue(0);
  const sectionTops = useSharedValue<Partial<Record<Section, number>>>({});
  const activeSectionSV = useSharedValue<Section | ''>('');
  const { height: viewportHeight } = useWindowDimensions();
  const [contentHeight, setContentHeight] = useState(0);
  const [activeSection, setActiveSection] = useState<Section | ''>('');

  const computeActive = (y: number) => {
    'worklet';
    const tops = sectionTops.get();
    let current: Section | '' = '';
    for (const id of SECTION_ORDER) {
      const top = tops[id];
      if (top != null && top <= y + ACTIVE_LINE) current = id;
    }
    if (current !== activeSectionSV.get()) {
      activeSectionSV.set(current);
      scheduleOnRN(setActiveSection, current);
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    scrollY.set(y);
    computeActive(y);
  };

  const trackSection = (section: Section) => (e: LayoutChangeEvent) => {
    const top = e.nativeEvent.layout.y;
    sectionTops.set((prev) => ({ ...prev, [section]: top }));
  };

  const getSectionTop = (section: Section) => sectionTops.get()[section];

  return (
    <ScrollContext.Provider
      value={{
        scrollY,
        viewportHeight,
        contentHeight,
        setContentHeight,
        activeSection,
        onScroll,
        trackSection,
        getSectionTop,
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
}

export function useScroll(): ScrollContextValue {
  const value = useContext(ScrollContext);
  if (!value) throw new Error('useScroll must be used inside <ScrollProvider>.');
  return value;
}
