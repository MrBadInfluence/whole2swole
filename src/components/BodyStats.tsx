import { useEffect, useState } from 'react';
import { BodyStatRow } from '../types';

type Props = {
  stats: BodyStatRow[];
  onCreate: (data: Omit<BodyStatRow, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdate: (id: string, data: Omit<BodyStatRow, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  editing?: BodyStatRow | null;
  onStartEdit: (s: BodyStatRow) => void;
  onCancelEdit: () => void;
};

function todayYYYYMMDD() {
  return new Date().toISOString().slice(0, 10);
}

function numOrNull(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export default function BodyStats({
  stats,
  onCreate,
  onUpdate,
  editing,
  onStartEdit,
  onCancelEdit,
}: Props) {
  const [date, setDate] = useState(todayYYYYMMDD());
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [arms, setArms] = useState('');
  const [legs, setLegs] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadFrom = (s: BodyStatRow) => {
    setDate(s.date);
    setWeight(s.weight?.toString() ?? '');
    setBodyFat(s.body_fat?.toString() ?? '');
    setChest(s.measurements?.chest?.toString() ?? '');
    setWaist(s.measurements?.waist?.toString() ?? '');
    setHips(s.measurements?.hips?.toString() ?? '');
    setArms(s.measurements?.arms?.toString() ?? '');
    setLegs(s.measurements?.legs?.toString() ?? '');
    setNotes(s.notes ?? '');
  };

  const reset = () => {
    setDate(todayYYYYMMDD());
    setWeight('');
    setBodyFat('');
    setChest('');
    setWaist('');
    setHips('');
    setArms('');
    setLegs('');
    setNotes('');
  };

  useEffect(() => {
    if (editing) loadFrom(editing);
  }, [editing]);

  const submit = async () => {
    setMsg(null);

    const measurements = {
      chest: numOrNull(chest) ?? undefined,
      waist: numOrNull(waist) ?? undefined,
      hips: numOrNull(hips) ?? undefined,
      arms: numOrNull(arms) ?? undefined,
      legs: numOrNull(legs) ?? undefined,
    };

    // remove empty measurements
    const hasAny =
      measurements.chest != null ||
      measurements.waist != null ||
      measurements.hips != null ||
      measurements.arms != null ||
      measurements.legs != null;

    const data = {
      date,
      weight: numOrNull(weight),
      body_fat: numOrNull(bodyFat),
      measurements: hasAny ? measurements : {},
      notes: notes.trim() ? notes.trim() : null,
    };

    setBusy(true);
    try {
      if (editing) {
        await onUpdate(editing.id, data as any);
        setMsg('Saved changes ✅');
      } else {
        await onCreate(data as any);
        setMsg('Entry saved ✅');
        reset();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <div className="header" style={{ marginBottom: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Body Stats</h2>
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
          <label className="small">Weight</label>
          <input value={weight} onChange={(e) => setWeight(e.target.value)} inputMode="decimal" placeholder="82.5" />
        </div>
        <div>
          <label className="small">Body fat %</label>
          <input value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} inputMode="decimal" placeholder="18.2" />
        </div>
      </div>

      <div style={{ marginTop: 10 }} className="row">
        <div>
          <label className="small">Chest</label>
          <input value={chest} onChange={(e) => setChest(e.target.value)} inputMode="decimal" />
        </div>
        <div>
          <label className="small">Waist</label>
          <input value={waist} onChange={(e) => setWaist(e.target.value)} inputMode="decimal" />
        </div>
        <div>
          <label className="small">Hips</label>
          <input value={hips} onChange={(e) => setHips(e.target.value)} inputMode="decimal" />
        </div>
        <div>
          <label className="small">Arms</label>
          <input value={arms} onChange={(e) => setArms(e.target.value)} inputMode="decimal" />
        </div>
        <div>
          <label className="small">Legs</label>
          <input value={legs} onChange={(e) => setLegs(e.target.value)} inputMode="decimal" />
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <label className="small">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional…" />
      </div>

      <div style={{ marginTop: 12 }} className="row">
        <button onClick={submit} disabled={busy}>
          {busy ? 'Saving…' : editing ? 'Save changes' : 'Save entry'}
        </button>
      </div>

      <h3 style={{ marginTop: 18 }}>Entries</h3>
      <div className="small">Edit is allowed. Delete is blocked.</div>

      <div style={{ marginTop: 10 }} className="list">
        {stats.length === 0 ? (
          <div className="listItem">
            <div className="small">No entries yet.</div>
          </div>
        ) : (
          stats.map((s) => (
            <div key={s.id} className="listItem">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{new Date(s.date).toLocaleDateString()}</div>
                  <div className="small">
                    Weight: {s.weight ?? '—'} • Body fat: {s.body_fat ?? '—'}
                  </div>
                </div>
                <button onClick={() => onStartEdit(s)} style={{ width: 120 }}>
                  Edit
                </button>
              </div>

              {s.notes ? <div className="small" style={{ marginTop: 8 }}>Notes: {s.notes}</div> : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
