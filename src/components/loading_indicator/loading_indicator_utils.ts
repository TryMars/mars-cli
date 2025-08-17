export const formatTime = (seconds: number) => {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
};

export const calculateElapsedSeconds = (
  startTime: Date,
  currentTime: Date = new Date(),
): number => {
  return Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
};
