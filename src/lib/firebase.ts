import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  collection,
  onSnapshot,
  deleteField,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  type FirebaseStorage,
} from 'firebase/storage';
import { DEFAULT_PORTFOLIO } from '@/src/data/defaults';
import type {
  AchievementItem,
  ContactMessage,
  PortfolioData,
  ProjectItem,
} from '@/src/types/portfolio';

export const ADMIN_EMAIL = 'it26101283@my.sliit.lk';
const LOCAL_STORAGE_KEY = 'raveesha_portfolio_v3';
const LOCAL_MESSAGES_KEY = 'raveesha_messages_v1';

const FIREBASE_CONFIG = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    'AIzaSyD8CE3zOp7o_bMxFygR8EPEuQgWIYj6v3c',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    'my-portfolio-46f69.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'my-portfolio-46f69',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    'my-portfolio-46f69.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1088728903276',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    '1:1088728903276:web:e277b9be532199be523249',
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-437V0K8G1R',
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;
let storageUnavailable = false;

export const isFirebaseConfigured = Boolean(FIREBASE_CONFIG.apiKey);

if (isFirebaseConfigured) {
  try {
    app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
    db = getFirestore(app);
    auth = getAuth(app);
    try {
      storage = getStorage(app);
    } catch {
      storage = null;
    }
  } catch (err) {
    console.warn('Firebase initialization skipped, using local cache:', err);
  }
}

export function buildFirestoreErrorInfo(
  error: unknown,
  operationType: OperationType,
  path: string | null
): FirestoreErrorInfo {
  return {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth?.currentUser?.uid ?? null,
      email: auth?.currentUser?.email ?? null,
      emailVerified: auth?.currentUser?.emailVerified ?? null,
      isAnonymous: auth?.currentUser?.isAnonymous ?? null,
      tenantId: auth?.currentUser?.tenantId ?? null,
      providerInfo:
        auth?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) ?? [],
    },
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const info = buildFirestoreErrorInfo(error, operationType, path);
  console.error('Firestore Error:', JSON.stringify(info));
  throw new Error(JSON.stringify(info));
}

export async function testFirestoreConnection(): Promise<boolean> {
  if (!db) return false;
  try {
    await getDocFromServer(doc(db, 'portfolio', 'main'));
    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes('offline')
    ) {
      console.warn('Firestore offline or unreachable — falling back gracefully.');
    }
    return false;
  }
}

function mergeWithDefaults(
  rawMain?: Record<string, unknown> | null,
  projects?: ProjectItem[],
  achievements?: AchievementItem[]
): PortfolioData {
  const base: PortfolioData = {
    ...DEFAULT_PORTFOLIO,
    ...(rawMain || {}),
  };

  if (!Array.isArray(base.skills) || !base.skills.length) {
    base.skills = DEFAULT_PORTFOLIO.skills;
  }
  if (!Array.isArray(base.education) || !base.education.length) {
    base.education = DEFAULT_PORTFOLIO.education;
  }
  if (!Array.isArray(base.interests) || !base.interests.length) {
    base.interests = DEFAULT_PORTFOLIO.interests;
  }
  if (!Array.isArray(base.phones)) base.phones = [];
  if (!Array.isArray(base.links)) base.links = [];
  if (!Array.isArray(base.qrs)) base.qrs = [];

  if (projects !== undefined) {
    base.projects = projects.length ? projects : DEFAULT_PORTFOLIO.projects;
  }
  if (achievements !== undefined) {
    base.achievements = achievements;
  }

  return base;
}

export async function loadPortfolioData(): Promise<PortfolioData> {
  if (db) {
    try {
      const mainSnap = await getDoc(doc(db, 'portfolio', 'main'));
      const rawMain = mainSnap.exists()
        ? (mainSnap.data() as Record<string, unknown>)
        : null;

      let projects: ProjectItem[] = DEFAULT_PORTFOLIO.projects;
      try {
        const q = await getDocs(collection(db, 'projects'));
        const list = q.docs
          .map((d) => ({ id: d.id, ...(d.data() as ProjectItem) }))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        if (list.length) projects = list;
      } catch (err) {
        console.warn('Projects fetch warning:', err);
      }

      let achievements: AchievementItem[] = [];
      try {
        const q = await getDocs(collection(db, 'achievements'));
        achievements = q.docs
          .map((d) => ({ id: d.id, ...(d.data() as AchievementItem) }))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      } catch (err) {
        console.warn('Achievements fetch warning:', err);
      }

      const merged = mergeWithDefaults(rawMain, projects, achievements);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
      } catch {
        // Ignore quota errors on local mirror
      }
      return merged;
    } catch (err) {
      console.warn('Firestore load failed, reading local cache:', err);
    }
  }

  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      return mergeWithDefaults(JSON.parse(cached));
    }
  } catch {
    // Ignore parse error
  }
  return DEFAULT_PORTFOLIO;
}

