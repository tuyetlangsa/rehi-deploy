export const LocalStorageService = {
  updateLastUpdateTime(createdAt: number) {
    try {
      const prev = Number(localStorage.getItem("lastUpdateTime") || "0");
      if (typeof createdAt === "number" && createdAt > prev) {
        localStorage.setItem("lastUpdateTime", String(createdAt));
      }
    } catch (e) {
      console.error(e);
      // Ignore when localStorage is not available (e.g. server-side or restricted environments)
    }
  },
};
