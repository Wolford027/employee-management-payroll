export interface PricingTier {
  name: string;
  /** Monthly price in USD. `null` = custom / contact sales. */
  monthly: number | null;
  description: string;
  highlight: boolean;
  cta: string;
  features: string[];
}

/** Annual billing applies a 20% discount (≈ 2 months free), shown as a per-month figure. */
export const ANNUAL_DISCOUNT = 0.2;

export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Starter",
    monthly: 0,
    description: "Perfect for small teams getting started.",
    highlight: false,
    cta: "Start for free",
    features: [
      "Up to 10 employees",
      "Employee profiles & CRUD",
      "Department & position management",
      "Attendance tracking",
      "Leave management",
      "Email support",
    ],
  },
  {
    name: "Professional",
    monthly: 29,
    description: "Everything you need to run payroll smoothly.",
    highlight: true,
    cta: "Start free trial",
    features: [
      "Up to 100 employees",
      "Everything in Starter",
      "Full payroll generation",
      "PDF payslip download",
      "Allowances & deductions",
      "Role-based access control",
      "Priority email support",
    ],
  },
  {
    name: "Enterprise",
    monthly: null,
    description: "Unlimited scale with dedicated support.",
    highlight: false,
    cta: "Contact sales",
    features: [
      "Unlimited employees",
      "Everything in Professional",
      "Custom payroll cycles",
      "Multi-department reporting",
      "Audit logs & compliance",
      "Dedicated account manager",
      "SLA-backed support",
    ],
  },
];

export type Billing = "monthly" | "annual";

/** Resolve the displayed price + period for a tier under a billing cycle. */
export function priceFor(tier: PricingTier, billing: Billing): { price: string; period: string } {
  if (tier.monthly === null) return { price: "Custom", period: "contact us" };
  if (tier.monthly === 0) return { price: "$0", period: "forever" };
  const amount =
    billing === "annual" ? Math.round(tier.monthly * (1 - ANNUAL_DISCOUNT)) : tier.monthly;
  return { price: `$${amount}`, period: billing === "annual" ? "per mo, billed yearly" : "per month" };
}
