import api from "./api";

export interface Badge {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon_url: string | null;
  category: string;
  criteria_json: string | null;
  xp_reward: number;
}

export interface UserBadge {
  id: number;
  badge_id: number;
  badge: Badge;
  earned_at: string;
  displayed_on_profile: boolean;
}

export interface Streak {
  streak_type: string;
  current_count: number;
  max_count: number;
  last_activity_date: string | null;
}

export interface CalendarDay {
  date: string;
  active: boolean;
  is_today: boolean;
}

export interface CheckinResponse {
  streak: Streak;
  calendar: CalendarDay[];
  xp_bonus: number;
}

export interface CheckResponse {
  awarded: Badge[];
}

export const achievementsApi = {
  list: (category?: string) =>
    api.get<Badge[]>("/achievements", { params: { category } }),

  my: () => api.get<UserBadge[]>("/achievements/my"),

  userBadges: (userId: number) =>
    api.get<UserBadge[]>(`/achievements/user/${userId}`),

  check: (triggerType: string, context?: Record<string, unknown>) =>
    api.post<CheckResponse>("/achievements/check", {
      trigger_type: triggerType,
      context,
    }),

  streaks: () => api.get<Streak[]>("/achievements/streaks"),

  checkin: (streakType: string = "login_daily") =>
    api.post<CheckinResponse>("/achievements/streaks/checkin", null, {
      params: { streak_type: streakType },
    }),
};
