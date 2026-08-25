# Fix Plan

## Issues to Fix

### 1. Expo Go Worklets Version Mismatch
**Error**: `Error [worklets] mismatch between javascript code version and worklets babel plugin version (0.10.1 vs 0.10.4)`

**Root Cause**: `react-native-worklets` is pinned at `0.10.1` in `apps/mobile/package.json`, but `react-native-reanimated@4.5.1` expects version `0.10.4`.

**Fix**: Update `react-native-worklets` to `0.10.4` in `apps/mobile/package.json`.

---

### 2. Web Navbar Scroll Highlighting Issue
**Problem**: When scrolling to the Contact section, the navbar underline stays under "Projects" instead of moving to "Contact".

**Root Cause**: In `apps/web/components/web/navbar.tsx`, the active section detection uses:
```javascript
if (el.getBoundingClientRect().top <= 160) {
    current = id;
    break;
}
```

When the Contact section is near the bottom of the page, its top may never reach `<= 160px` from the viewport top before the page ends. The logic iterates from bottom to top (projects → workflow), so it stops at "projects" as the last section that satisfied the condition.

**Fix**: Add a check for when we're near the bottom of the page - if the user has scrolled past the projects section and is near the end, force "contact" as active.

The fix should:
1. Check if we're near the bottom of the page (e.g., within 100px of max scroll)
2. If so, and contact section exists, set active to "contact"
3. Otherwise use the existing logic

---

## Implementation Steps

1. ✅ Update `apps/mobile/package.json` - change `react-native-worklets` from `0.10.1` to `0.10.4`
2. ✅ Update `apps/web/components/web/navbar.tsx` - fix the active section detection logic
3. ✅ Run `npm install` in mobile app to update dependencies
4. ✅ Test both fixes - build, lint, and typecheck pass