import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Settings, Save } from "lucide-react";
import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { Card } from "@/components/Atoms/Card";
import { Icon } from "@/components/Atoms/Icon";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { setUser } from "@/redux/slices/userSlice";
import api from "@/services/api";

export default function ProfileSettingsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  const { t } = useTranslation();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture ?? "");

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      const { data } = await api.patch(`/users/${user!._id}`, payload);
      return data.data;
    },
    onSuccess: (updatedUser) => {
      dispatch(setUser(updatedUser));
      toast.success(t("settings.profile.success"));
    },
    onError: () => {
      toast.error(t("settings.profile.error"));
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload: Record<string, string> = { firstName, lastName };
    if (phone) payload.phone = phone;
    if (profilePicture) payload.profilePicture = profilePicture;
    mutate(payload);
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Icon icon={Settings} size="lg" className="text-primary" />
          <Heading level={1}>{t("settings.profile.title")}</Heading>
        </div>
        <Text variant="lead" color="muted">{t("settings.profile.subtitle")}</Text>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("settings.profile.firstName")}
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("settings.profile.lastName")}
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("settings.profile.email")}
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-muted text-muted-foreground cursor-not-allowed"
            />
            <Text variant="small" color="muted" className="mt-1">
              {t("settings.profile.emailNote")}
            </Text>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("settings.profile.phone")}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background text-foreground"
              placeholder="+1 555 000 0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("settings.profile.profilePicture")}
            </label>
            <input
              type="url"
              value={profilePicture}
              onChange={(e) => setProfilePicture(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background text-foreground"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={isPending} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {isPending ? t("settings.profile.saving") : t("settings.profile.save")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
