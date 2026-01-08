import { WorkoutRow } from '../types';

type Props = {
  workouts: WorkoutRow[];
  onEdit: (w: WorkoutRow) => void;
};

export default function WorkoutHistory({ workouts, onEdit }: Props) {
  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>History</h2>
      <div className="small">Tap “Edit” to change a workout. There is no delete.</div>

      <div style={{ marginTop: 12 }} className="list">
        {workouts.length === 0 ? (
          <div className="listItem">
            <div className="small">No workouts yet.</div>
          </div>
        ) : (
          workouts.map((w) => (
            <div key={w.id} className="listItem">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{w.title}</div>
                  <div className="small">
                    {new Date(w.date).toLocaleDateString()} • {w.exercises?.length ?? 0} exercises
                    {w.duration ? ` • ${w.duration} min` : ''}
                  </div>
                </div>
                <button onClick={() => onEdit(w)} style={{ width: 120 }}>
                  Edit
                </button>
              </div>

              {w.notes ? (
                <div className="small" style={{ marginTop: 8 }}>
                  Notes: {w.notes}
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
