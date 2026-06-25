import { create } from "zustand";

type Status = "idle" | "loading" | "success" | "error";

type WaitlistState = {
  status: Status;
  message: string;
  position: number | null;
  alreadyJoined: boolean;
  join: (email: string, segment?: string, tenants?: string) => Promise<void>;
  reset: () => void;
};

export const useWaitlist = create<WaitlistState>((set) => ({
  status: "idle",
  message: "",
  position: null,
  alreadyJoined: false,

  join: async (email, segment, tenants) => {
    set({ status: "loading", message: "" });
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, segment, tenants }),
      });
      const data = await res.json();

      if (!res.ok) {
        set({
          status: "error",
          message: data.error ?? "Something went wrong. Please try again.",
        });
        return;
      }

      set({
        status: "success",
        position: data.position ?? null,
        alreadyJoined: Boolean(data.alreadyJoined),
        message: data.alreadyJoined
          ? "You're already on the list — we'll be in touch."
          : "You're on the list!",
      });
    } catch {
      set({
        status: "error",
        message: "Network error. Please check your connection and try again.",
      });
    }
  },

  reset: () => set({ status: "idle", message: "", position: null, alreadyJoined: false }),
}));
