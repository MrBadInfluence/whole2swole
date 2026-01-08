import { useEffect, useMemo, useState } from 'react';
import SoloAuth from './auth/SoloAuth';
import { supabase } from './lib/supabaseClient';
import Dashboard from './components/Dashboard';
import WorkoutLogger from './components/WorkoutLogger';
import WorkoutHistory from './components/WorkoutHistory';
import BodyStats from './components/BodyStats';
import { BodyStatRow, WorkoutRow } from './types';

type Tab = 'dashboard' | 'log' | 'history' | 'stats';

export default function App() {
  const [ready, setReady] = useState(false);
  const [sessionExists, setSessionExists] = useState(false);

  const [tab, setTab] = useState<Tab>('dashboard');
  const [workouts, setWorkouts] = useState<WorkoutRow[]>([]);
  const [stats, setStats] = useState<BodyStatRow[]>([]);

  const [editingWorkout, setEditingWorkout] = useState<WorkoutRow | null>(null);
  const [editingStat, setEditingStat] = useState<BodyStatRow | null>(null);

  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setError(null);

    const { data: w, error: wErr } = await supabase
      .from('workouts')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (wErr) {
      setError(wErr.message);
      return;
    }

    const { data: s, error: sErr } = await supabase
      .from('body_stats')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (sErr) {
      setError(sErr.message);
      return;
    }

    setWorkouts((w ?? []) as any);
    setStats((s ?? []) as any);
  };

  useEffect(() => {
    // initial session check
    supabase.auth.getSession().then(({ data }) => {
      setSessionExists(!!data.session);
      setReady(true);
      if (data.session) refresh();
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionExists(!!session);
      setReady(true);
      if (session) refresh();
      else {
        setWorkouts([]);
        setStats([]);
        setEditingWorkout(null);
        setEditingStat(null);
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const tabs = useMemo(() => {
    return [
      { id: 'dashboard' as const, label: 'Dashboard' },
      { id: 'log' as const, label: editingWorkout ? 'Edit Workout' : 'Log Workout' },
      { id: 'history' as const, label: 'History' },
      { id: 'stats' as const, label: 'Body Stats' },
    ];
  }, [editingWorkout]);

  const createWorkout = async (data: Omit<WorkoutRow, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase.from('workouts').insert([data as any]);
    if (error) {
      setError(error.message);
      return;
    }
    await refresh();
  };

  const updateWorkout = async (id: string, data: Omit<WorkoutRow, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase.from('workouts').update(data as any).eq('id', id);
    if (error) {
      setError(error.message);
      return;
    }
    setEditingWorkout(null);
    await refresh();
  };

  const createStat = async (data: Omit<BodyStatRow, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase.from('body_stats').insert([data as any]);
    if (error) {
      setError(error.message);
      return;
    }
    await refresh();
  };

  const updateStat = async (id: string, data: Omit<BodyStatRow, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase.from('body_stats').update(data as any).eq('id', id);
    if (error) {
      setError(error.message);
      return;
    }
    setEditingStat(null);
    await refresh();
  };

  if (!ready) {
    return (
      <div className="container">
        <div className="card">Loading…</div>
      </div>
    );
  }

  if (!sessionExists) {
    return <SoloAuth onSignedIn={() => setTab('dashboard')} />;
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1 className="title">Whole2Swole • Workout Tracker</h1>
          <p className="sub">Personal-only. 1 row per workout. No deletes.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="secondary" onClick={refresh} style={{ width: 120 }}>
            Refresh
          </button>
          <button className="secondary" onClick={signOut} style={{ width: 120 }}>
            Sign out
          </button>
        </div>
      </div>

      {error ? <div className="error" style={{ marginBottom: 12 }}>{error}</div> : null}

      <div className="tabs">
        {tabs.map((t) => (
          <div
            key={t.id}
            className={'tab' + (tab === t.id ? ' active' : '')}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </div>
        ))}
      </div>

      {tab === 'dashboard' && <Dashboard workouts={workouts} bodyStats={stats} />}

      {tab === 'log' && (
        <WorkoutLogger
          onCreate={createWorkout}
          onUpdate={updateWorkout}
          editing={editingWorkout}
          onCancelEdit={() => setEditingWorkout(null)}
        />
      )}

      {tab === 'history' && (
        <WorkoutHistory
          workouts={workouts}
          onEdit={(w) => {
            setEditingWorkout(w);
            setTab('log');
          }}
        />
      )}

      {tab === 'stats' && (
        <BodyStats
          stats={stats}
          onCreate={createStat}
          onUpdate={updateStat}
          editing={editingStat}
          onStartEdit={(s) => setEditingStat(s)}
          onCancelEdit={() => setEditingStat(null)}
        />
      )}
    </div>
  );
}
