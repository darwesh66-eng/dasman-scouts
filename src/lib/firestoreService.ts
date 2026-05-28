// ALL Firebase imports are DYNAMIC to prevent crash when not configured
import type { AppData } from '@/contexts/AppContext';
import { firebaseConfig } from '@/firebaseConfig';

let _app: unknown = null;
let _db: unknown = null;

async function getDb() {
  if (_db) return _db;

  const { initializeApp, getApps } = await import('firebase/app');
  _app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

  const { getFirestore } = await import('firebase/firestore');
  _db = getFirestore(_app as Parameters<typeof getFirestore>[0]);
  return _db;
}

export async function loadFromFirestore(): Promise<Partial<AppData> | null> {
  try {
    const db = await getDb();
    const { doc, getDoc } = await import('firebase/firestore');
    const snap = await getDoc(
      doc(db as Parameters<typeof doc>[0], 'app', 'config'),
    );
    if (snap.exists()) return snap.data() as Partial<AppData>;
    return null;
  } catch (err) {
    console.warn('loadFromFirestore:', err);
    return null;
  }
}

export async function saveToFirestore(data: AppData): Promise<void> {
  try {
    const db = await getDb();
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(
      doc(db as Parameters<typeof doc>[0], 'app', 'config'),
      JSON.parse(JSON.stringify(data)), // strip undefined values
      { merge: true },
    );
  } catch (err) {
    console.warn('saveToFirestore:', err);
  }
}
