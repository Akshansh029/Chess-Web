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
