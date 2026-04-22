import { useState } from "react";
import { Settings, Globe } from "lucide-react";
import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { Card } from "@/components/Atoms/Card";
import { Icon } from "@/components/Atoms/Icon";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const LANG_KEY = "golda_lang";

export default function GeneralSettingsPage() {
  const [lang, setLang] = useState<string>(
    localStorage.getItem(LANG_KEY) ?? "en"
  );

  const handleSave = () => {
    localStorage.setItem(LANG_KEY, lang);
    toast.success("Language preference saved");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Icon icon={Settings} size="lg" className="text-primary" />
          <Heading level={1}>General Settings</Heading>
        </div>
        <Text variant="lead" color="muted">
          Application preferences
        </Text>
      </div>

      <div className="space-y-6">
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <Globe className="w-5 h-5 text-primary" />
            <Heading level={3}>Language</Heading>
          </div>

          <div className="space-y-3 mb-6">
            {[
              { value: "en", label: "English", native: "English" },
              { value: "he", label: "Hebrew", native: "עברית" },
            ].map(({ value, label, native }) => (
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
                <span className="text-sm text-muted-foreground">({native})</span>
              </label>
            ))}
          </div>

          <Text variant="small" color="muted" className="mb-4">
            Full language switching with Hebrew RTL layout is coming soon.
          </Text>

          <Button onClick={handleSave}>Save preference</Button>
        </Card>
      </div>
    </div>
  );
}
