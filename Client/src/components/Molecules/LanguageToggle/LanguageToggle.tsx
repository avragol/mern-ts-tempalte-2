import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const isHebrew = i18n.language === "he";

  const toggle = () => {
    i18n.changeLanguage(isHebrew ? "en" : "he");
  };

  return (
    <button
      onClick={toggle}
      title={isHebrew ? "Switch to English" : "עבור לעברית"}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors border border-sidebar-border"
    >
      <span className={isHebrew ? "text-primary" : "opacity-50"}>עב</span>
      <span className="text-sidebar-foreground/30">|</span>
      <span className={!isHebrew ? "text-primary" : "opacity-50"}>EN</span>
    </button>
  );
}
