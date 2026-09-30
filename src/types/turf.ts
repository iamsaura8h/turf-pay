export type Match = {
  id: string;
  title: string;
  played_on: string;
  total_cost: number;
  per_person?: number;
};

export type Player = {
  id: string;
  name: string;
  cash: number;
  upi: number;
  amount: number;
  pay_type: PaymentType;
  partner?: string | null;
  owed?: number | null;
};

export type PaymentType = "cash" | "upi" | "later" | "split";

export type MatchWithStats = Match & {
  collected: number;
  count: number;
  pending: number;
};

export const PAYMENT_LABELS: Record<PaymentType, string> = {
  cash: "Cash",
  upi: "UPI",
  later: "Pay Later",
  split: "Split",
};

export const PAYMENT_TONES: Record<PaymentType, string> = {
  cash: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  upi: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
  later: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
  split: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20",
};

export const formatCurrency = (n: number) => `₹${Math.round(n * 100) / 100}`;
