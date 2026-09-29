// Centralized configuration so verification dates and legal-commencement
// facts can be updated in one place without touching UI code.

export const APP_CONFIG = {
  appName: "BNS Section Finder",
  tagline: "Describe what happened. Find potentially applicable BNS provisions.",

  // Update this whenever src/data/bns_sections.json is re-checked against
  // primary sources (India Code / MHA). ISO 8601 date.
  datasetVerifiedDate: "2026-09-29",

  // General commencement date of the Bharatiya Nyaya Sanhita, 2023, per the
  // Ministry of Home Affairs commencement notification. Subject to any
  // section-specific exceptions/savings.
  bnsCommencementDate: "2024-07-01",

  sources: {
    indiaCode: {
      label: "India Code — Bharatiya Nyaya Sanhita, 2023 (Act No. 45 of 2023)",
      url: "https://www.indiacode.nic.in/handle/123456789/20062",
    },
    mha: {
      label: "Ministry of Home Affairs — New Criminal Laws",
      url: "https://www.mha.gov.in/en/new-criminal-laws",
    },
    bnss: {
      label: "Bharatiya Nagarik Suraksha Sanhita, 2023 — First Schedule",
      url: "https://www.indiacode.nic.in/handle/123456789/20063",
    },
  },
} as const;
