import { useEffect, useState } from 'react';
import { Exercise, WorkoutRow } from '../types';

type Props = {
  onCreate: (data: Omit<WorkoutRow, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdate: (id: string, data: Omit<WorkoutRow, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  editing?: WorkoutRow | null;
  onCancelEdit: () => void;
};

function todayYYYYMMDD() {
  return new Date().toISOString().slice(0, 10);
}

const blankExercise = (): Exercise => ({ name: '', sets: 3, reps: 10, weight: 0, notes: '' });

export default function WorkoutLogger({ onCreate, onUpdate, editing, onCancelEdit }: Props) {
  const [date, setDate] = useState(todayYYYYMMDD());
  const [title, setTitle] = useState('Workout');
  const [duration, setDuration] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([blankExercise()]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editing) {
      setDate(editing.date);
      setTitle(editing.title);
      setDuration(editing.duration?.toString() ?? '');
      setNotes(editing.notes ?? '');
      setExercises(editing.exercises?.length ? editing.exercises : [blankExercise()]);
    } else {
      // keep current values when not editing
    }
  }, [editing]);

  const addExercise = () => setExercises((p) => [...p, blankExercise()]);
  const removeExercise = (idx: number) => {
    setExercises((p) => (p.length <= 1 ? p : p.filter((_, i) => i !== idx)));
  };

  const updateExercise = (idx: number, patch: Partial<Exercise>) => {
    setExercises((p) => p.map((e, i) => (i === idx ? { ...e, ...patch } : e)));
  };

  const submit = async () => {
    setMsg(null);

    const cleaned = exercises
      .map((e) => ({
        ...e,
        name: e.name.trim(),
        notes: e.notes?.trim() || undefined,
      }))
      .filter((e) => e.name.length > 0);

    if (!title.trim()) {
      setMsg('Please give your workout a title.');
      return;
    }
    if (cleaned.length === 0) {
      setMsg('Add at least one exercise name (like “Bench Press”).');
      return;
    }

    const data = {
      date,
      title: title.trim(),
      duration: duration.trim() ? Number(duration) : null,
      notes: notes.trim() ? notes.trim() : null,
      exercises: cleaned,
    };

    setBusy(true);
    try {
      if (editing) {
        await onUpdate(editing.id, data as any);
        setMsg('Saved changes ✅');
      } else {
        await onCreate(data as any);
        setMsg('Workout saved ✅');
        // reset
        setDate(todayYYYYMMDD());
        setTitle('Workout');
        setDuration('');
        setNotes('');
        setExercises([blankExercise()]);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <div className="header" style={{ marginBottom: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>{editing ? 'Edit Workout' : 'Log Workout'}</h2>
          <div className="small">CRU only (no delete).</div>
        </div>
        {editing ? (
          <button className="secondary" onClick={onCancelEdit} disabled={busy} style={{ width: 160 }}>
            Cancel edit
          </button>
        ) : null}
      </div>

      {msg ? <div className={msg.includes('✅') ? 'success' : 'error'} style={{ marginBottom: 12 }}>{msg}</div> : null}

      <div className="row">
        <div>
          <label className="small">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="small">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Push Day" />
        </div>
        <div>
          <label className="small">Duration (minutes)</label>
          <input
            value={duration}
            onChange={(e) => setDuration(e.target.value.replace(/\D/g, '').slice(0, 4))}
            inputMode="numeric"
            placeholder="45"
          />
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <label className="small">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes…" />
      </div>

      <div style={{ marginTop: 14 }}>
        <h3 style={{ margin: '0 0 8px' }}>Exercises</h3>
        <div className="list">
          {exercises.map((ex, idx) => (
            <div key={idx} className="listItem">
              <div className="row">
                <div>
                  <label className="small">Name</label>
                  <input
                    value={ex.name}
                    onChange={(e) => updateExercise(idx, { name: e.target.value })}
                    placeholder="Bench Press"
                  />
                </div>
                <div>
                  <label className="small">Sets</label>
                  <input
                    value={ex.sets}
                    onChange={(e) => updateExercise(idx, { sets: Number(e.target.value || 0) })}
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="small">Reps</label>
                  <input
                    value={ex.reps}
                    onChange={(e) => updateExercise(idx, { reps: Number(e.target.value || 0) })}
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="small">Weight</label>
                  <input
                    value={ex.weight}
                    onChange={(e) => updateExercise(idx, { weight: Number(e.target.value || 0) })}
                    inputMode="decimal"
                  />
                </div>
              </div>

              <div style={{ marginTop: 8 }}>
                <label className="small">Exercise notes</label>
                <input
                  value={ex.notes ?? ''}
                  onChange={(e) => updateExercise(idx, { notes: e.target.value })}
                  placeholder="Optional…"
                />
              </div>

              <div style={{ marginTop: 10 }} className="row">
                <button
                  className="secondary"
                  onClick={() => removeExercise(idx)}
                  disabled={busy}
                  style={{ width: 180 }}
                >
                  Remove exercise
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 10 }} className="row">
          <button className="secondary" onClick={addExercise} disabled={busy} style={{ width: 220 }}>
            + Add exercise
          </button>
        </div>
      </div>

      <div style={{ marginTop: 14 }} className="row">
        <button onClick={submit} disabled={busy}>
          {busy ? 'Saving…' : editing ? 'Save changes' : 'Save workout'}
        </button>
      </div>
    </div>
  );
}
