export interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  highlight: boolean;
  cta: string;
  features: string[];
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
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
    price: "$29",
    period: "per month",
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
    price: "$99",
    period: "per month",
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
