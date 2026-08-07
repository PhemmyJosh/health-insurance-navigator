// Bastion HMO, Reliance HMO, and Avon HMO entries below are still PLACEHOLDER
// data pending real verified figures — replace with verified data before launch.
// Hygeia HMO entries are verified real data from Laima_HMO_Data_Collection_v2.xlsx
// (collected August 2026). All Hygeia prices are ANNUAL ONLY — do not display
// or calculate a monthly figure anywhere in the UI.

export type LegacyPlan = {
  source: "placeholder";
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

export type FamilyTier = {
  size: number;
  annualPremium: number;
};

export type HospitalCategoryPrice = {
  category: string;
  annualPremium: number;
};

export type AgeBandPrice = {
  ageRange: string;
  annualPremium: number;
};

export type RealPlan = {
  source: "verified";
  id: string;
  hmo: string;
  planName: string;
  planType: "individual" | "family" | "senior" | "maternity";
  // null when price varies by hospital category or age band — see pricingByHospitalCategory / ageBandPricing
  annualPremium: number | null;
  familyPricing?: FamilyTier[];
  pricingByHospitalCategory?: HospitalCategoryPrice[];
  ageBandPricing?: AgeBandPrice[];

  hospitalCategory: string;
  ward: string;
  outpatientLimit: string;
  inpatientLimit: string;
  surgery: string;
  maternity: string;
  chronicConditions: string;
  ctMri: string;
  icu: string;
  cancer?: string;
  dental?: string;
  optical?: string;
  physiotherapy?: string;
  wellness?: string;
  hivAids?: string;
  deathBenefit?: string;
  mortuary?: string;
  telemedicine?: string;
  kidneyDialysis?: string;
  region?: string;
  termLife?: string;
  airAmbulance?: string;
  aeLimit?: string;
  homeCare?: string;
  immunization?: string;
  concierge?: string;
  personalHealthEquipment?: string;
  chronicMedicineRefill?: string;
  otherMajorDisease?: string;
  neonatalCare?: string;
  emergencyTravelAbroad?: string;

  ageRange: string;
  keyExclusions: string[];
  waitingPeriods: string[];
  providerNetworkNote: string;
  // HMO-wide enrolment/operational rules that don't fit the fields above
  // (e.g. hospital selection process, family pricing rules, admin timelines).
  planRulesNote?: string;

  enrollUrl: string;
};

export type Plan = LegacyPlan | RealPlan;

// ── Hygeia HMO — shared reference data ─────────────────────────────────────
const HYGEIA_KEY_EXCLUSIONS = [
  "Overseas treatment", "Transplant surgery", "Cosmetic surgery", "Infertility",
  "Homecare", "Joint replacements", "Prosthetics", "Autoimmune diseases",
  "Obesity", "COVID-19", "Congenital abnormalities", "Speech disorders",
  "Room upgrades", "Severe burns over 10% body surface", "Learning difficulties",
];

const HYGEIA_WAITING_PERIODS = [
  "7 days: general (all plans)",
  "3 months: chronic disease management, optical, dental, immunizations, health checks, neonatal",
  "6 months: wellness benefits",
  "12 months: maternity, surgery, ICU, permanent disability + death",
];

const HYGEIA_PROVIDER_NOTE =
  "2,331 providers (August 2026). Full named list in the Hygeia_Providers sheet of Laima_HMO_Data_Collection_v2.xlsx, with state, category, and type for each hospital.";

const HYGEIA_INDIVIDUAL_AGE_RANGE = "Principal max 60 years; dependants max 21 years";
const HYGEIA_FAMILY_AGE_RANGE =
  "Principal max 60 years; dependants max 21 years. Family = principal + spouse + children under 21.";
const HYGEIA_SENIOR_AGE_RANGE = "51–85 years only";
// VERIFY plan-specific enrolment links with Hygeia directly.
const HYGEIA_ENROLL_URL = "https://hygeiahmo.com/enroll";

// ── AXA Mansard Health — shared reference data ─────────────────────────────
// Cancer, renal dialysis/transplant, and neurological surgery are excluded on
// EVERY AXA Mansard retail plan, including Rhodium — never recommend AXA
// Mansard to a user with a cancer history.
const AXA_CANCER_NOTE = "Not covered — excluded on all AXA Mansard plans";

const AXA_KEY_EXCLUSIONS = [
  "Cancer (excluded on all plans, including Rhodium)",
  "Renal dialysis and transplant (excluded on all plans)",
  "Neurological surgery (excluded on all plans)",
];

const AXA_WAITING_PERIODS = [
  "3 months: surgery (all plans)",
  "12 months: maternity and pre-existing/chronic conditions on all plans EXCEPT Rhodium (Rhodium has no moratorium)",
];

const AXA_AGE_RANGE = "0–64 years";

const AXA_PROVIDER_NOTE =
  "2,436 providers (August 2026). Full named list in the AXA_Mansard sheet of Laima_HMO_Data_Collection_v2.xlsx, organised by state and category.";

const AXA_PLAN_RULES =
  "Annual payment only — no monthly option. Enrollee chooses 2 hospitals at registration; can roam to hospitals on their plan tier or lower. All family members must be on the same plan — flat rate per head, no family discount. 2-week admin wait after full payment + all documents before the healthcare card is issued. Reddington and Evercare require Rhodium (minimum); Lagoon Hospital requires Platinum Plus (minimum).";

// VERIFY plan-specific enrolment links with AXA Mansard directly.
const AXA_ENROLL_URL = "https://axamansard.com/health/plans";

// Named hospital examples mapped to their AXA Mansard category and the minimum
// plan tier that grants access — critical for recommendations. Full named list
// is in the AXA_Mansard sheet of Laima_HMO_Data_Collection_v2.xlsx.
export const AXA_HOSPITAL_CATEGORY_EXAMPLES: {
  hospital: string;
  category: string;
  minimumPlan: string;
}[] = [
  { hospital: "Eko Hospital (Ikeja)", category: "B", minimumPlan: "Silver" },
  { hospital: "Reddington (all 3 locations)", category: "F", minimumPlan: "Rhodium" },
  { hospital: "Evercare Hospital Lekki", category: "F", minimumPlan: "Rhodium" },
  { hospital: "Lagoon Hospital (all 3 locations)", category: "E", minimumPlan: "Platinum Plus" },
  { hospital: "Havana Specialist Hospital", category: "C", minimumPlan: "Gold" },
  { hospital: "Deseret International", category: "B", minimumPlan: "Silver" },
];

// ── Leadway Health — shared reference data ─────────────────────────────────
const LEADWAY_RETAIL_AGE_RANGE = "18–60 years";
const LEADWAY_SENIOR_AGE_RANGE = "55–79 years";

const LEADWAY_RETAIL_KEY_EXCLUSIONS = [
  "Cancer / major disease (excluded on every Leadway retail plan)",
];

const LEADWAY_RETAIL_WAITING_PERIODS = [
  "7 days: general",
  "12 months: maternity + pre-existing conditions",
  "3 months: surgery",
];

const LEADWAY_SENIOR_WAITING_PERIODS = [
  "6 months: surgery",
  "12 months: major disease moratorium (newly diagnosed only, Blueberry/Blackberry/Raspberry senior tiers)",
];

const LEADWAY_RETAIL_SENIOR_PROVIDER_NOTE =
  "2,581 providers (July 2026). Full list in the Leadway_Retail_Providers sheet of Laima_HMO_Data_Collection_v2.xlsx.";

const LEADWAY_MRCARE_PROVIDER_NOTE =
  "2,678 providers including 95 Cat A hospitals not available on retail or senior plans. Full list in the Leadway_MRCare_Providers sheet of Laima_HMO_Data_Collection_v2.xlsx.";

const LEADWAY_MRCARE_WAITING_PERIODS = [
  "12 months: maternity, other major disease (kidney, autoimmune, sickle cell)",
];

// No enrolment URL was supplied in the source data. leadwayhealth.com is
// Leadway Health's known public domain — VERIFY the exact enrolment page
// with Leadway directly before using this in production.
const LEADWAY_ENROLL_URL = "https://leadwayhealth.com";

// The 95 Cat A hospitals on Leadway's MRCare provider list (July 2026) — these
// are NOT accessible on any Leadway retail or senior plan; MRCare is the
// minimum tier that reaches them. Extracted from column C (Provider Name)
// where column B (Category) = "A" in the Leadway_MRCare_Providers sheet of
// Laima_HMO_Data_Collection_v2.xlsx. 89 unique names (a few appear more than
// once in the source, once per branch/state).
export const LEADWAY_CAT_A_HOSPITALS = [
  "ADONAI MEDICAL CENTER", "AGAPE BIOMEDICAL CLINIC LTD", "ALLIANCE HOSPITAL",
  "ALPS HOSPITAL & DIAGNOSTICS LTD", "AMINU KANO TEACHING HOSPITAL",
  "ATLANTIS PEDIATRIC HOSPITAL", "AWESOME GRACE HOSPITAL SURULERE",
  "BABCOCK UNIVERSITY TEACHING HOSPITAL", "BARIEL MEDICAL CENTER, LTD.",
  "BLUEROCK WOMEN'S HOSPITAL", "BUILDING SMILES DENTAL CLINIC",
  "CARNAMED SPECIALIST CLINIC", "CATHEM EYE HOSPITAL", "CEDARCARE HOSPITAL",
  "CENTREPOINT MEDICAL SERVICES LTD", "CIMBAK DENTAL CLINIC",
  "CONTEMPORARY DENTAL CLINIC", "COPTIC ORTHODOX CHURCH OF NIGERIA",
  "COVA CARE SPECIALIST AND ENDOSCOPY CENTRE", "DENTAL POINTE CLINIC AND SERVICES",
  "DESOL MEDICAL SOLUTIONS", "DIAMED MEDICAL CENTRE", "FACES N BRACES DENTAL CLINICS",
  "FORESIGHT SPECIALIST EYE CLINIC", "GALAXY DENTAL CENTRE", "GLOXYGEN DENTAL CARE",
  "GOODHEART MEDICAL CONSULTANTS", "GRABBO DIAGNOSTIC SERVICES LTD",
  "GRACEVID BRACES AND DENTALS", "GUSCARE HOSPITAL", "HAPPY FAMILY HOSPITAL",
  "HAVANA SPECIALIST HOSPITAL LIMITED", "HAYMILL SPECIALIST AND DIAGNOSTIC CENTRE",
  "IDUNA SPECIALIST HOSPITAL", "IFPF HOSPITAL", "INSIGHT PLUS HEALTHCARE",
  "IROWA MEDICAL CENTRE", "IVORY DENTAL CLINIC", "JAJO HOSPITAL LIMITED",
  "JOMAS DENTAL CLINIC", "KINDER KLINIK", "KLARITY DENTALS HEALTH SERVICES",
  "KRYSTAL MEDICAL CENTRE", "LAKESHORE CANCER CENTER", "LENNOX HOSPITAL",
  "LIFE INTERNATIONAL HOSPITAL", "LIFEBRIDGE DIAGNOSTIC CENTER",
  "LIFELINE CHILDREN'S HOSPITAL", "LIVING HEART SPECIALIST HOSPITAL",
  "LUXE DENTAL CLINIC", "MAGODO SPECIALISTS HOSPITAL", "MAJOROH MEDICAL CENTRE",
  "MALDOR EYECARE CENTRE", "MARIEN HOSPITAL", "MAXI SPECIALIST EAR NOSE & THROAT CLINIC",
  "NIGER FOUNDATION HOSPITAL", "NISA PREMIER", "ONE HEALTH MEDICAL CENTRE",
  "ON-GEORGE MEDICAL SERVICES", "PAEDIATRIC AND MATERNAL CARE HOSPITAL",
  "PALMARS HOSPITAL", "PATRICARE HEALTH SERVICES LIMITED UPTH PREMIUM",
  "POTTERS TOUCH MEDICAL CONSULTANT", "PRIME CARE HOSPITAL", "PRIMECARE HOSPITAL",
  "R JOLAD PLUS HOSPITAL", "RABBONI DENTAL", "RABBONI DENTAL VI",
  "RACHAEL EYE CENTRE", "RAYFIELD MEDICAL CENTER", "REDUS CENTER FOR DIGESTIVE HEALTH",
  "REMED HEALTHCARE SERVICES.", "RENAISSANCE MEDICAL CENTRE", "RICHMOND DENTAL CLINIC",
  "SAHAD HOSPITALS", "SANCTA DEI HOSPITAL KOKO", "SKKY DENTAL",
  "SPRINGBLOOM COUNTY HOSPITAL", "SS DENTAL CLINIC", "ST LUKES HOSPITAL",
  "ST LUKE'S HOSPITAL YABA", "TABITHA MEDICAL CENTRE",
  "THE OLIVEPRIME PREMIUM PSYCHOLOGICAL SERVICES", "THE PREMIER SPECIALIST MEDICAL CENTRE",
  "TRISTATE HEALTHCARE LEKKI", "TULSI CHANRAI FOUNDATION EYE HOSPITAL",
  "VEDIC LIFECARE", "VIGOR HOSPITALS", "XSERVE CHILDREN HOSPITAL",
];

export const PLANS: Plan[] = [
  // ── Bastion HMO — Jade ────────────────────────────────────────────────────
  // Real published price: ₦23,500/year (≈ ₦1,958/month). VERIFY current pricing.
  {
    source: "placeholder",
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
    source: "placeholder",
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
    source: "placeholder",
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

  // ── Hygeia HMO — verified real data (Laima_HMO_Data_Collection_v2.xlsx) ──

  {
    source: "verified",
    id: "hygeia_hyease",
    hmo: "Hygeia HMO",
    planName: "HyEase",
    planType: "individual",
    annualPremium: 26515,
    hospitalCategory: "C-D",
    ward: "General (7 days/year)",
    outpatientLimit: "₦100,000",
    inpatientLimit: "₦150,000",
    surgery: "Not covered",
    maternity: "Not covered",
    chronicConditions: "Not covered",
    ctMri: "Not covered",
    icu: "Not covered",
    telemedicine: "Unlimited 24/7",
    deathBenefit: "₦50,000",
    physiotherapy: "₦10,000",
    ageRange: HYGEIA_INDIVIDUAL_AGE_RANGE,
    keyExclusions: HYGEIA_KEY_EXCLUSIONS,
    waitingPeriods: HYGEIA_WAITING_PERIODS,
    providerNetworkNote: HYGEIA_PROVIDER_NOTE,
    enrollUrl: HYGEIA_ENROLL_URL,
  },

  {
    source: "verified",
    id: "hygeia_hybasic",
    hmo: "Hygeia HMO",
    planName: "HyBasic",
    planType: "individual",
    annualPremium: 66070,
    familyPricing: [
      { size: 4, annualPremium: 264300 },
      { size: 6, annualPremium: 333930 },
    ],
    hospitalCategory: "C-D",
    ward: "General (15 days/year)",
    outpatientLimit: "₦250,000",
    inpatientLimit: "₦350,000",
    surgery: "₦200,000 (12-month wait)",
    maternity: "₦100,000 (12-month wait)",
    chronicConditions: "Not covered",
    ctMri: "Not covered",
    icu: "Not covered",
    dental: "₦10,000",
    optical: "₦10,000 (biennial)",
    physiotherapy: "₦20,000",
    deathBenefit: "₦100,000",
    mortuary: "₦50,000",
    telemedicine: "Unlimited 24/7",
    ageRange: HYGEIA_FAMILY_AGE_RANGE,
    keyExclusions: HYGEIA_KEY_EXCLUSIONS,
    waitingPeriods: HYGEIA_WAITING_PERIODS,
    providerNetworkNote: HYGEIA_PROVIDER_NOTE,
    enrollUrl: HYGEIA_ENROLL_URL,
  },

  {
    source: "verified",
    id: "hygeia_hyprime",
    hmo: "Hygeia HMO",
    planName: "HyPrime",
    planType: "individual",
    annualPremium: 181380,
    familyPricing: [
      { size: 4, annualPremium: 725550 },
      { size: 6, annualPremium: 916710 },
    ],
    hospitalCategory: "B-D",
    ward: "Semi-private (15 days/year)",
    outpatientLimit: "₦500,000",
    inpatientLimit: "₦1,000,000",
    surgery: "₦300,000 (12-month wait)",
    maternity: "₦200,000 (12-month wait)",
    chronicConditions: "Covered — 3-month waiting period",
    ctMri: "1 session per year",
    icu: "Not covered",
    dental: "₦20,000",
    optical: "₦20,000 (biennial)",
    physiotherapy: "₦20,000",
    wellness: "₦5,000/month refundable (gym/spa)",
    hivAids: "Covered",
    deathBenefit: "₦250,000",
    mortuary: "₦50,000",
    telemedicine: "Unlimited 24/7",
    ageRange: HYGEIA_FAMILY_AGE_RANGE,
    keyExclusions: HYGEIA_KEY_EXCLUSIONS,
    waitingPeriods: HYGEIA_WAITING_PERIODS,
    providerNetworkNote: HYGEIA_PROVIDER_NOTE,
    enrollUrl: HYGEIA_ENROLL_URL,
  },

  {
    source: "verified",
    id: "hygeia_hyprime_plus",
    hmo: "Hygeia HMO",
    planName: "HyPrime Plus",
    planType: "individual",
    annualPremium: 480380,
    hospitalCategory: "A-D (includes Evercare, Reddington, Cedar Crest Abuja)",
    ward: "Private (20 days/year)",
    outpatientLimit: "₦1,000,000",
    inpatientLimit: "₦2,500,000",
    surgery: "₦400,000 (12-month wait)",
    maternity: "₦300,000 (12-month wait)",
    chronicConditions: "Covered",
    ctMri: "2 sessions per year",
    icu: "₦400,000",
    dental: "₦40,000",
    optical: "₦40,000 (biennial)",
    physiotherapy: "₦40,000",
    wellness: "₦10,000/month refundable",
    hivAids: "Covered",
    deathBenefit: "₦500,000",
    mortuary: "₦50,000",
    telemedicine: "Unlimited 24/7",
    ageRange: HYGEIA_INDIVIDUAL_AGE_RANGE,
    keyExclusions: HYGEIA_KEY_EXCLUSIONS,
    waitingPeriods: HYGEIA_WAITING_PERIODS,
    providerNetworkNote: HYGEIA_PROVIDER_NOTE,
    enrollUrl: HYGEIA_ENROLL_URL,
  },

  {
    source: "verified",
    id: "hygeia_hyprime_exclusive",
    hmo: "Hygeia HMO",
    planName: "HyPrime Exclusive",
    planType: "individual",
    annualPremium: 748660,
    hospitalCategory: "A-D (includes Evercare, Reddington, Cedar Crest Abuja)",
    ward: "Private (20 days/year)",
    outpatientLimit: "₦1,500,000",
    inpatientLimit: "₦3,000,000",
    surgery: "₦600,000 (12-month wait)",
    maternity: "₦300,000 (12-month wait)",
    chronicConditions: "Covered",
    ctMri: "2 sessions per year",
    icu: "₦500,000",
    dental: "₦40,000",
    optical: "₦40,000 (biennial)",
    physiotherapy: "₦40,000",
    wellness: "₦10,000/month refundable",
    hivAids: "Covered",
    deathBenefit: "₦500,000",
    mortuary: "₦50,000",
    telemedicine: "Unlimited 24/7",
    ageRange: HYGEIA_INDIVIDUAL_AGE_RANGE,
    keyExclusions: HYGEIA_KEY_EXCLUSIONS,
    waitingPeriods: HYGEIA_WAITING_PERIODS,
    providerNetworkNote: HYGEIA_PROVIDER_NOTE,
    enrollUrl: HYGEIA_ENROLL_URL,
  },

  {
    source: "verified",
    id: "hygeia_senior_mini",
    hmo: "Hygeia HMO",
    planName: "Senior Mini",
    planType: "senior",
    annualPremium: 230000,
    hospitalCategory: "C-D",
    ward: "General (30 days/year)",
    outpatientLimit: "₦500,000",
    inpatientLimit: "₦1,000,000",
    surgery: "₦250,000 (12-month wait)",
    maternity: "Not applicable — senior plan",
    chronicConditions: "Covered, including senile cognitive disorders",
    cancer: "Not covered",
    ctMri: "2 sessions/year",
    icu: "Not covered",
    dental: "₦30,000",
    optical: "₦30,000 eye diseases | ₦20,000 frames/lenses (annual)",
    physiotherapy: "₦30,000",
    deathBenefit: "₦150,000 (6-month wait, max age 79)",
    telemedicine: "Unlimited 24/7",
    ageRange: HYGEIA_SENIOR_AGE_RANGE,
    keyExclusions: HYGEIA_KEY_EXCLUSIONS,
    waitingPeriods: HYGEIA_WAITING_PERIODS,
    providerNetworkNote: HYGEIA_PROVIDER_NOTE,
    enrollUrl: HYGEIA_ENROLL_URL,
  },

  {
    source: "verified",
    id: "hygeia_senior_midi",
    hmo: "Hygeia HMO",
    planName: "Senior Midi",
    planType: "senior",
    annualPremium: 452760,
    hospitalCategory: "B-D",
    ward: "Semi-private (30 days/year)",
    outpatientLimit: "₦1,000,000",
    inpatientLimit: "₦1,600,000",
    surgery: "₦500,000 (12-month wait)",
    maternity: "Not applicable — senior plan",
    chronicConditions: "Covered",
    cancer: "Covered — chemo, radiotherapy, oncology tests, surgical therapy",
    ctMri: "4 sessions/year",
    icu: "24 hours",
    dental: "₦50,000",
    optical: "₦50,000 eye diseases | ₦30,000 frames/lenses (annual)",
    physiotherapy: "₦45,000",
    deathBenefit: "₦200,000 (6-month wait, max age 79)",
    telemedicine: "Unlimited 24/7",
    ageRange: HYGEIA_SENIOR_AGE_RANGE,
    keyExclusions: HYGEIA_KEY_EXCLUSIONS,
    waitingPeriods: HYGEIA_WAITING_PERIODS,
    providerNetworkNote: HYGEIA_PROVIDER_NOTE,
    enrollUrl: HYGEIA_ENROLL_URL,
  },

  {
    source: "verified",
    id: "hygeia_senior_premium",
    hmo: "Hygeia HMO",
    planName: "Senior Premium",
    planType: "senior",
    annualPremium: 900000,
    hospitalCategory: "A-D (includes Evercare, Reddington, Cedar Crest Abuja)",
    ward: "Private (30 days/year)",
    outpatientLimit: "₦1,650,000",
    inpatientLimit: "₦3,350,000",
    surgery: "₦1,000,000 (12-month wait)",
    maternity: "Not applicable — senior plan",
    chronicConditions: "Covered",
    cancer: "Covered",
    ctMri: "8 sessions/year",
    icu: "72 hours",
    kidneyDialysis: "3 sessions",
    dental: "₦80,000",
    optical: "₦80,000 eye diseases | ₦40,000 frames/lenses (annual)",
    physiotherapy: "₦60,000",
    deathBenefit: "₦500,000 (6-month wait, max age 79)",
    telemedicine: "Unlimited 24/7",
    ageRange: HYGEIA_SENIOR_AGE_RANGE,
    keyExclusions: HYGEIA_KEY_EXCLUSIONS,
    waitingPeriods: HYGEIA_WAITING_PERIODS,
    providerNetworkNote: HYGEIA_PROVIDER_NOTE,
    enrollUrl: HYGEIA_ENROLL_URL,
  },

  {
    source: "verified",
    id: "hygeia_senior_exclusive",
    hmo: "Hygeia HMO",
    planName: "Senior Exclusive",
    planType: "senior",
    annualPremium: 1115000,
    // Same limits as Senior Premium — this tier only differs in price.
    hospitalCategory: "A-D (includes Evercare, Reddington, Cedar Crest Abuja)",
    ward: "Private (30 days/year)",
    outpatientLimit: "₦1,650,000",
    inpatientLimit: "₦3,350,000",
    surgery: "₦1,000,000 (12-month wait)",
    maternity: "Not applicable — senior plan",
    chronicConditions: "Covered",
    cancer: "Covered",
    ctMri: "8 sessions/year",
    icu: "72 hours",
    kidneyDialysis: "3 sessions",
    dental: "₦80,000",
    optical: "₦80,000 eye diseases | ₦40,000 frames/lenses (annual)",
    physiotherapy: "₦60,000",
    deathBenefit: "₦500,000 (6-month wait, max age 79)",
    telemedicine: "Unlimited 24/7",
    ageRange: HYGEIA_SENIOR_AGE_RANGE,
    keyExclusions: HYGEIA_KEY_EXCLUSIONS,
    waitingPeriods: HYGEIA_WAITING_PERIODS,
    providerNetworkNote: HYGEIA_PROVIDER_NOTE,
    enrollUrl: HYGEIA_ENROLL_URL,
  },

  {
    source: "verified",
    id: "hygeia_hymat_standard",
    hmo: "Hygeia HMO",
    planName: "HyMat Standard",
    planType: "maternity",
    annualPremium: null,
    pricingByHospitalCategory: [
      { category: "A", annualPremium: 400000 },
      { category: "B", annualPremium: 450000 },
      { category: "C", annualPremium: 550000 },
      { category: "D", annualPremium: 650000 },
      { category: "E", annualPremium: 750000 },
      { category: "F", annualPremium: 900000 },
      { category: "G", annualPremium: 1300000 },
    ],
    hospitalCategory: "A-G — price varies by hospital chosen",
    ward: "Maternity ward per hospital category",
    outpatientLimit: "Included in package",
    inpatientLimit: "Included in package",
    surgery: "No C-section — see HyMat Plus",
    maternity:
      "ANC, vaginal delivery, twin delivery, episiotomy, evacuation, 6-week postnatal, baby care (first year). 7-day waiting period.",
    chronicConditions: "Not applicable — maternity-only plan",
    ctMri: "Not applicable",
    icu: "Not applicable",
    telemedicine: "Not specified",
    ageRange: HYGEIA_INDIVIDUAL_AGE_RANGE,
    keyExclusions: [...HYGEIA_KEY_EXCLUSIONS, "C-section (see HyMat Plus)"],
    waitingPeriods: ["7 days: maternity waiting period for HyMat Standard"],
    providerNetworkNote: HYGEIA_PROVIDER_NOTE,
    enrollUrl: HYGEIA_ENROLL_URL,
  },

  {
    source: "verified",
    id: "hygeia_hymat_plus",
    hmo: "Hygeia HMO",
    planName: "HyMat Plus",
    planType: "maternity",
    annualPremium: null,
    pricingByHospitalCategory: [
      { category: "A", annualPremium: 800000 },
      { category: "B", annualPremium: 850000 },
      { category: "C", annualPremium: 900000 },
      { category: "D", annualPremium: 1000000 },
      { category: "E", annualPremium: 1200000 },
      { category: "F", annualPremium: 1500000 },
      { category: "G", annualPremium: 2000000 },
      { category: "H", annualPremium: 2500000 },
      { category: "I", annualPremium: 3000000 },
    ],
    hospitalCategory: "A-I — price varies by hospital chosen",
    ward: "Maternity ward per hospital category",
    outpatientLimit: "Included in package",
    inpatientLimit: "Included in package",
    surgery: "C-section covered",
    maternity:
      "Everything in HyMat Standard plus C-section and blood transfusion (1 pint). 7-day waiting period.",
    chronicConditions: "Not applicable — maternity-only plan",
    ctMri: "Not applicable",
    icu: "Not applicable",
    telemedicine: "Not specified",
    ageRange: HYGEIA_INDIVIDUAL_AGE_RANGE,
    keyExclusions: HYGEIA_KEY_EXCLUSIONS,
    waitingPeriods: ["7 days: maternity waiting period for HyMat Plus"],
    providerNetworkNote: HYGEIA_PROVIDER_NOTE,
    enrollUrl: HYGEIA_ENROLL_URL,
  },

  // ── AXA Mansard Health — verified real data (Laima_HMO_Data_Collection_v2.xlsx) ──
  // Cobalt tier is CORPORATE ONLY and is deliberately excluded from this list —
  // never recommend it for an individual.

  {
    source: "verified",
    id: "axa_bronze",
    hmo: "AXA Mansard Health",
    planName: "Bronze",
    planType: "individual",
    annualPremium: 89500,
    hospitalCategory: "Cat A only",
    ward: "General",
    outpatientLimit: "₦150,000",
    inpatientLimit: "₦350,000",
    surgery: "₦250,000 (3-month wait)",
    maternity: "₦250,000 (12-month wait)",
    chronicConditions: "₦150,000 (12-month wait)",
    ctMri: "Not covered",
    icu: "Not covered",
    cancer: AXA_CANCER_NOTE,
    dental: "₦10,000",
    optical: "₦7,500 (biennial)",
    aeLimit: "₦150,000",
    termLife: "₦500,000",
    telemedicine: "Covered",
    region: "Nigeria + India",
    ageRange: AXA_AGE_RANGE,
    keyExclusions: AXA_KEY_EXCLUSIONS,
    waitingPeriods: AXA_WAITING_PERIODS,
    providerNetworkNote: AXA_PROVIDER_NOTE,
    planRulesNote: AXA_PLAN_RULES,
    enrollUrl: AXA_ENROLL_URL,
  },

  {
    source: "verified",
    id: "axa_silver",
    hmo: "AXA Mansard Health",
    planName: "Silver",
    planType: "individual",
    annualPremium: 132250,
    hospitalCategory: "Cat A+B",
    ward: "Semi-private",
    outpatientLimit: "₦250,000",
    inpatientLimit: "₦500,000",
    surgery: "₦300,000 (3-month wait)",
    maternity: "₦300,000 (12-month wait)",
    chronicConditions: "₦250,000 (12-month wait)",
    ctMri: "Not covered",
    icu: "Not covered",
    cancer: AXA_CANCER_NOTE,
    homeCare: "Covered",
    dental: "₦20,000",
    optical: "₦10,000 (biennial)",
    aeLimit: "₦250,000",
    termLife: "₦750,000",
    telemedicine: "Covered",
    region: "Nigeria + India",
    ageRange: AXA_AGE_RANGE,
    keyExclusions: AXA_KEY_EXCLUSIONS,
    waitingPeriods: AXA_WAITING_PERIODS,
    providerNetworkNote: AXA_PROVIDER_NOTE,
    planRulesNote: AXA_PLAN_RULES,
    enrollUrl: AXA_ENROLL_URL,
  },

  {
    source: "verified",
    id: "axa_gold",
    hmo: "AXA Mansard Health",
    planName: "Gold",
    planType: "individual",
    annualPremium: 259225,
    hospitalCategory: "Cat A+B+C",
    ward: "Private",
    outpatientLimit: "₦300,000",
    inpatientLimit: "₦1,000,000",
    surgery: "₦500,000 (3-month wait)",
    maternity: "₦500,000 (12-month wait)",
    chronicConditions: "₦300,000 (12-month wait)",
    ctMri: "1 session/year (inpatient)",
    icu: "Not covered",
    cancer: AXA_CANCER_NOTE,
    immunization: "Full additional immunization covered",
    dental: "₦60,000",
    optical: "₦15,000 (biennial)",
    aeLimit: "₦300,000",
    termLife: "₦1,000,000",
    telemedicine: "Covered",
    region: "Nigeria + India",
    ageRange: AXA_AGE_RANGE,
    keyExclusions: AXA_KEY_EXCLUSIONS,
    waitingPeriods: AXA_WAITING_PERIODS,
    providerNetworkNote: AXA_PROVIDER_NOTE,
    planRulesNote: AXA_PLAN_RULES,
    enrollUrl: AXA_ENROLL_URL,
  },

  {
    source: "verified",
    id: "axa_platinum",
    hmo: "AXA Mansard Health",
    planName: "Platinum",
    planType: "individual",
    annualPremium: 418515,
    hospitalCategory: "Cat A+B+C+D",
    ward: "Private",
    outpatientLimit: "₦500,000",
    inpatientLimit: "₦2,000,000",
    surgery: "₦1,000,000 (3-month wait)",
    maternity: "₦750,000 (12-month wait)",
    chronicConditions: "₦500,000 (12-month wait)",
    ctMri: "Covered under outpatient limit",
    icu: "Not covered",
    cancer: AXA_CANCER_NOTE,
    dental: "₦80,000",
    optical: "₦25,000 (biennial)",
    aeLimit: "₦500,000",
    termLife: "₦1,500,000",
    telemedicine: "Covered",
    region: "Nigeria + India",
    ageRange: AXA_AGE_RANGE,
    keyExclusions: AXA_KEY_EXCLUSIONS,
    waitingPeriods: AXA_WAITING_PERIODS,
    providerNetworkNote: AXA_PROVIDER_NOTE,
    planRulesNote: AXA_PLAN_RULES,
    enrollUrl: AXA_ENROLL_URL,
  },

  {
    source: "verified",
    id: "axa_platinum_plus",
    hmo: "AXA Mansard Health",
    planName: "Platinum Plus",
    planType: "individual",
    annualPremium: 700375,
    // Same core limits as Platinum — this tier adds air ambulance + higher term life.
    hospitalCategory: "Cat A+B+C+D+E",
    ward: "Private",
    outpatientLimit: "₦500,000",
    inpatientLimit: "₦2,000,000",
    surgery: "₦1,000,000 (3-month wait)",
    maternity: "₦750,000 (12-month wait)",
    chronicConditions: "₦500,000 (12-month wait)",
    ctMri: "Covered under outpatient limit",
    icu: "Not covered",
    cancer: AXA_CANCER_NOTE,
    dental: "₦80,000",
    optical: "₦25,000 (biennial)",
    aeLimit: "₦500,000",
    airAmbulance: "$100,000",
    termLife: "₦2,500,000",
    telemedicine: "Covered",
    region: "Nigeria + India",
    ageRange: AXA_AGE_RANGE,
    keyExclusions: AXA_KEY_EXCLUSIONS,
    waitingPeriods: AXA_WAITING_PERIODS,
    providerNetworkNote: AXA_PROVIDER_NOTE,
    planRulesNote: AXA_PLAN_RULES,
    enrollUrl: AXA_ENROLL_URL,
  },

  {
    source: "verified",
    id: "axa_rhodium",
    hmo: "AXA Mansard Health",
    planName: "Rhodium",
    planType: "individual",
    annualPremium: 1969780,
    hospitalCategory: "Cat A+B+C+D+E+F (full network)",
    ward: "Private",
    outpatientLimit: "₦1,000,000",
    inpatientLimit: "₦3,000,000",
    surgery: "₦1,000,000 — no moratorium",
    maternity: "Covered immediately from day 1 — no moratorium (unique among AXA Mansard plans)",
    chronicConditions: "Covered immediately from day 1 — no moratorium (unique among AXA Mansard plans)",
    ctMri: "3 sessions/year",
    icu: "Not covered",
    cancer: AXA_CANCER_NOTE,
    concierge: "1x/year",
    personalHealthEquipment: "₦100,000",
    airAmbulance: "$100,000",
    termLife: "₦5,000,000",
    telemedicine: "Covered",
    region: "Nigeria + India",
    ageRange: AXA_AGE_RANGE,
    keyExclusions: AXA_KEY_EXCLUSIONS,
    waitingPeriods: [
      "NO moratoriums — maternity and pre-existing conditions covered immediately from day 1. Unique among AXA Mansard plans; flag this for users who need immediate coverage.",
    ],
    providerNetworkNote: AXA_PROVIDER_NOTE,
    planRulesNote: AXA_PLAN_RULES,
    enrollUrl: AXA_ENROLL_URL,
  },

  // ── Leadway Health — verified real data (Laima_HMO_Data_Collection_v2.xlsx) ──

  {
    source: "verified",
    id: "leadway_strawberry",
    hmo: "Leadway Health",
    planName: "Strawberry",
    planType: "individual",
    annualPremium: 118122.47,
    hospitalCategory: "Cat D only",
    ward: "General",
    outpatientLimit: "₦300,000",
    inpatientLimit: "Not stated separately — see surgery limit for inpatient/surgical cover",
    surgery: "₦250,000 (3-month wait)",
    maternity: "₦200,000 (12-month wait)",
    chronicConditions: "Covered — arthritis, asthma, hypertension, diabetes, osteoarthritis ONLY",
    cancer: "Not covered",
    ctMri: "Emergency only",
    icu: "Not covered",
    dental: "₦10,000",
    optical: "₦7,500 (biennial)",
    hivAids: "Covered",
    telemedicine: "Unlimited 24/7",
    region: "Nigeria only",
    ageRange: LEADWAY_RETAIL_AGE_RANGE,
    keyExclusions: LEADWAY_RETAIL_KEY_EXCLUSIONS,
    waitingPeriods: LEADWAY_RETAIL_WAITING_PERIODS,
    providerNetworkNote: LEADWAY_RETAIL_SENIOR_PROVIDER_NOTE,
    enrollUrl: LEADWAY_ENROLL_URL,
  },

  {
    source: "verified",
    id: "leadway_cranberry",
    hmo: "Leadway Health",
    planName: "Cranberry",
    planType: "individual",
    annualPremium: 166264.31,
    hospitalCategory: "Cat D only",
    ward: "Semi-private",
    outpatientLimit: "₦300,000",
    inpatientLimit: "Not stated separately — see surgery limit for inpatient/surgical cover",
    surgery: "₦300,000 (3-month wait)",
    maternity: "₦250,000 (12-month wait)",
    chronicConditions: "Covered",
    cancer: "Not covered",
    ctMri: "Emergency only",
    icu: "Not covered",
    dental: "₦20,000",
    optical: "₦10,000 (biennial)",
    hivAids: "Covered",
    telemedicine: "Unlimited 24/7",
    region: "Nigeria only",
    ageRange: LEADWAY_RETAIL_AGE_RANGE,
    keyExclusions: LEADWAY_RETAIL_KEY_EXCLUSIONS,
    waitingPeriods: LEADWAY_RETAIL_WAITING_PERIODS,
    providerNetworkNote: LEADWAY_RETAIL_SENIOR_PROVIDER_NOTE,
    enrollUrl: LEADWAY_ENROLL_URL,
  },

  {
    source: "verified",
    id: "leadway_blueberry",
    hmo: "Leadway Health",
    planName: "Blueberry",
    planType: "individual",
    annualPremium: 267567.30,
    hospitalCategory: "Cat C+D",
    ward: "Private",
    outpatientLimit: "₦700,000",
    inpatientLimit: "Not stated separately — see surgery limit for inpatient/surgical cover",
    surgery: "₦400,000 (3-month wait)",
    maternity: "₦300,000 (12-month wait)",
    chronicConditions: "Covered",
    cancer: "Not covered",
    ctMri: "Emergency only",
    icu: "Not covered",
    dental: "₦40,000",
    optical: "₦15,000 (biennial)",
    hivAids: "Covered",
    telemedicine: "Unlimited 24/7",
    region: "Nigeria + India",
    ageRange: LEADWAY_RETAIL_AGE_RANGE,
    keyExclusions: LEADWAY_RETAIL_KEY_EXCLUSIONS,
    waitingPeriods: LEADWAY_RETAIL_WAITING_PERIODS,
    providerNetworkNote: LEADWAY_RETAIL_SENIOR_PROVIDER_NOTE,
    enrollUrl: LEADWAY_ENROLL_URL,
  },

  {
    source: "verified",
    id: "leadway_blackberry",
    hmo: "Leadway Health",
    planName: "Blackberry",
    planType: "individual",
    annualPremium: 615273.30,
    hospitalCategory: "Cat B+C+D",
    ward: "Private",
    outpatientLimit: "₦2,400,000",
    inpatientLimit: "Not stated separately — see surgery limit for inpatient/surgical cover",
    surgery: "₦1,000,000 (3-month wait)",
    maternity: "₦800,000 (12-month wait)",
    chronicConditions: "Covered",
    cancer: "Not covered",
    ctMri: "Covered under outpatient limit",
    icu: "Not covered",
    dental: "₦50,000",
    optical: "₦25,000 (biennial)",
    hivAids: "Covered",
    telemedicine: "Unlimited 24/7",
    region: "Nigeria + India + Africa",
    ageRange: LEADWAY_RETAIL_AGE_RANGE,
    keyExclusions: LEADWAY_RETAIL_KEY_EXCLUSIONS,
    waitingPeriods: LEADWAY_RETAIL_WAITING_PERIODS,
    providerNetworkNote: LEADWAY_RETAIL_SENIOR_PROVIDER_NOTE,
    enrollUrl: LEADWAY_ENROLL_URL,
  },

  {
    source: "verified",
    id: "leadway_raspberry",
    hmo: "Leadway Health",
    planName: "Raspberry",
    planType: "individual",
    annualPremium: 1002456,
    hospitalCategory: "Cat B+C+D",
    ward: "Private",
    outpatientLimit: "₦2,400,000",
    inpatientLimit: "Not stated separately — see surgery limit for inpatient/surgical cover",
    surgery: "₦1,000,000 (3-month wait)",
    maternity: "₦850,000 (12-month wait)",
    chronicConditions: "Covered",
    cancer: "Not covered",
    ctMri: "Covered under outpatient limit",
    icu: "Not covered",
    dental: "₦50,000",
    optical: "₦25,000 (biennial)",
    hivAids: "Covered",
    telemedicine: "Unlimited 24/7",
    region: "Nigeria + India + Africa",
    ageRange: LEADWAY_RETAIL_AGE_RANGE,
    keyExclusions: LEADWAY_RETAIL_KEY_EXCLUSIONS,
    waitingPeriods: LEADWAY_RETAIL_WAITING_PERIODS,
    providerNetworkNote: LEADWAY_RETAIL_SENIOR_PROVIDER_NOTE,
    enrollUrl: LEADWAY_ENROLL_URL,
  },

  {
    source: "verified",
    id: "leadway_senior_cranberry",
    hmo: "Leadway Health",
    planName: "Senior Cranberry",
    planType: "senior",
    annualPremium: null,
    ageBandPricing: [
      { ageRange: "55-69", annualPremium: 575603.04 },
      { ageRange: "70-79", annualPremium: 611318.50 },
    ],
    hospitalCategory: "Cat D only",
    ward: "General (14 days/year)",
    inpatientLimit: "₦500,000",
    outpatientLimit: "₦250,000",
    surgery: "₦100,000 (6-month wait)",
    chronicConditions: "Covered — arthritis, asthma, hypertension, diabetes, osteoarthritis",
    chronicMedicineRefill: "₦400,000/year",
    cancer: "Not covered — major disease (cancer etc.) excluded",
    ctMri: "Advanced investigations: ₦50,000/year (3-month wait)",
    icu: "₦100,000",
    aeLimit: "₦50,000",
    kidneyDialysis: "2 sessions",
    dental: "₦20,000",
    optical: "₦10,000 (biennial)",
    physiotherapy: "Not covered",
    maternity: "Not applicable — senior plan",
    telemedicine: "Unlimited",
    ageRange: LEADWAY_SENIOR_AGE_RANGE,
    keyExclusions: LEADWAY_RETAIL_KEY_EXCLUSIONS,
    waitingPeriods: LEADWAY_SENIOR_WAITING_PERIODS,
    providerNetworkNote: LEADWAY_RETAIL_SENIOR_PROVIDER_NOTE,
    enrollUrl: LEADWAY_ENROLL_URL,
  },

  {
    source: "verified",
    id: "leadway_senior_blueberry",
    hmo: "Leadway Health",
    planName: "Senior Blueberry",
    planType: "senior",
    annualPremium: null,
    ageBandPricing: [
      { ageRange: "55-69", annualPremium: 872361.17 },
      { ageRange: "70-79", annualPremium: 944152.84 },
    ],
    hospitalCategory: "Cat C+D",
    ward: "General (14 days/year)",
    inpatientLimit: "₦650,000",
    outpatientLimit: "₦350,000",
    surgery: "₦150,000 (6-month wait)",
    chronicMedicineRefill: "₦500,000/year",
    chronicConditions:
      "Covered — arthritis, asthma, hypertension, diabetes, osteoarthritis; chronic medicine refill ₦500,000/year",
    cancer:
      "Covered up to 50% of inpatient limit (₦325,000) — 12-month moratorium, newly diagnosed only",
    ctMri: "Advanced investigations: ₦75,000/year",
    icu: "₦200,000",
    aeLimit: "₦75,000",
    kidneyDialysis: "3 sessions",
    dental: "₦30,000",
    optical: "₦25,000 (biennial)",
    physiotherapy: "₦10,000",
    maternity: "Not applicable — senior plan",
    telemedicine: "Unlimited",
    ageRange: LEADWAY_SENIOR_AGE_RANGE,
    keyExclusions: LEADWAY_RETAIL_KEY_EXCLUSIONS,
    waitingPeriods: LEADWAY_SENIOR_WAITING_PERIODS,
    providerNetworkNote: LEADWAY_RETAIL_SENIOR_PROVIDER_NOTE,
    enrollUrl: LEADWAY_ENROLL_URL,
  },

  {
    source: "verified",
    id: "leadway_senior_blackberry",
    hmo: "Leadway Health",
    planName: "Senior Blackberry",
    planType: "senior",
    annualPremium: null,
    ageBandPricing: [
      { ageRange: "55-69", annualPremium: 1255828.51 },
      { ageRange: "70-79", annualPremium: 1365452.78 },
    ],
    hospitalCategory: "Cat B+C+D",
    ward: "Semi-private",
    inpatientLimit: "₦1,500,000",
    outpatientLimit: "₦500,000",
    surgery: "₦200,000 (6-month wait)",
    chronicMedicineRefill: "₦750,000/year",
    chronicConditions: "Covered; chronic medicine refill ₦750,000/year",
    cancer:
      "Covered up to 50% of inpatient limit (₦750,000) — 12-month moratorium, newly diagnosed only",
    ctMri: "Advanced investigations: ₦100,000/year",
    icu: "₦300,000",
    aeLimit: "₦100,000",
    kidneyDialysis: "5 sessions",
    dental: "₦40,000",
    optical: "₦35,000 (biennial)",
    physiotherapy: "₦30,000",
    immunization: "Yellow fever, Meningitis, Hep B",
    maternity: "Not applicable — senior plan",
    telemedicine: "Unlimited",
    ageRange: LEADWAY_SENIOR_AGE_RANGE,
    keyExclusions: LEADWAY_RETAIL_KEY_EXCLUSIONS,
    waitingPeriods: LEADWAY_SENIOR_WAITING_PERIODS,
    providerNetworkNote: LEADWAY_RETAIL_SENIOR_PROVIDER_NOTE,
    enrollUrl: LEADWAY_ENROLL_URL,
  },

  {
    source: "verified",
    id: "leadway_senior_raspberry",
    hmo: "Leadway Health",
    planName: "Senior Raspberry",
    planType: "senior",
    annualPremium: null,
    ageBandPricing: [
      { ageRange: "55-69", annualPremium: 1550768.26 },
      { ageRange: "70-79", annualPremium: 1688883.50 },
    ],
    hospitalCategory: "Cat B+C+D",
    ward: "Private",
    inpatientLimit: "₦2,000,000",
    outpatientLimit: "₦1,000,000",
    surgery: "₦300,000 (6-month wait)",
    chronicMedicineRefill: "₦1,000,000/year",
    chronicConditions: "Covered; chronic medicine refill ₦1,000,000/year",
    cancer:
      "Covered up to 50% of inpatient limit (₦1,000,000) — 12-month moratorium, newly diagnosed only",
    ctMri: "Advanced investigations: ₦150,000/year",
    icu: "₦500,000",
    aeLimit: "₦150,000",
    kidneyDialysis: "7 sessions",
    dental: "₦50,000",
    optical: "₦45,000 (biennial)",
    physiotherapy: "₦50,000",
    immunization: "Yellow fever, Meningitis, Hep B",
    maternity: "Not applicable — senior plan",
    telemedicine: "Unlimited",
    ageRange: LEADWAY_SENIOR_AGE_RANGE,
    keyExclusions: LEADWAY_RETAIL_KEY_EXCLUSIONS,
    waitingPeriods: LEADWAY_SENIOR_WAITING_PERIODS,
    providerNetworkNote: LEADWAY_RETAIL_SENIOR_PROVIDER_NOTE,
    enrollUrl: LEADWAY_ENROLL_URL,
  },

  {
    source: "verified",
    id: "leadway_mrcare",
    hmo: "Leadway Health",
    planName: "MRCare",
    planType: "individual",
    annualPremium: 1559000,
    hospitalCategory: "Cat A+B+C+D (includes 95 Cat A hospitals not on the retail/senior list)",
    ward: "Private (30 days/year)",
    outpatientLimit: "Unlimited",
    inpatientLimit: "Unlimited overall limit — see surgery/ICU limits for specific caps",
    surgery: "₦2,000,000",
    icu: "₦3,000,000 (7 days)",
    cancer: "₦10,000,000 lifetime (subject to preliminary screening at enrollment)",
    otherMajorDisease: "Kidney, autoimmune, sickle cell: ₦1,000,000/year (12-month moratorium)",
    maternity: "ANC + delivery ₦175,000 | C-section ₦350,000 (12-month moratorium)",
    neonatalCare: "₦500,000 (28 days). Congenital anomaly covered (children born within plan).",
    chronicConditions: "Unlimited specialist consults",
    chronicMedicineRefill: "₦500,000/year (generic only)",
    ctMri: "₦100,000/year",
    dental: "₦150,000/year",
    optical: "Unlimited eye care | ₦45,000 frames/lenses (biennial)",
    physiotherapy: "₦100,000/year (12 sessions)",
    wellness: "Gym 2x/week",
    mortuary: "₦200,000/year",
    hivAids: "Covered",
    telemedicine: "Unlimited",
    region: "Nigeria + Africa + India + UAE",
    emergencyTravelAbroad: "$10,000",
    ageRange: "18–60 years (MRCare)",
    keyExclusions: [],
    waitingPeriods: LEADWAY_MRCARE_WAITING_PERIODS,
    providerNetworkNote: LEADWAY_MRCARE_PROVIDER_NOTE,
    enrollUrl: LEADWAY_ENROLL_URL,
  },

  {
    source: "verified",
    id: "leadway_mrcare_premium",
    hmo: "Leadway Health",
    planName: "MRCare Premium",
    planType: "individual",
    annualPremium: 3799000,
    hospitalCategory: "Cat A++ + A+B+C+D (highest tier)",
    ward: "Private (90 days/year)",
    outpatientLimit: "Unlimited",
    inpatientLimit: "Unlimited overall limit — see surgery/ICU limits for specific caps",
    surgery: "₦3,000,000",
    icu: "₦5,000,000 (14 days)",
    cancer: "₦15,000,000 lifetime",
    otherMajorDisease: "₦2,000,000/year (12-month moratorium)",
    maternity: "ANC + delivery ₦350,000 | C-section ₦500,000 (12-month moratorium)",
    neonatalCare: "₦1,000,000 (28 days). Congenital anomaly covered.",
    chronicMedicineRefill: "₦750,000/year (generic + branded)",
    chronicConditions: "Unlimited specialist consults",
    ctMri: "₦250,000/year",
    dental: "₦300,000/year",
    optical: "Unlimited eye care | ₦100,000 frames/lenses (biennial)",
    physiotherapy: "₦250,000/year (24 sessions)",
    wellness: "Gym 2x/week",
    mortuary: "₦200,000/year",
    hivAids: "Covered",
    telemedicine: "Unlimited",
    region: "Nigeria + Africa + India + UAE",
    emergencyTravelAbroad: "$10,000",
    ageRange: "18–60 years (MRCare)",
    keyExclusions: [],
    waitingPeriods: LEADWAY_MRCARE_WAITING_PERIODS,
    providerNetworkNote: LEADWAY_MRCARE_PROVIDER_NOTE,
    enrollUrl: LEADWAY_ENROLL_URL,
  },
];
