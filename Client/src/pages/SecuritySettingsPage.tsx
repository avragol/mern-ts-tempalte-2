import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Shield, Lock } from "lucide-react";
import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { Card } from "@/components/Atoms/Card";
import { Icon } from "@/components/Atoms/Icon";
import { Button } from "@/components/ui/button";
import api from "@/services/api";

export default function SecuritySettingsPage() {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
      const { data } = await api.post("/auth/change-password", payload);
      return data;
    },
    onSuccess: () => {
      toast.success(t("settings.security.success"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setValidationError("");
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? t("settings.security.success"));
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setValidationError("");
    if (newPassword.length < 8) {
      setValidationError(t("settings.security.minLength"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError(t("settings.security.noMatch"));
      return;
    }
    mutate({ currentPassword, newPassword });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Icon icon={Shield} size="lg" className="text-primary" />
          <Heading level={1}>{t("settings.security.title")}</Heading>
        </div>
        <Text variant="lead" color="muted">{t("settings.security.subtitle")}</Text>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-5 h-5 text-primary" />
          <Heading level={3}>{t("settings.security.changePassword")}</Heading>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {validationError && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg px-4 py-3">
              {validationError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("settings.security.currentPassword")}
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background text-foreground"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("settings.security.newPassword")}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background text-foreground"
              placeholder={t("auth.register.passwordPlaceholder")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("settings.security.confirmPassword")}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background text-foreground"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? t("settings.security.submitting") : t("settings.security.submit")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
