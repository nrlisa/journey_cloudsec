
export const getDaysDiff = (start: Date, end: Date): number => {
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const diffTime = endDay.getTime() - startDay.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
};

export const calculateDebt = (
  startDateStr: string,
  labsCompleted: number,
  isExamMode: boolean,
  examModeStartDateStr: string | null,
  accumulatedExamDays: number
): number => {
  const now = new Date();
  const startDate = new Date(startDateStr);
  
  // Total calendar days elapsed since start (including day 0)
  const totalDaysPassed = getDaysDiff(startDate, now) + 1;
  
  // Calculate current session of exam mode if active
  let currentExamSessionDays = 0;
  if (isExamMode && examModeStartDateStr) {
    currentExamSessionDays = getDaysDiff(new Date(examModeStartDateStr), now);
  }
  
  const totalExamDays = accumulatedExamDays + currentExamSessionDays;
  
  // Effective days where a lab was expected
  const effectiveLearningDays = Math.max(0, totalDaysPassed - totalExamDays);
  
  // Debt = Target labs (1 per day) - Actual labs completed
  return Math.max(0, effectiveLearningDays - labsCompleted);
};

// Fixed to use timestamp instead of non-existent completedAt property on Lab objects
export const getLabsThisWeek = (labs: { timestamp: string }[]): number => {
  const now = new Date();
  const startOfWeek = new Date(now);
  // Set to last Sunday
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  return labs.filter(lab => new Date(lab.timestamp) >= startOfWeek).length;
};
