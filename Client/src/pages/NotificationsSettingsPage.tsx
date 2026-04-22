import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, Mail, Rss } from "lucide-react";
import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { Card } from "@/components/Atoms/Card";
import { Icon } from "@/components/Atoms/Icon";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const PREFS_KEY = "golda_notif_prefs";

interface NotifPrefs {
  emailSharedItem: boolean;
  browserNotifications: boolean;
  weeklyDigest: boolean;
}

const defaultPrefs: NotifPrefs = {
  emailSharedItem: false,
  browserNotifications: false,
  weeklyDigest: false,
};

function loadPrefs(): NotifPrefs {
  try {
    return { ...defaultPrefs, ...JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}") };
  } catch {
    return defaultPrefs;
  }
}

export default function NotificationsSettingsPage() {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState<NotifPrefs>(loadPrefs);

  const toggle = (key: keyof NotifPrefs) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleSave = () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    toast.success(t("settings.notifications.success"));
  };

  const items: Array<{
    key: keyof NotifPrefs;
    icon: typeof Mail;
    labelKey: string;
    descKey: string;
  }> = [
    {
      key: "emailSharedItem",
      icon: Mail,
      labelKey: "settings.notifications.emailSharedItem",
      descKey: "settings.notifications.emailSharedItemDesc",
    },
    {
      key: "browserNotifications",
      icon: Bell,
      labelKey: "settings.notifications.browserNotifications",
      descKey: "settings.notifications.browserNotificationsDesc",
    },
    {
      key: "weeklyDigest",
      icon: Rss,
      labelKey: "settings.notifications.weeklyDigest",
      descKey: "settings.notifications.weeklyDigestDesc",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Icon icon={Bell} size="lg" className="text-primary" />
          <Heading level={1}>{t("settings.notifications.title")}</Heading>
        </div>
        <Text variant="lead" color="muted">
          {t("settings.notifications.subtitle")}
        </Text>
      </div>

      <Card>
        <div className="divide-y divide-border">
          {items.map(({ key, icon: ItemIcon, labelKey, descKey }) => (
            <div
              key={key}
              className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
            >
              <div className="flex items-start gap-3">
                <ItemIcon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <Text className="font-medium">{t(labelKey)}</Text>
                  <Text variant="small" color="muted">
                    {t(descKey)}
                  </Text>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[key]}
                onClick={() => toggle(key)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  prefs[key] ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                    prefs[key] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <Button onClick={handleSave}>{t("settings.notifications.save")}</Button>
        </div>
      </Card>
    </div>
  );
}
