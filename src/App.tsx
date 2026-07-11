import { loadUser, saveUser } from './shared/users';
import { useState, useEffect, useCallback } from 'react';
import { Hobby, HobbyGoals, HobbyLedgerSettings, HobbyLog, User } from './types';
import {
  subscribeHobbies, subscribeLogs, subscribeSettings,
  saveHobby, deleteHobby, saveLog, deleteLog, saveSettings,
} from './utils/storage';
import { notifyLogAdded } from './utils/notify';
import UserSelectScreen from './components/UserSelectScreen';
import HobbyListScreen from './components/HobbyListScreen';
import HobbyDetailScreen from './components/HobbyDetailScreen';
import AddLogScreen from './components/AddLogScreen';
import DashboardScreen from './components/DashboardScreen';
import YearlySummaryScreen from './components/YearlySummaryScreen';
import AddHobbyModal from './components/AddHobbyModal';
import SettingsModal from './components/SettingsModal';
import Toast from './components/Toast';

type Screen = 'userSelect' | 'hobbyList' | 'hobbyDetail' | 'addLog' | 'dashboard' | 'yearSummary';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadUser());
  const [screen, setScreen] = useState<Screen>('userSelect');
  const [selectedHobbyId, setSelectedHobbyId] = useState<string | null>(null);
  const [editLogId, setEditLogId] = useState<string | null>(null);
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [logs, setLogs] = useState<HobbyLog[]>([]);
  const [settings, setSettings] = useState<HobbyLedgerSettings>({ ntfyTopic: '' });
  const [loading, setLoading] = useState(true);
  const [showAddHobby, setShowAddHobby] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const unsubHobbies = subscribeHobbies(
      items => { setHobbies(items); setLoading(false); },
      () => { setLoading(false); setToast('DB接続エラーが発生しました'); }
    );
    const unsubLogs = subscribeLogs(items => setLogs(items));
    const unsubSettings = subscribeSettings(s => setSettings(s));
    return () => { unsubHobbies(); unsubLogs(); unsubSettings(); };
  }, []);

  const handleSelectUser = (user: User) => {
    saveUser(user);
    setCurrentUser(user);
    setScreen('hobbyList');
  };

  const handleSelectHobby = (id: string) => {
    setSelectedHobbyId(id);
    setEditLogId(null);
    setScreen('hobbyDetail');
  };

  const handleAddHobby = useCallback(async (hobby: Hobby) => {
    try { await saveHobby(hobby); } catch { setToast('保存に失敗しました'); }
  }, []);

  const handleDeleteHobby = useCallback(async (hobbyId: string) => {
    try {
      await deleteHobby(hobbyId);
      await Promise.all(logs.filter(l => l.hobbyId === hobbyId).map(l => deleteLog(l.id)));
      setSelectedHobbyId(null);
      setScreen('hobbyList');
    } catch { setToast('削除に失敗しました'); }
  }, [logs]);

  const handleUpdateTags = useCallback(async (tags: string[]) => {
    const hobby = hobbies.find(h => h.id === selectedHobbyId);
    if (!hobby) return;
    try { await saveHobby({ ...hobby, tags }); } catch { setToast('保存に失敗しました'); }
  }, [hobbies, selectedHobbyId]);

  const handleUpdateGoals = useCallback(async (goals: HobbyGoals) => {
    const hobby = hobbies.find(h => h.id === selectedHobbyId);
    if (!hobby) return;
    try { await saveHobby({ ...hobby, goals }); } catch { setToast('保存に失敗しました'); }
  }, [hobbies, selectedHobbyId]);

  const handleSaveLog = useCallback(async (log: HobbyLog) => {
    try {
      await saveLog(log);
      setEditLogId(null);
      setScreen('hobbyDetail');
      if (settings.ntfyTopic && currentUser) {
        const hobby = hobbies.find(h => h.id === log.hobbyId);
        if (hobby) {
          notifyLogAdded(log.user, hobby.name, log.title, log.duration, settings.ntfyTopic).catch(() => {});
        }
      }
    } catch { setToast('保存に失敗しました'); }
  }, [settings, currentUser, hobbies]);

  const handleDeleteLog = useCallback(async (logId: string) => {
    try { await deleteLog(logId); } catch { setToast('削除に失敗しました'); }
  }, []);

  const handleSaveSettings = useCallback(async (s: HobbyLedgerSettings) => {
    try { await saveSettings(s); } catch { setToast('保存に失敗しました'); }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #f5f3ff 0%, #ecfdf5 100%)' }}>
        <div className="text-center">
          <div className="text-5xl mb-3 animate-pulse">📒</div>
          <p className="text-gray-400 text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  const selectedHobby = selectedHobbyId ? hobbies.find(h => h.id === selectedHobbyId) : undefined;
  const selectedHobbyLogs = selectedHobbyId ? logs.filter(l => l.hobbyId === selectedHobbyId) : [];
  const editLog = editLogId ? logs.find(l => l.id === editLogId) : undefined;

  return (
    <>
      {screen === 'userSelect' && (
        <UserSelectScreen onSelect={handleSelectUser} />
      )}
      {screen === 'hobbyList' && currentUser && (
        <HobbyListScreen
          currentUser={currentUser}
          hobbies={hobbies}
          logs={logs}
          onSelectHobby={handleSelectHobby}
          onAddHobby={() => setShowAddHobby(true)}
          onDashboard={() => setScreen('dashboard')}
          onSwitchUser={() => { setCurrentUser(null); setScreen('userSelect'); }}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}
      {screen === 'hobbyDetail' && selectedHobby && (
        <HobbyDetailScreen
          hobby={selectedHobby}
          logs={selectedHobbyLogs}
          currentUser={currentUser!}
          onBack={() => setScreen('hobbyList')}
          onAddLog={() => { setEditLogId(null); setScreen('addLog'); }}
          onEditLog={id => { setEditLogId(id); setScreen('addLog'); }}
          onDeleteLog={handleDeleteLog}
          onDeleteHobby={() => handleDeleteHobby(selectedHobby.id)}
          onUpdateTags={handleUpdateTags}
          onUpdateGoals={handleUpdateGoals}
        />
      )}
      {screen === 'addLog' && selectedHobby && currentUser && (
        <AddLogScreen
          currentUser={currentUser}
          hobby={selectedHobby}
          editLog={editLog}
          onSave={handleSaveLog}
          onBack={() => { setEditLogId(null); setScreen('hobbyDetail'); }}
        />
      )}
      {screen === 'dashboard' && (
        <DashboardScreen
          hobbies={hobbies}
          logs={logs}
          onBack={() => setScreen('hobbyList')}
          onYearlySummary={() => setScreen('yearSummary')}
        />
      )}
      {screen === 'yearSummary' && (
        <YearlySummaryScreen
          hobbies={hobbies}
          logs={logs}
          onBack={() => setScreen('dashboard')}
        />
      )}
      {showAddHobby && (
        <AddHobbyModal onSave={handleAddHobby} onClose={() => setShowAddHobby(false)} />
      )}
      {showSettings && (
        <SettingsModal settings={settings} onSave={handleSaveSettings} onClose={() => setShowSettings(false)} />
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
