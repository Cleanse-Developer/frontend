"use client";
import "./terms.css";
import LegalPage from "@/components/LegalPage/LegalPage";
import { cmsTermsDefault } from "@/data/legalDefaults";

export default function Terms() {
  return <LegalPage settingsKey="cmsTerms" fallback={cmsTermsDefault} />;
}