export function subscribePortfolioChanges(
  onUpdate: (data: PortfolioData) => void
): Unsubscribe {
  if (!db) return () => {};

  let latestMain: Record<string, unknown> | null = null;
  let latestProjects: ProjectItem[] | undefined;
  let latestAchievements: AchievementItem[] | undefined;

  const emit = () => {
    const merged = mergeWithDefaults(
      latestMain,
      latestProjects,
      latestAchievements
    );
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
    } catch {
      // Ignore quota
    }
    onUpdate(merged);
  };

  const unsubMain = onSnapshot(
    doc(db, 'portfolio', 'main'),
    (snap) => {
      latestMain = snap.exists()
        ? (snap.data() as Record<string, unknown>)
        : null;
      emit();
    },
    (err) => {
      console.warn('Main snapshot warning:', err.message);
    }
  );

  const unsubProj = onSnapshot(
    collection(db, 'projects'),
    (snap) => {
      latestProjects = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as ProjectItem) }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      emit();
    },
    (err) => {
      console.warn('Projects snapshot warning:', err.message);
    }
  );

  const unsubAch = onSnapshot(
    collection(db, 'achievements'),
    (snap) => {
      latestAchievements = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as AchievementItem) }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      emit();
    },
    (err) => {
      console.warn('Achievements snapshot warning:', err.message);
    }
  );

  return () => {
    unsubMain();
    unsubProj();
    unsubAch();
  };
}

export async function saveMainPortfolio(data: PortfolioData): Promise<void> {
  const { projects: _p, achievements: _a, ...main } = data;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore
  }

  if (!db) return;
  try {
    await setDoc(doc(db, 'portfolio', 'main'), main, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'portfolio/main');
  }
}

export async function saveCollectionItems(
  colName: 'projects' | 'achievements',
  items: (ProjectItem | AchievementItem)[]
): Promise<(ProjectItem | AchievementItem)[]> {
  if (!db) return items;

  try {
    const existingSnap = await getDocs(collection(db, colName));
    const keepIds = new Set<string>();
    const updated: (ProjectItem | AchievementItem)[] = [];

    for (let idx = 0; idx < items.length; idx++) {
      const { id, ...rest } = items[idx];
      const docRef = id
        ? doc(db, colName, id)
        : doc(collection(db, colName));
      keepIds.add(docRef.id);
      const payload = { ...rest, order: idx };
      await setDoc(docRef, payload);
      updated.push({ id: docRef.id, ...payload });
    }

    for (const d of existingSnap.docs) {
      if (!keepIds.has(d.id)) {
        await deleteDoc(d.ref);
      }
    }

    await setDoc(
      doc(db, 'portfolio', 'main'),
      { [colName]: deleteField() },
      { merge: true }
    );

    return updated;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, colName);
  }
}

export async function submitContactMessage(
  msg: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>
): Promise<{ storedInCloud: boolean }> {
  const payload: Omit<ContactMessage, 'id'> = {
    ...msg,
    createdAt: new Date().toISOString(),
    read: false,
  };

  if (db) {
    try {
      await addDoc(collection(db, 'messages'), payload);
      return { storedInCloud: true };
    } catch (err) {
      console.warn(
        'Cloud message write fell back to local storage (check Firestore rules for /messages):',
        err
      );
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_MESSAGES_KEY);
    const list: ContactMessage[] = raw ? JSON.parse(raw) : [];
    list.unshift({ id: `local_${Date.now()}`, ...payload });
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage error
  }
  return { storedInCloud: false };
}

