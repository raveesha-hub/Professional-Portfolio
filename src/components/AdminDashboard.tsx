import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Award,
  Check,
  Code2,
  FolderKanban,
  GraduationCap,
  Inbox,
  Lock,
  LogOut,
  Mail,
  Plus,
  Save,
  Settings,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import {
  ADMIN_EMAIL,
  compressImageFile,
  deleteContactMessage,
  loadContactMessages,
  loginAdmin,
  logoutAdmin,
  markMessageRead,
  onAdminAuthChanged,
  saveCollectionItems,
  saveMainPortfolio,
  uploadImageWithFallback,
  uploadVideoWithFallback,
} from '@/src/lib/firebase';
import type {
  AchievementItem,
  ContactMessage,
  EducationItem,
  PortfolioData,
  ProjectItem,
} from '@/src/types/portfolio';

interface AdminDashboardProps {
  data: PortfolioData;
  onDataChange: (next: PortfolioData) => void;
  onClose: () => void;
}

type AdminTab =
  | 'profile'
  | 'about'
  | 'skills'
  | 'projects'
  | 'education'
  | 'journey'
  | 'achievements'
  | 'contact'
  | 'inbox';

export function AdminDashboard({
  data,
  onDataChange,
  onClose,
}: AdminDashboardProps) {
  const [authed, setAuthed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loginEmail, setLoginEmail] = useState(ADMIN_EMAIL);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [tab, setTab] = useState<AdminTab>('profile');
  const [draft, setDraft] = useState<PortfolioData>(data);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    setDraft(data);
  }, [data]);

  useEffect(() => {
    const unsub = onAdminAuthChanged((isAdmin) => {
      setAuthed(isAdmin);
      setCheckingAuth(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (authed && tab === 'inbox') {
      setLoadingMessages(true);
      loadContactMessages()
        .then(setMessages)
        .finally(() => setLoadingMessages(false));
    }
  }, [authed, tab]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      await loginAdmin(loginEmail, loginPassword);
      setLoginPassword('');
    } catch (err) {
      setLoginError(
        err instanceof Error ? err.message : 'Sign-in failed. Check credentials.'
      );
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    onClose();
  };

  const saveMain = async (nextDraft: PortfolioData = draft) => {
    setSaving(true);
    try {
      await saveMainPortfolio(nextDraft);
      onDataChange(nextDraft);
      showToast('Changes saved successfully');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to save changes'
      );
    } finally {
      setSaving(false);
    }
  };

  const saveProjects = async () => {
    const clean = draft.projects
      .filter((p) => p.t.trim())
      .map((p, idx) => ({
        ...p,
        t: p.t.trim(),
        d: p.d.trim(),
        order: idx,
      }));
    const totalSize = clean.find((p) => JSON.stringify(p).length > 900000);
    if (totalSize) {
      showToast(
        `"${totalSize.t}" exceeds ~900 KB inline size limit. Use image URLs or fewer images.`
      );
      return;
    }

    setSaving(true);
    try {
      const saved = (await saveCollectionItems(
        'projects',
        clean
      )) as ProjectItem[];
      const next = { ...draft, projects: saved };
      setDraft(next);
      onDataChange(next);
      showToast('Projects saved to Firebase');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to save projects'
      );
    } finally {
      setSaving(false);
    }
  };

  const saveAchievements = async () => {
    const clean = draft.achievements
      .filter((a) => a.t.trim())
      .map((a, idx) => ({
        ...a,
        t: a.t.trim(),
        d: a.d.trim(),
        order: idx,
      }));
    const totalSize = clean.find((a) => JSON.stringify(a).length > 900000);
    if (totalSize) {
      showToast(
        `"${totalSize.t}" exceeds ~900 KB inline size limit. Use image URLs or fewer images.`
      );
      return;
    }

    setSaving(true);
    try {
      const saved = (await saveCollectionItems(
        'achievements',
        clean
      )) as AchievementItem[];
      const next = { ...draft, achievements: saved };
      setDraft(next);
      onDataChange(next);
      showToast('Achievements saved to Firebase');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to save achievements'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePicUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl } = await compressImageFile(file, 560, 0.82);
      setDraft((d) => ({ ...d, pic: dataUrl }));
      showToast('Portrait ready — press Save Profile');
    } catch {
      showToast('Could not read selected image');
    }
    e.target.value = '';
  };

  const handleItemPicsUpload = async (
    kind: 'projects' | 'achievements',
    idx: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    showToast('Processing images...');
    const urls: string[] = [];
    for (const f of files) {
      try {
        const res = await uploadImageWithFallback(f, kind);
        urls.push(res.url);
      } catch {
        showToast(`Failed reading ${f.name}`);
      }
    }
    if (urls.length) {
      setDraft((d) => {
        const list = [...d[kind]];
        const item = { ...list[idx] };
        item.pics = [...(item.pics || []), ...urls];
        list[idx] = item as never;
        return { ...d, [kind]: list };
      });
      showToast('Images attached — press Save');
    }
    e.target.value = '';
  };

  const handleItemVideoUpload = async (
    kind: 'projects' | 'achievements',
    idx: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    showToast('Uploading video...');
    for (const f of files) {
      try {
        const url = await uploadVideoWithFallback(f, `${kind}_video`);
        setDraft((d) => {
          const list = [...d[kind]];
          const item = { ...list[idx] };
          const cur = item.videos?.length
            ? item.videos
            : item.video
            ? [item.video]
            : [];
          item.videos = [...cur, url];
          item.video = '';
          list[idx] = item as never;
          return { ...d, [kind]: list };
        });
        showToast('Video added — press Save');
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Video upload failed');
      }
    }
    e.target.value = '';
  };

  const handleQrUpload = async (
    idx: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl } = await compressImageFile(file, 480, 0.92);
      setDraft((d) => {
        const qrs = [...d.qrs];
        qrs[idx] = { ...qrs[idx], src: dataUrl };
        return { ...d, qrs };
      });
      showToast('QR image ready — press Save Contact');
    } catch {
      showToast('Could not read QR image');
    }
    e.target.value = '';
  };

  const moveItem = <T,>(arr: T[], idx: number, dir: -1 | 1): T[] => {
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return arr;
    const copy = [...arr];
    const [removed] = copy.splice(idx, 1);
    copy.splice(target, 0, removed);
    return copy;
  };

  const TABS: { id: AdminTab; label: string; icon: typeof User }[] = [
    { id: 'profile', label: 'Hero & Profile', icon: User },
    { id: 'about', label: 'About & Goals', icon: Code2 },
    { id: 'skills', label: 'Skills', icon: Code2 },
    { id: 'projects', label: 'Projects (3D)', icon: FolderKanban },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'journey', label: 'Journey', icon: Code2 },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'contact', label: 'Contact & QR', icon: Settings },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
  ];

  return (
    <div className="min-h-screen relative z-20 px-4 sm:px-6 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Bar */}
        <div className="glass-panel rounded-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white/70 dark:bg-white/5 border border-purple-500/20 hover:border-purple-400 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Portfolio
            </button>
            <div>
              <h1 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                Portfolio Admin Studio
              </h1>
              <p className="font-mono-tech text-[11px] text-purple-600 dark:text-purple-300">
                Project R · Firebase Sync
              </p>
            </div>
          </div>

          {authed && (
            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          )}
        </div>

        {/* Toast Banner */}
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold shadow-xl">
            {toast}
          </div>
        )}

        {/* Auth Gate */}
        {checkingAuth ? (
          <div className="glass-panel rounded-3xl p-12 text-center text-sm text-slate-500">
            Verifying Firebase session...
          </div>
        ) : !authed ? (
          <div className="max-w-md mx-auto glass-panel-strong rounded-3xl p-8 space-y-5 mt-12">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600/25 to-blue-600/25 border border-purple-400/35 flex items-center justify-center text-purple-500 dark:text-purple-300">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                Admin Sign In
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Sign in with your authorized Firebase account to manage portfolio content.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-mono-tech uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-1.5">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/75 dark:bg-white/5 border border-purple-500/25 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-tech uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter Firebase password"
                  className="w-full px-4 py-3 rounded-xl bg-white/75 dark:bg-white/5 border border-purple-500/25 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {loginError && (
                <p className="text-xs text-rose-500 font-medium">{loginError}</p>
              )}

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full btn-primary-gradient py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-60"
              >
                {loggingIn ? 'Signing In...' : 'Sign In to Dashboard'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                        : 'glass-panel text-slate-700 dark:text-slate-200 hover:border-purple-400/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Hero & Profile */}
            {tab === 'profile' && (
              <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5">
                <h2 className="font-display font-bold text-xl">
                  Hero &amp; Profile Identity
                </h2>

                <div className="flex flex-wrap items-center gap-5">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-purple-900/30 border border-purple-400/30 flex items-center justify-center shrink-0">
                    {draft.pic ? (
                      <img
                        src={draft.pic}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-purple-300" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs font-semibold text-purple-600 dark:text-purple-200 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      Upload Profile Picture
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleProfilePicUpload}
                      />
                    </label>
                    {draft.pic && (
                      <button
                        type="button"
                        onClick={() => setDraft((d) => ({ ...d, pic: '' }))}
                        className="ml-2 px-3 py-2 rounded-xl text-xs text-rose-500 border border-rose-500/25 cursor-pointer"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono-tech uppercase mb-1">
                      Name
                    </label>
                    <input
                      value={draft.name}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, name: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-white/75 dark:bg-white/5 border border-purple-500/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono-tech uppercase mb-1">
                      Role
                    </label>
                    <input
                      value={draft.role}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, role: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-white/75 dark:bg-white/5 border border-purple-500/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono-tech uppercase mb-1">
                      University
                    </label>
                    <input
                      value={draft.uni}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, uni: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-white/75 dark:bg-white/5 border border-purple-500/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono-tech uppercase mb-1">
                      Email Address
                    </label>
                    <input
                      value={draft.email}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, email: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-white/75 dark:bg-white/5 border border-purple-500/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono-tech uppercase mb-1">
                      GitHub URL
                    </label>
                    <input
                      value={draft.github || ''}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, github: e.target.value }))
                      }
                      placeholder="https://github.com/..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/75 dark:bg-white/5 border border-purple-500/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono-tech uppercase mb-1">
                      LinkedIn URL
                    </label>
                    <input
                      value={draft.linkedin || ''}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, linkedin: e.target.value }))
                      }
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/75 dark:bg-white/5 border border-purple-500/20 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-tech uppercase mb-1">
                    Welcome Tagline
                  </label>
                  <input
                    value={draft.wel}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, wel: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-white/75 dark:bg-white/5 border border-purple-500/20 text-sm"
                  />
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => saveMain()}
                  className="btn-primary-gradient px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save Profile
                </button>
              </div>
            )}

            {/* Tab 2: About & Goals */}
            {tab === 'about' && (
              <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5">
                <h2 className="font-display font-bold text-xl">
                  About Me, Career Goals &amp; Reflection
                </h2>

                <div>
                  <label className="block text-xs font-mono-tech uppercase mb-1">
                    About Introduction
                  </label>
                  <textarea
                    rows={4}
                    value={draft.about}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, about: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-white/75 dark:bg-white/5 border border-purple-500/20 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-tech uppercase mb-1">
                    Technology &amp; IoT Interests (one per line)
                  </label>
                  <textarea
                    rows={4}
                    value={(draft.interests || []).join('\n')}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        interests: e.target.value
                          .split('\n')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-white/75 dark:bg-white/5 border border-purple-500/20 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-tech uppercase mb-1">
                    Career Goals
                  </label>
                  <textarea
                    rows={3}
                    value={draft.careerGoals || ''}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, careerGoals: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-white/75 dark:bg-white/5 border border-purple-500/20 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-tech uppercase mb-1">
                    Personal Reflection
                  </label>
                  <textarea
                    rows={4}
                    value={draft.reflection}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, reflection: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-white/75 dark:bg-white/5 border border-purple-500/20 text-sm"
                  />
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => saveMain()}
                  className="btn-primary-gradient px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save About &amp; Reflection
                </button>
              </div>
            )}

            {/* Tab 3: Skills */}
            {tab === 'skills' && (
              <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display font-bold text-xl">
                    Skills Universe Categories
                  </h2>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        skills: [...d.skills, { n: 'New Category', i: [] }],
                      }))
                    }
                    className="px-3.5 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Category
                  </button>
                </div>

                <div className="space-y-4">
                  {draft.skills.map((sk, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-purple-500/20 space-y-3"
                    >
                      <div className="flex flex-wrap gap-3 items-center">
                        <input
                          placeholder="Category Name"
                          value={sk.n}
                          onChange={(e) => {
                            const next = [...draft.skills];
                            next[idx] = { ...next[idx], n: e.target.value };
                            setDraft((d) => ({ ...d, skills: next }));
                          }}
                          className="flex-1 min-w-[200px] px-3.5 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDraft((d) => ({
                              ...d,
                              skills: d.skills.filter((_, i) => i !== idx),
                            }))
                          }
                          className="p-2 rounded-xl bg-rose-500/15 text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Comma-separated items (e.g. Java, Dart, JavaScript)"
                        value={sk.i.join(', ')}
                        onChange={(e) => {
                          const next = [...draft.skills];
                          next[idx] = {
                            ...next[idx],
                            i: e.target.value
                              .split(',')
                              .map((x) => x.trim())
                              .filter(Boolean),
                          };
                          setDraft((d) => ({ ...d, skills: next }));
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => saveMain()}
                  className="btn-primary-gradient px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save Skills
                </button>
              </div>
            )}

            {/* Tab 4: Projects (Unlimited for 3D Cube Sets) */}
            {tab === 'projects' && (
              <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display font-bold text-xl">
                      Projects Manager (3D Cube Showcase)
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Every 6 projects form a 3D cube set. Add unlimited projects.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        projects: [
                          ...d.projects,
                          {
                            t: '',
                            d: '',
                            fullDesc: '',
                            tech: [],
                            features: [],
                            github: '',
                            demo: '',
                            link: '',
                            videos: [],
                            pics: [],
                          },
                        ],
                      }))
                    }
                    className="px-3.5 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Project
                  </button>
                </div>

                <div className="space-y-5">
                  {draft.projects.map((proj, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-purple-500/20 space-y-3"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono-tech text-xs text-purple-500">
                          #{idx + 1}
                        </span>
                        <input
                          placeholder="Project Title"
                          value={proj.t}
                          onChange={(e) => {
                            const next = [...draft.projects];
                            next[idx] = { ...next[idx], t: e.target.value };
                            setDraft((d) => ({ ...d, projects: next }));
                          }}
                          className="flex-1 min-w-[200px] px-3.5 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDraft((d) => ({
                              ...d,
                              projects: moveItem(d.projects, idx, -1),
                            }))
                          }
                          className="p-2 rounded-lg bg-white/60 dark:bg-white/10 cursor-pointer"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDraft((d) => ({
                              ...d,
                              projects: moveItem(d.projects, idx, 1),
                            }))
                          }
                          className="p-2 rounded-lg bg-white/60 dark:bg-white/10 cursor-pointer"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDraft((d) => ({
                              ...d,
                              projects: d.projects.filter((_, i) => i !== idx),
                            }))
                          }
                          className="p-2 rounded-lg bg-rose-500/15 text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Short Cube Face Summary"
                        value={proj.d}
                        onChange={(e) => {
                          const next = [...draft.projects];
                          next[idx] = { ...next[idx], d: e.target.value };
                          setDraft((d) => ({ ...d, projects: next }));
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                      />

                      <textarea
                        rows={3}
                        placeholder="Full Project Description (shown inside details modal)"
                        value={proj.fullDesc || ''}
                        onChange={(e) => {
                          const next = [...draft.projects];
                          next[idx] = {
                            ...next[idx],
                            fullDesc: e.target.value,
                          };
                          setDraft((d) => ({ ...d, projects: next }));
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          placeholder="Technologies (comma separated)"
                          value={(proj.tech || []).join(', ')}
                          onChange={(e) => {
                            const next = [...draft.projects];
                            next[idx] = {
                              ...next[idx],
                              tech: e.target.value
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean),
                            };
                            setDraft((d) => ({ ...d, projects: next }));
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                        />
                        <input
                          placeholder="GitHub URL"
                          value={proj.github || ''}
                          onChange={(e) => {
                            const next = [...draft.projects];
                            next[idx] = { ...next[idx], github: e.target.value };
                            setDraft((d) => ({ ...d, projects: next }));
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                        />
                        <input
                          placeholder="Live Demo URL"
                          value={proj.demo || proj.link || ''}
                          onChange={(e) => {
                            const next = [...draft.projects];
                            next[idx] = {
                              ...next[idx],
                              demo: e.target.value,
                              link: e.target.value,
                            };
                            setDraft((d) => ({ ...d, projects: next }));
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                        />
                        <textarea
                          rows={2}
                          placeholder="Key features (one per line)"
                          value={(proj.features || []).join('\n')}
                          onChange={(e) => {
                            const next = [...draft.projects];
                            next[idx] = {
                              ...next[idx],
                              features: e.target.value
                                .split('\n')
                                .map((s) => s.trim())
                                .filter(Boolean),
                            };
                            setDraft((d) => ({ ...d, projects: next }));
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                        />
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Video URLs (one per line: YouTube, Google Drive, or .mp4)"
                        value={(proj.videos?.length
                          ? proj.videos
                          : proj.video
                          ? [proj.video]
                          : []
                        ).join('\n')}
                        onChange={(e) => {
                          const next = [...draft.projects];
                          next[idx] = {
                            ...next[idx],
                            videos: e.target.value
                              .split('\n')
                              .map((s) => s.trim())
                              .filter(Boolean),
                            video: '',
                          };
                          setDraft((d) => ({ ...d, projects: next }));
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                      />

                      {/* Images Preview + Add */}
                      <div className="flex flex-wrap gap-2">
                        {(proj.pics || []).map((picUrl, j) => (
                          <div
                            key={j}
                            className="relative w-16 h-16 rounded-xl overflow-hidden border border-purple-400/30"
                          >
                            <img
                              src={picUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...draft.projects];
                                next[idx] = {
                                  ...next[idx],
                                  pics: (next[idx].pics || []).filter(
                                    (_, k) => k !== j
                                  ),
                                };
                                setDraft((d) => ({ ...d, projects: next }));
                              }}
                              className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <label className="px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          Upload Images
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            hidden
                            onChange={(e) =>
                              handleItemPicsUpload('projects', idx, e)
                            }
                          />
                        </label>
                        <label className="px-3 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          Upload Video
                          <input
                            type="file"
                            accept="video/*"
                            multiple
                            hidden
                            onChange={(e) =>
                              handleItemVideoUpload('projects', idx, e)
                            }
                          />
                        </label>
                        <input
                          placeholder="Or paste image https:// URL & press Enter"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = e.currentTarget.value.trim();
                              if (/^https?:\/\//i.test(val)) {
                                const next = [...draft.projects];
                                next[idx] = {
                                  ...next[idx],
                                  pics: [...(next[idx].pics || []), val],
                                };
                                setDraft((d) => ({ ...d, projects: next }));
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                          className="flex-1 min-w-[220px] px-3 py-1.5 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={saveProjects}
                  className="btn-primary-gradient px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save Projects
                </button>
              </div>
            )}

            {/* Tab 5: Education Timeline */}
            {tab === 'education' && (
              <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-xl">
                    Education Timeline
                  </h2>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        education: [
                          ...d.education,
                          {
                            id: `edu_${Date.now()}`,
                            institution: '',
                            degree: '',
                            period: '',
                            status: '',
                            description: '',
                            highlights: [],
                          } as EducationItem,
                        ],
                      }))
                    }
                    className="px-3.5 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Entry
                  </button>
                </div>

                <div className="space-y-4">
                  {draft.education.map((edu, idx) => (
                    <div
                      key={edu.id || idx}
                      className="p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-purple-500/20 space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          placeholder="Institution / University"
                          value={edu.institution}
                          onChange={(e) => {
                            const next = [...draft.education];
                            next[idx] = {
                              ...next[idx],
                              institution: e.target.value,
                            };
                            setDraft((d) => ({ ...d, education: next }));
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                        />
                        <input
                          placeholder="Degree / Program"
                          value={edu.degree}
                          onChange={(e) => {
                            const next = [...draft.education];
                            next[idx] = { ...next[idx], degree: e.target.value };
                            setDraft((d) => ({ ...d, education: next }));
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                        />
                        <input
                          placeholder="Period (e.g. 2024 – Present)"
                          value={edu.period}
                          onChange={(e) => {
                            const next = [...draft.education];
                            next[idx] = { ...next[idx], period: e.target.value };
                            setDraft((d) => ({ ...d, education: next }));
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                        />
                        <div className="flex gap-2">
                          <input
                            placeholder="Status (e.g. Ongoing)"
                            value={edu.status || ''}
                            onChange={(e) => {
                              const next = [...draft.education];
                              next[idx] = {
                                ...next[idx],
                                status: e.target.value,
                              };
                              setDraft((d) => ({ ...d, education: next }));
                            }}
                            className="flex-1 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setDraft((d) => ({
                                ...d,
                                education: d.education.filter(
                                  (_, i) => i !== idx
                                ),
                              }))
                            }
                            className="p-2 rounded-xl bg-rose-500/15 text-rose-500 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Description"
                        value={edu.description}
                        onChange={(e) => {
                          const next = [...draft.education];
                          next[idx] = {
                            ...next[idx],
                            description: e.target.value,
                          };
                          setDraft((d) => ({ ...d, education: next }));
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => saveMain()}
                  className="btn-primary-gradient px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save Education
                </button>
              </div>
            )}

            {/* Tab 5B: Digital Journey Milestones */}
            {tab === 'journey' && (
              <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display font-bold text-xl">
                      Custom Journey Milestones
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Projects, Education, Skills, and Achievements appear automatically in Digital Journey. Add extra milestone notes here.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        journey: [
                          ...(d.journey || []),
                          {
                            id: `j_${Date.now()}`,
                            date: '',
                            title: '',
                            category: 'Project',
                            summary: '',
                          },
                        ],
                      }))
                    }
                    className="px-3.5 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Milestone
                  </button>
                </div>

                <div className="space-y-4">
                  {(draft.journey || []).map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className="p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-purple-500/20 space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          placeholder="Milestone Title"
                          value={m.title}
                          onChange={(e) => {
                            const next = [...(draft.journey || [])];
                            next[idx] = { ...next[idx], title: e.target.value };
                            setDraft((d) => ({ ...d, journey: next }));
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                        />
                        <input
                          placeholder="Date / Period"
                          value={m.date}
                          onChange={(e) => {
                            const next = [...(draft.journey || [])];
                            next[idx] = { ...next[idx], date: e.target.value };
                            setDraft((d) => ({ ...d, journey: next }));
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                        />
                        <div className="flex gap-2">
                          <select
                            value={m.category}
                            onChange={(e) => {
                              const next = [...(draft.journey || [])];
                              next[idx] = {
                                ...next[idx],
                                category: e.target.value as 'Education' | 'Project' | 'Achievement' | 'Skill',
                              };
                              setDraft((d) => ({ ...d, journey: next }));
                            }}
                            className="flex-1 px-3 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                          >
                            <option value="Education">Education</option>
                            <option value="Project">Project</option>
                            <option value="Achievement">Achievement</option>
                            <option value="Skill">Skill</option>
                          </select>
                          <button
                            type="button"
                            onClick={() =>
                              setDraft((d) => ({
                                ...d,
                                journey: (d.journey || []).filter((_, i) => i !== idx),
                              }))
                            }
                            className="p-2 rounded-xl bg-rose-500/15 text-rose-500 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Milestone Summary"
                        value={m.summary}
                        onChange={(e) => {
                          const next = [...(draft.journey || [])];
                          next[idx] = { ...next[idx], summary: e.target.value };
                          setDraft((d) => ({ ...d, journey: next }));
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => saveMain()}
                  className="btn-primary-gradient px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save Journey Milestones
                </button>
              </div>
            )}

            {/* Tab 6: Achievements */}
            {tab === 'achievements' && (
              <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-xl">
                    Achievements &amp; Certificates
                  </h2>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        achievements: [
                          ...d.achievements,
                          {
                            t: '',
                            d: '',
                            date: '',
                            issuer: '',
                            link: '',
                            videos: [],
                            pics: [],
                          },
                        ],
                      }))
                    }
                    className="px-3.5 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Certificate
                  </button>
                </div>

                <div className="space-y-4">
                  {draft.achievements.map((ach, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-purple-500/20 space-y-3"
                    >
                      <div className="flex flex-wrap gap-2 items-center">
                        <input
                          placeholder="Certificate / Achievement Title"
                          value={ach.t}
                          onChange={(e) => {
                            const next = [...draft.achievements];
                            next[idx] = { ...next[idx], t: e.target.value };
                            setDraft((d) => ({ ...d, achievements: next }));
                          }}
                          className="flex-1 min-w-[200px] px-3.5 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDraft((d) => ({
                              ...d,
                              achievements: d.achievements.filter(
                                (_, i) => i !== idx
                              ),
                            }))
                          }
                          className="p-2 rounded-xl bg-rose-500/15 text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          placeholder="Issuer (e.g. SLIIT / Coursera)"
                          value={ach.issuer || ''}
                          onChange={(e) => {
                            const next = [...draft.achievements];
                            next[idx] = {
                              ...next[idx],
                              issuer: e.target.value,
                            };
                            setDraft((d) => ({ ...d, achievements: next }));
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                        />
                        <input
                          placeholder="Date (e.g. Feb 2025)"
                          value={ach.date || ''}
                          onChange={(e) => {
                            const next = [...draft.achievements];
                            next[idx] = { ...next[idx], date: e.target.value };
                            setDraft((d) => ({ ...d, achievements: next }));
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                        />
                        <input
                          placeholder="Verification Link (https://...)"
                          value={ach.link || ''}
                          onChange={(e) => {
                            const next = [...draft.achievements];
                            next[idx] = { ...next[idx], link: e.target.value };
                            setDraft((d) => ({ ...d, achievements: next }));
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                        />
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Description"
                        value={ach.d}
                        onChange={(e) => {
                          const next = [...draft.achievements];
                          next[idx] = { ...next[idx], d: e.target.value };
                          setDraft((d) => ({ ...d, achievements: next }));
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                      />

                      <div className="flex flex-wrap gap-2">
                        {(ach.pics || []).map((picUrl, j) => (
                          <div
                            key={j}
                            className="relative w-16 h-16 rounded-xl overflow-hidden border border-purple-400/30"
                          >
                            <img
                              src={picUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...draft.achievements];
                                next[idx] = {
                                  ...next[idx],
                                  pics: (next[idx].pics || []).filter(
                                    (_, k) => k !== j
                                  ),
                                };
                                setDraft((d) => ({ ...d, achievements: next }));
                              }}
                              className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2 items-center">
                        <label className="px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          Upload Certificate Image
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            hidden
                            onChange={(e) =>
                              handleItemPicsUpload('achievements', idx, e)
                            }
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={saveAchievements}
                  className="btn-primary-gradient px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save Achievements
                </button>
              </div>
            )}

            {/* Tab 7: Contact, Links & QR */}
            {tab === 'contact' && (
              <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5">
                <h2 className="font-display font-bold text-xl">
                  Contact Channels, Social Links &amp; QR Codes
                </h2>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        phones: [...d.phones, { l: 'Mobile', v: '' }],
                      }))
                    }
                    className="px-3.5 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs font-semibold cursor-pointer"
                  >
                    + Add Phone
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        links: [...d.links, { l: 'Social', u: '' }],
                      }))
                    }
                    className="px-3.5 py-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-xs font-semibold cursor-pointer"
                  >
                    + Add Link
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        qrs: [...d.qrs, { l: 'QR Code', src: '' }],
                      }))
                    }
                    className="px-3.5 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs font-semibold cursor-pointer"
                  >
                    + Add QR Code
                  </button>
                </div>

                {/* Phones */}
                {draft.phones.map((p, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      placeholder="Label"
                      value={p.l || ''}
                      onChange={(e) => {
                        const next = [...draft.phones];
                        next[idx] = { ...next[idx], l: e.target.value };
                        setDraft((d) => ({ ...d, phones: next }));
                      }}
                      className="w-36 px-3 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                    />
                    <input
                      placeholder="Phone number"
                      value={p.v}
                      onChange={(e) => {
                        const next = [...draft.phones];
                        next[idx] = { ...next[idx], v: e.target.value };
                        setDraft((d) => ({ ...d, phones: next }));
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          phones: d.phones.filter((_, i) => i !== idx),
                        }))
                      }
                      className="p-2 rounded-xl bg-rose-500/15 text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Links */}
                {draft.links.map((lk, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      placeholder="Label"
                      value={lk.l || ''}
                      onChange={(e) => {
                        const next = [...draft.links];
                        next[idx] = { ...next[idx], l: e.target.value };
                        setDraft((d) => ({ ...d, links: next }));
                      }}
                      className="w-36 px-3 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                    />
                    <input
                      placeholder="https://..."
                      value={lk.u}
                      onChange={(e) => {
                        const next = [...draft.links];
                        next[idx] = { ...next[idx], u: e.target.value };
                        setDraft((d) => ({ ...d, links: next }));
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          links: d.links.filter((_, i) => i !== idx),
                        }))
                      }
                      className="p-2 rounded-xl bg-rose-500/15 text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* QRs */}
                {draft.qrs.map((qr, idx) => (
                  <div key={idx} className="flex flex-wrap gap-3 items-center">
                    <input
                      placeholder="QR Label"
                      value={qr.l || ''}
                      onChange={(e) => {
                        const next = [...draft.qrs];
                        next[idx] = { ...next[idx], l: e.target.value };
                        setDraft((d) => ({ ...d, qrs: next }));
                      }}
                      className="w-44 px-3 py-2 rounded-xl bg-white/80 dark:bg-black/25 border border-purple-500/20 text-sm"
                    />
                    {qr.src && (
                      <img
                        src={qr.src}
                        alt=""
                        className="w-12 h-12 rounded-lg bg-white p-1 object-contain"
                      />
                    )}
                    <label className="px-3 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs font-semibold cursor-pointer">
                      Upload QR
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => handleQrUpload(idx, e)}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          qrs: d.qrs.filter((_, i) => i !== idx),
                        }))
                      }
                      className="p-2 rounded-xl bg-rose-500/15 text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => saveMain()}
                  className="btn-primary-gradient px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save Contact Settings
                </button>
              </div>
            )}

            {/* Tab 8: Messages Inbox */}
            {tab === 'inbox' && (
              <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5">
                <h2 className="font-display font-bold text-xl">
                  Contact Messages Inbox
                </h2>

                {loadingMessages ? (
                  <p className="text-sm text-slate-500">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No messages submitted yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className="p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-purple-500/20 space-y-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="font-display font-bold text-base text-slate-900 dark:text-white">
                              {m.subject || 'Portfolio Inquiry'}
                            </span>
                            <span className="text-xs font-mono-tech text-purple-600 dark:text-purple-300 block">
                              {m.name} · {m.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {!m.read && m.id && (
                              <button
                                type="button"
                                onClick={async () => {
                                  await markMessageRead(m.id!);
                                  setMessages((prev) =>
                                    prev.map((x) =>
                                      x.id === m.id ? { ...x, read: true } : x
                                    )
                                  );
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-500 text-xs inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Mark Read
                              </button>
                            )}
                            <a
                              href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(
                                m.subject || 'Portfolio Inquiry'
                              )}`}
                              className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-500 text-xs inline-flex items-center gap-1"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              Reply
                            </a>
                            {m.id && (
                              <button
                                type="button"
                                onClick={async () => {
                                  await deleteContactMessage(m.id!);
                                  setMessages((prev) =>
                                    prev.filter((x) => x.id !== m.id)
                                  );
                                }}
                                className="p-1.5 rounded-lg bg-rose-500/15 text-rose-500 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {m.message}
                        </p>
                        <p className="font-mono-tech text-[11px] text-slate-400">
                          {new Date(m.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
