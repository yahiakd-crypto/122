// Client-safe mirror of the 17-section workflow (labels stay in sync with lib/sectionConfig).
export const SECTIONS = [
  { num: 1, title: "Product Research", short: "Research" },
  { num: 2, title: "Top 10 Competitors", short: "Competitors" },
  { num: 3, title: "Brand Colors", short: "Colors" },
  { num: 4, title: "Logo Research", short: "Logo" },
  { num: 5, title: "Buyer Personas", short: "Personas" },
  { num: 6, title: "High-Converting Keywords", short: "Keywords" },
  { num: 7, title: "Offers", short: "Offers" },
  { num: 8, title: "Landing Page Structure", short: "Landing Pages" },
  { num: 9, title: "Section Image Prompts", short: "Image Prompts" },
  { num: 10, title: "Copywriting", short: "Copywriting" },
  { num: 11, title: "Social Proof", short: "Social Proof" },
  { num: 12, title: "FAQ", short: "FAQ" },
  { num: 13, title: "Email Popup", short: "Popups" },
  { num: 14, title: "Final Design Guide", short: "Design Guide" },
  { num: 15, title: "Design References", short: "References" },
  { num: 16, title: "Ad Creative Ideas", short: "Ad Creatives" },
  { num: 17, title: "Ad Image Concepts", short: "Ad Images" },
];

export const LANGUAGE_OPTIONS = [
  { value: "darja", label: "Algerian Darja" },
  { value: "arabic", label: "Arabic" },
  { value: "french", label: "French" },
  { value: "english", label: "English" },
  { value: "custom", label: "Custom" },
];

export const PROVIDER_OPTIONS = ["openai", "anthropic", "gemini", "openrouter", "nvidia", "deepseek", "custom"];

export const STATUS_LABEL = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
  skipped: "Skipped",
  error: "Error",
};

export const statusTone = (s) =>
  s === "completed" ? "success" : s === "in_progress" ? "warn" : s === "skipped" ? "muted" : "muted";

// Which sections provide context to the Final Report synthesis
export const REPORT_STRUCTURE = [
  { heading: "Executive Summary", src: null },
  { heading: "Product Positioning", src: 1 },
  { heading: "Market", src: 1 },
  { heading: "Competitors", src: 2 },
  { heading: "Brand Direction", src: 3 },
  { heading: "Logo Direction", src: 4 },
  { heading: "Buyer Personas", src: 5 },
  { heading: "Keywords", src: 6 },
  { heading: "Offer", src: 7 },
  { heading: "Landing Page Strategy", src: 8 },
  { heading: "Section Image Prompts", src: 9 },
  { heading: "Copywriting", src: 10 },
  { heading: "Social Proof", src: 11 },
  { heading: "FAQ", src: 12 },
  { heading: "Email Popups", src: 13 },
  { heading: "Design System", src: 14 },
  { heading: "Design References", src: 15 },
  { heading: "Ad Strategy", src: 16 },
  { heading: "Static Ad Strategy", src: 17 },
  { heading: "Final Recommendations", src: null },
];