export async function loadContactMessages(): Promise<ContactMessage[]> {
  const localRaw = (() => {
    try {
      const s = localStorage.getItem(LOCAL_MESSAGES_KEY);
      return s ? (JSON.parse(s) as ContactMessage[]) : [];
    } catch {
      return [];
    }
  })();

  if (!db) return localRaw;
  try {
    const snap = await getDocs(collection(db, 'messages'));
    const cloud = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as ContactMessage),
    }));
    const merged = [...cloud, ...localRaw].sort((a, b) =>
      (b.createdAt || '').localeCompare(a.createdAt || '')
    );
    return merged;
  } catch (err) {
    console.warn('Messages read warning:', err);
    return localRaw;
  }
}

export async function markMessageRead(id: string): Promise<void> {
  if (id.startsWith('local_')) {
    try {
      const raw = localStorage.getItem(LOCAL_MESSAGES_KEY);
      if (raw) {
        const list = (JSON.parse(raw) as ContactMessage[]).map((m) =>
          m.id === id ? { ...m, read: true } : m
        );
        localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(list));
      }
    } catch {
      // Ignore
    }
    return;
  }
  if (!db) return;
  try {
    await updateDoc(doc(db, 'messages', id), { read: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `messages/${id}`);
  }
}

export async function deleteContactMessage(id: string): Promise<void> {
  if (id.startsWith('local_')) {
    try {
      const raw = localStorage.getItem(LOCAL_MESSAGES_KEY);
      if (raw) {
        const list = (JSON.parse(raw) as ContactMessage[]).filter(
          (m) => m.id !== id
        );
        localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(list));
      }
    } catch {
      // Ignore
    }
    return;
  }
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'messages', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `messages/${id}`);
  }
}

export function compressImageFile(
  file: File,
  maxDimension = 1200,
  quality = 0.82
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to encode image'));
              return;
            }
            resolve({ blob, dataUrl });
          },
          'image/jpeg',
          quality
        );
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadImageWithFallback(
  file: File,
  folder: string
): Promise<{ url: string; compressedLocally: boolean }> {
  if (storage && !storageUnavailable) {
    try {
      const { blob } = await compressImageFile(file, 1400, 0.84);
      const ref = storageRef(storage, `${folder}/${Date.now()}_${file.name.replace(/[^\w.]/g, '_')}`);
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Storage timeout')), 7000)
      );
      await Promise.race([uploadBytes(ref, blob), timeout]);
      const url = await Promise.race([getDownloadURL(ref), timeout]);
      return { url, compressedLocally: false };
    } catch {
      storageUnavailable = true;
    }
  }

  const { dataUrl } = await compressImageFile(file, 640, 0.62);
  return { url: dataUrl, compressedLocally: true };
}

export async function uploadVideoWithFallback(
  file: File,
  folder: string
): Promise<string> {
  if (storage && !storageUnavailable) {
    try {
      const ref = storageRef(
        storage,
        `${folder}/${Date.now()}_${file.name.replace(/[^\w.]/g, '_')}`
      );
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Storage timeout')), 9000)
      );
      await Promise.race([uploadBytes(ref, file), timeout]);
      return await Promise.race([getDownloadURL(ref), timeout]);
    } catch {
      storageUnavailable = true;
    }
  }

  if (file.size > 650000) {
    throw new Error(
      'Video exceeds 650 KB inline limit without Firebase Storage. Please paste a YouTube or Google Drive video link instead.'
    );
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function loginAdmin(email: string, password: string): Promise<User> {
  if (!auth) {
    throw new Error('Firebase Authentication is not configured.');
  }
  const normalized = email.trim().toLowerCase();
  if (normalized !== ADMIN_EMAIL) {
    throw new Error('This email address is not authorized as portfolio admin.');
  }
  const cred = await signInWithEmailAndPassword(auth, normalized, password);
  return cred.user;
}

export async function logoutAdmin(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

export function onAdminAuthChanged(
  callback: (isAdmin: boolean, user: User | null) => void
): () => void {
  if (!auth) {
    callback(false, null);
    return () => {};
  }
  return onAuthStateChanged(auth, (user) => {
    const isAdmin =
      Boolean(user) && (user?.email || '').toLowerCase() === ADMIN_EMAIL;
    if (user && !isAdmin) {
      signOut(auth!).catch(() => {});
    }
    callback(isAdmin, isAdmin ? user : null);
  });
}
