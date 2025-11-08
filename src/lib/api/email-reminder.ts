import { http } from "../http";

export type EmailReminderResponse = {
  userEmail: string;
  scheduleTime: string;
};

export const setEmailReminder = async (
  scheduleTime: string
): Promise<EmailReminderResponse> => {
  try {
    const res = await http.post<EmailReminderResponse>("/email/schedule", {
      scheduleTime,
    });
    if (!res.data) {
      throw new Error("No data returned from email schedule API");
    }
    return res.data;
  } catch (err: any) {
    console.error(
      "Email reminder scheduling failed:",
      err.response?.status,
      err.response?.data
    );
    throw err;
  }
};
