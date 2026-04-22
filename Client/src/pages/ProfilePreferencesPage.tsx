import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Sliders, LayoutGrid, List } from "lucide-react";
import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { Card } from "@/components/Atoms/Card";
import { Icon } from "@/components/Atoms/Icon";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const PREFS_KEY = "golda_display_prefs";

interface DisplayPrefs {
  defaultView: "grid" | "list";
  itemsPerPage: 10 | 25 | 50;
}

const defaultPrefs: DisplayPrefs = { defaultView: "list", itemsPerPage: 25 };

function loadPrefs(): DisplayPrefs {
  try {
    return {
      ...defaultPrefs,
      ...JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}"),
    };
  } catch {
    return defaultPrefs;
  }
}

export default function ProfilePreferencesPage() {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState<DisplayPrefs>(loadPrefs);

  const handleSave = () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    toast.success(t("settings.preferences.success"));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Icon icon={Sliders} size="lg" className="text-primary" />
          <Heading level={1}>{t("settings.preferences.title")}</Heading>
        </div>
        <Text variant="lead" color="muted">
          {t("settings.preferences.subtitle")}
        </Text>
      </div>

      <div className="space-y-6">
        <Card>
          <Heading level={3} className="mb-5">
            {t("settings.preferences.defaultView")}
          </Heading>
          <div className="flex gap-3">
            {(["list", "grid"] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setPrefs((p) => ({ ...p, defaultView: view }))}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  prefs.defaultView === view
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {view === "list" ? (
                  <List className="w-4 h-4" />
                ) : (
                  <LayoutGrid className="w-4 h-4" />
                )}
                {view === "list" ? t("settings.preferences.list") : t("settings.preferences.grid")}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <Heading level={3} className="mb-5">
            {t("settings.preferences.itemsPerPage")}
          </Heading>
          <div className="flex gap-3">
            {([10, 25, 50] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPrefs((p) => ({ ...p, itemsPerPage: n }))}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                  prefs.itemsPerPage === n
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </Card>

        <Button onClick={handleSave}>{t("settings.preferences.save")}</Button>
      </div>
    </div>
  );
}
