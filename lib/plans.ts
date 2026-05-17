// PLACEHOLDER - replace with verified data before production launch

export type Plan = {
  id: string;
  hmo: string;
  planName: string;
  tier: "budget" | "mid" | "upper-mid" | "premium";
  monthlyPremium: number;
  annualBenefitLimit: string;
  statesCovered: string[];
  keyHospitals: string[];
  outpatientCover: string;
  inpatientCover: string;
  maternityCover: string;
  chronicConditionPolicy: string;
  preExistingWaitingPeriodMonths: number;
  topFor: string;
  enrollUrl: string;
};

// PLACEHOLDER - replace with verified data
export const PLANS: Plan[] = [
  // ── Bastion HMO — Jade ────────────────────────────────────────────────────
  // Real published price: ₦23,500/year (≈ ₦1,958/month). VERIFY current pricing.
  {
    id: "bastion_jade",
    hmo: "Bastion HMO",
    planName: "Jade",
    tier: "budget",
    monthlyPremium: 1958,
    annualBenefitLimit: "₦500,000",
    statesCovered: ["Lagos", "FCT (Abuja)", "Rivers", "Ogun", "Oyo"],
    keyHospitals: [
      "Reddington Hospital Lagos",
      "National Hospital Abuja",
      "Braithwaite Memorial Specialist Hospital Port Harcourt",
    ],
    outpatientCover:
      "GP consultations, basic investigations, generic medications up to formulary limit",
    inpatientCover:
      "Up to ₦300,000 per admission; ward-level accommodation; excludes elective surgery",
    maternityCover: "Not covered on Jade tier. VERIFY with Bastion before enrolling.",
    chronicConditionPolicy:
      "Basic chronic disease support. VERIFY which conditions are covered — waiting periods likely apply.",
    preExistingWaitingPeriodMonths: 3,
    topFor:
      "Young, healthy individuals on a very tight budget who mainly need routine GP visits",
    enrollUrl: "https://bastionhmo.com/plans",
  },

  // ── Reliance HMO — Classic ────────────────────────────────────────────────
  // PLACEHOLDER pricing — VERIFY current rates with Reliance HMO directly.
  {
    id: "reliance_classic",
    hmo: "Reliance HMO",
    planName: "Classic",
    tier: "mid",
    monthlyPremium: 6500,
    annualBenefitLimit: "₦1,500,000",
    statesCovered: [
      "Lagos", "FCT (Abuja)", "Rivers", "Ogun", "Oyo", "Kano", "Kaduna",
      "Delta", "Enugu", "Edo", "Anambra",
    ],
    keyHospitals: [
      "Lagos University Teaching Hospital (LUTH)",
      "National Hospital Abuja",
      "St. Nicholas Hospital Lagos",
      "UPTH Port Harcourt",
      "UCH Ibadan",
    ],
    outpatientCover:
      "Unlimited GP visits, specialist referrals, diagnostics, labs, imaging, medications per formulary",
    inpatientCover:
      "Up to ₦800,000 per admission including surgery; general ward accommodation",
    maternityCover:
      "₦150,000 cover for normal delivery after 10-month waiting period. C-section not covered on this tier.",
    chronicConditionPolicy:
      "Hypertension and diabetes managed via designated providers after 6-month waiting period. VERIFY at enrolment.",
    preExistingWaitingPeriodMonths: 6,
    topFor:
      "Budget-conscious individuals and couples who need solid multi-state coverage without breaking the bank",
    enrollUrl: "https://reliancehmo.com/enroll",
  },

  // ── Avon HMO — Avon Plus ──────────────────────────────────────────────────
  // PLACEHOLDER pricing — VERIFY current rates with Avon HMO directly.
  {
    id: "avon_plus",
    hmo: "Avon HMO",
    planName: "Avon Plus",
    tier: "mid",
    monthlyPremium: 11000,
    annualBenefitLimit: "₦2,500,000",
    statesCovered: [
      "Lagos", "FCT (Abuja)", "Rivers", "Ogun", "Oyo", "Kaduna", "Kano",
      "Enugu", "Edo", "Delta", "Anambra", "Imo",
    ],
    keyHospitals: [
      "Eko Hospital Ikeja",
      "St. Nicholas Hospital Lagos",
      "UCH Ibadan",
      "UBTH Benin City",
      "UNTH Enugu",
      "National Hospital Abuja",
    ],
    outpatientCover:
      "Unlimited outpatient including specialist visits, diagnostics, physiotherapy, mental health consultations",
    inpatientCover:
      "Up to ₦1,500,000 per admission including ICU cover; general ward with single room upgrade subject to availability",
    maternityCover:
      "Comprehensive — antenatal care, normal delivery, C-section, postnatal care up to ₦300,000. 9-month waiting period for new enrollees.",
    chronicConditionPolicy:
      "Structured chronic disease management for hypertension, diabetes, asthma. Includes specialist review and medications.",
    preExistingWaitingPeriodMonths: 6,
    topFor:
      "Families and individuals who want reliable maternity cover and broad hospital access across southern Nigeria",
    enrollUrl: "https://avonhealthcare.com/plans",
  },

  // ── Hygeia HMO — HygeiaCorePlus ──────────────────────────────────────────
  // PLACEHOLDER pricing — VERIFY current rates with Hygeia HMO directly.
  {
    id: "hygeia_coreplus",
    hmo: "Hygeia HMO",
    planName: "HygeiaCorePlus",
    tier: "upper-mid",
    monthlyPremium: 18500,
    annualBenefitLimit: "₦5,000,000",
    statesCovered: [
      "Lagos", "FCT (Abuja)", "Rivers", "Ogun", "Oyo", "Kano", "Kaduna",
      "Delta", "Enugu", "Edo", "Anambra", "Imo", "Cross River", "Benue", "Plateau",
    ],
    keyHospitals: [
      "LUTH Lagos",
      "UCH Ibadan",
      "JUTH Jos",
      "UNTH Enugu",
      "National Hospital Abuja",
      "St. Nicholas Hospital",
      "Reddington Hospital",
    ],
    outpatientCover:
      "Unlimited outpatient, specialist, basic dental, optical (frames + lenses), physiotherapy, dietitian",
    inpatientCover:
      "Up to ₦3,000,000 per admission including surgery, ICU, and post-operative care; private room accommodation",
    maternityCover:
      "Full — antenatal, normal delivery, C-section, NICU up to ₦500,000. No waiting period for family plans. VERIFY for individuals.",
    chronicConditionPolicy:
      "Comprehensive chronic disease management programme including medications, quarterly specialist review, monitoring devices. Best-in-class for this tier.",
    preExistingWaitingPeriodMonths: 3,
    topFor:
      "Anyone managing a chronic condition who needs guaranteed specialist access and well-structured disease management",
    enrollUrl: "https://hygeiahmo.com/enroll",
  },

  // ── AXA Mansard Health — Gold Health ─────────────────────────────────────
  // PLACEHOLDER pricing — VERIFY current rates with AXA Mansard directly.
  {
    id: "axa_gold",
    hmo: "AXA Mansard Health",
    planName: "Gold Health",
    tier: "premium",
    monthlyPremium: 32000,
    annualBenefitLimit: "₦10,000,000",
    statesCovered: [
      "Lagos", "FCT (Abuja)", "Rivers", "Ogun", "Oyo", "Kano", "Kaduna",
      "Delta", "Enugu", "Edo", "Anambra", "Imo", "Cross River", "Benue",
      "Plateau", "Kwara", "Osun", "Ondo", "Ekiti", "Bauchi",
    ],
    keyHospitals: [
      "All major private and public hospitals in-network nationwide",
      "LUTH Lagos",
      "UCH Ibadan",
      "National Hospital Abuja",
      "St. Nicholas Hospital Lagos",
      "Reddington Hospital Lagos",
      "Eko Hospital Ikeja",
    ],
    outpatientCover:
      "Unlimited outpatient, comprehensive dental, full optical, mental health counselling, physiotherapy, alternative medicine",
    inpatientCover:
      "Up to ₦6,000,000 per admission; private room guaranteed; includes overseas referral contribution of up to ₦500,000",
    maternityCover:
      "Full coverage including fertility consultation, antenatal, normal delivery, C-section, NICU, postnatal. No waiting period.",
    chronicConditionPolicy:
      "All chronic conditions covered from day one on Gold tier — no waiting period. Dedicated case manager assigned. VERIFY specifics at enrolment.",
    preExistingWaitingPeriodMonths: 0,
    topFor:
      "High earners and families who want the widest hospital choice, highest benefit limits, and zero compromise on coverage",
    enrollUrl: "https://axamansard.com/health/plans",
  },
];
