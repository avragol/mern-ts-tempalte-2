import { useState } from "react";
import { Settings, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { Card } from "@/components/Atoms/Card";
import { Icon } from "@/components/Atoms/Icon";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function GeneralSettingsPage() {
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState<string>(i18n.language === "he" ? "he" : "en");

  const handleSave = () => {
    i18n.changeLanguage(lang);
    toast.success(t("settings.general.success"));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Icon icon={Settings} size="lg" className="text-primary" />
          <Heading level={1}>{t("settings.general.title")}</Heading>
        </div>
        <Text variant="lead" color="muted">
          {t("settings.general.subtitle")}
        </Text>
      </div>

      <div className="space-y-6">
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <Globe className="w-5 h-5 text-primary" />
            <Heading level={3}>{t("settings.general.language")}</Heading>
          </div>

          <div className="space-y-3 mb-5">
            {[
              { value: "en", label: t("settings.general.english") },
              { value: "he", label: t("settings.general.hebrew") },
            ].map(({ value, label }) => (
              <label key={value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="language"
                  value={value}
                  checked={lang === value}
                  onChange={() => setLang(value)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </label>
            ))}
          </div>

          <Text variant="small" color="muted" className="mb-4">
            {t("settings.general.languageNote")}
          </Text>

          <Button onClick={handleSave}>{t("settings.general.save")}</Button>
        </Card>
      </div>
    </div>
  );
}
