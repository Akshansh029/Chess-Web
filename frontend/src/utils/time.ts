export const formatToIST = (utcString: string | undefined) => {
  if (!utcString) return "N/A";
  try {
    const date = new Date(utcString);
    if (isNaN(date.getTime())) {
      return utcString;
    }
    return date.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return utcString;
  }
};

export const formatTime = (ms: number): string => {
  if (ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (ms < 10000) {
    // Under 10 seconds: show tenths of a second
    const tenths = Math.floor((ms % 1000) / 100);
    return `${seconds}.${tenths}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const getWarningThresholdMs = (timeControl?: string | null): number => {
  if (!timeControl) return 20000; // default fallback

  const parts = timeControl.split("+");
  const minutes = parseInt(parts[0], 10);
  if (isNaN(minutes)) return 20000;

  if (minutes <= 1) {
    return 10000; // <= 10s for 1 min games
  }
  if (minutes <= 5) {
    return 20000; // <= 20s for 3 and 5 mins
  }
  return 30000; // <= 30s for 10 and 15 mins
};
