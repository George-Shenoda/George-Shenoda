import { Asset } from 'expo-asset';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/** Metro-bundled resume.pdf (kept in sync with apps/web/public/assets/resume.pdf). */
const RESUME_MODULE = require('../assets/resume.pdf') as number;

/**
 * Copies the bundled resume.pdf into cache and hands it to the OS share sheet,
 * so saving works fully offline. Step 14 locked decision: external handoffs stay
 * OS-level actions.
 */
export async function shareResumePdf(): Promise<void> {
  const asset = Asset.fromModule(RESUME_MODULE);
  if (!asset.downloaded) {
    await asset.downloadAsync();
  }
  const sourceUri = asset.localUri ?? asset.uri;

  const target = new File(Paths.cache, 'resume.pdf');
  if (target.exists) target.delete();
  await new File(sourceUri).copy(target);

  if (!(await Sharing.isAvailableAsync())) return;
  await Sharing.shareAsync(target.uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Save resume.pdf',
    UTI: 'com.adobe.pdf',
  });
}
