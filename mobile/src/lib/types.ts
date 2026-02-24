export interface Goal {
  id: string;
  userId: string;
  weeklyWorkouts: number;
  weeklyStudyHours: number;
  dailySleepHours: number;
  dailyCalorieTarget: number;
  createdAt: string;
  updatedAt: string;
}

export interface Workout {
  id: string;
  userId: string;
  name: string;
  type: string;
  durationMin: number;
  notes?: string;
  loggedAt: string;
  createdAt: string;
}

export interface StudySession {
  id: string;
  userId: string;
  subject: string;
  durationMin: number;
  notes?: string;
  loggedAt: string;
  createdAt: string;
}

export interface SleepLog {
  id: string;
  userId: string;
  hours: number;
  quality: number;
  notes?: string;
  loggedAt: string;
  createdAt: string;
}

export interface CalorieLog {
  id: string;
  userId: string;
  foodName: string;
  calories: number;
  meal: string;
  notes?: string;
  loggedAt: string;
  createdAt: string;
}

export interface DashboardData {
  goal: Goal;
  today: {
    calories: number;
    sleepHours: number | null;
    calorieEntries: CalorieLog[];
  };
  week: {
    workouts: number;
    studyHours: number;
  };
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  goal: Goal | null;
  summary: {
    workoutsCompleted: number;
    studyHours: number;
    avgSleepHours: number;
    avgDailyCalories: number;
    totalCalories: number;
  };
  workouts: Workout[];
  studySessions: StudySession[];
  sleepLogs: SleepLog[];
  calorieLogs: CalorieLog[];
}
