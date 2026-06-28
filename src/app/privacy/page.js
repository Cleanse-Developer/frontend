"use client";
import "./privacy.css";
import LegalPage from "@/components/LegalPage/LegalPage";
import { cmsPrivacyDefault } from "@/data/legalDefaults";

export default function Privacy() {
  return <LegalPage settingsKey="cmsPrivacy" fallback={cmsPrivacyDefault} />;
}
