export type Exercise = {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  notes?: string;
};

export type WorkoutRow = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  duration: number | null;
  notes: string | null;
  exercises: Exercise[];
  created_at: string;
  updated_at: string;
};

export type BodyStatRow = {
  id: string;
  date: string;
  weight: number | null;
  body_fat: number | null;
  measurements: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    legs?: number;
  };
  notes: string | null;
  created_at: string;
  updated_at: string;
};
