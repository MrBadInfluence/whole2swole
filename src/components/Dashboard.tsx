import { WorkoutRow, BodyStatRow } from '../types';

type Props = {
  workouts: WorkoutRow[];
  bodyStats: BodyStatRow[];
};

export default function Dashboard({ workouts, bodyStats }: Props) {
  const latestWorkout = workouts[0];
  const latestStat = bodyStats[0];

  const totalWorkouts = workouts.length;
  const lastTitle = latestWorkout ? latestWorkout.title : '—';
  const lastWeight = latestStat?.weight ?? null;

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Dashboard</h2>

      <div className="kpi">
        <div className="kpiBox">
          <div className="kpiLabel">Total workouts</div>
          <div className="kpiValue">{totalWorkouts}</div>
        </div>

        <div className="kpiBox">
          <div className="kpiLabel">Latest workout</div>
          <div className="kpiValue" style={{ fontSize: 18 }}>{lastTitle}</div>
          <div className="small" style={{ marginTop: 6 }}>
            {latestWorkout ? new Date(latestWorkout.date).toLocaleDateString() : ''}
          </div>
        </div>

        <div className="kpiBox">
          <div className="kpiLabel">Latest weight</div>
          <div className="kpiValue">{lastWeight ?? '—'}</div>
          <div className="small" style={{ marginTop: 6 }}>
            {latestStat ? new Date(latestStat.date).toLocaleDateString() : ''}
          </div>
        </div>
      </div>

      <div className="small" style={{ marginTop: 12 }}>
        Tip: Use “History” to edit past workouts. There is **no delete**.
      </div>
    </div>
  );
}
