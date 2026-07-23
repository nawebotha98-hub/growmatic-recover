export interface QuoteRow {
  id: string;
  company_id: string;
  customer_name: string;
  quote_number: string | null;
  value_cents: number;
  sent_at: string; // date, ISO
  status: "open" | "won" | "lost";
  outcome_recorded_at: string | null;
  created_at: string;
}

export interface ExceptionRow {
  id: string;
  company_id: string;
  quote_id: string;
  rule_triggered: "stale_no_followup" | "no_recorded_outcome";
  severity: "low" | "medium" | "high";
  days_since_sent: number;
  flagged_at: string;
  assigned_to: string | null;
  resolved_at: string | null;
}

export interface ProfileRow {
  id: string;
  company_id: string;
  full_name: string | null;
  role: "owner" | "staff" | "viewer";
}
