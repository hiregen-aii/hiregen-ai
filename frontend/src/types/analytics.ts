// Mirrors `analytics_daily` / `analytics_monthly` tables exactly.

export interface AnalyticsDaily {
  id: string;
  report_date: string;
  total_leads: number;
  emails_sent: number;
  meetings_booked: number;
}

export interface AnalyticsMonthly {
  id: string;
  report_month: string;
  total_leads: number;
  emails_sent: number;
  meetings_booked: number;
}