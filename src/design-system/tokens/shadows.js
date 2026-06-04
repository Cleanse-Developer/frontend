/**
 * Shadow tokens — named box-shadow values extracted verbatim from component CSS.
 * Use these in new components so elevation stays consistent with the existing UI.
 */
export const shadows = {
  heroCard: "0 1.75rem 2.5rem -1.25rem rgba(68, 40, 36, 0.45)", // home .hero
  formulaBox: "0 0.25rem 1.25rem rgba(0, 0, 0, 0.08)", // home .formula-box
  ritualCard: "0 40px 70px -46px rgba(46, 31, 20, 0.6)", // RitualBanner .rhr-card
  ritualCardHover: "0 60px 90px -48px rgba(46, 31, 20, 0.65)", // RitualBanner hover
  footerPanel: "0 16px 34px rgba(68, 40, 36, 0.22)", // Footer dropdown panel
  blogCard: "0 25px 50px rgba(79, 44, 34, 0.12)", // BlogSection card
  productCard: "0 10px 40px rgba(0, 0, 0, 0.1)", // ShopByProduct / product card
  navFloat: "0 4px 20px rgba(0, 0, 0, 0.1)", // ShopByProduct nav
  menuSearch: "0 12px 32px rgba(0, 0, 0, 0.28)", // Menu search box
  menuDropdown: "0 8px 24px rgba(0, 0, 0, 0.3)", // Menu selector dropdown
  localeDropdown: "0 10px 24px rgba(0, 0, 0, 0.18)", // Menu locale dropdown
  modal: "0 25px 60px rgba(0, 0, 0, 0.15)", // NewsletterPopup modal
  hoverWord: "0 10px 40px rgba(0, 0, 0, 0.15)", // HoverWord card
  ctaBtnHover: "0 10px 30px rgba(132, 89, 44, 0.3)", // featured cta hover
};

export default shadows;
