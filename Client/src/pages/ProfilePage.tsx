import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/redux/hooks";
import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { Card } from "@/components/Atoms/Card";

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.user);
  const { t } = useTranslation();

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Text color="muted">{t("profile.loginRequired")}</Text>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Heading level={1} className="mb-6">{t("profile.title")}</Heading>
      <Card>
        <div className="flex items-center gap-4 mb-6">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.firstName}
              className="w-16 h-16 rounded-full border-2 border-primary/20"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xl">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
          )}
          <div>
            <Heading level={2}>{user.firstName} {user.lastName}</Heading>
            <Text color="muted">{user.email}</Text>
          </div>
        </div>
        <div className="space-y-3 border-t border-border pt-4">
          {[
            { label: t("profile.role"), value: user.role },
            { label: t("profile.userId"), value: user._id },
            user.phone ? { label: t("profile.phone"), value: user.phone } : null,
            user.createdAt ? { label: t("profile.createdAt"), value: new Date(user.createdAt).toLocaleDateString() } : null,
            user.updatedAt ? { label: t("profile.lastUpdated"), value: new Date(user.updatedAt).toLocaleDateString() } : null,
          ].filter(Boolean).map((row) => (
            <div key={row!.label} className="flex gap-3">
              <Text variant="small" color="muted" className="w-36 shrink-0 font-medium">{row!.label}</Text>
              <Text variant="small" className="break-all">{row!.value}</Text>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
