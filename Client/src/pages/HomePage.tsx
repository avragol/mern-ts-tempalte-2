import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Bookmark,
  Code2,
  Bot,
  BookOpen,
  ArrowRight,
  Search,
  Tags,
  Users,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/Atoms/Badge";
import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { Icon } from "@/components/Atoms/Icon";
import { FeatureCard } from "@/components/Molecules/FeatureCard";
import { Section } from "@/components/Molecules/Section";
import { Hero } from "@/components/Molecules/Hero";
import { useAppSelector } from "@/redux/hooks";

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.user);
  const isAuthenticated = !!user;

  const contentTypes = [
    {
      icon: FileText,
      titleKey: "home.features.notes.title",
      descKey: "home.features.notes.desc",
      iconColor: "text-amber-600",
      iconBgColor: "bg-amber-50",
    },
    {
      icon: BookOpen,
      titleKey: "home.features.articles.title",
      descKey: "home.features.articles.desc",
      iconColor: "text-blue-700",
      iconBgColor: "bg-blue-50",
    },
    {
      icon: Bookmark,
      titleKey: "home.features.bookmarks.title",
      descKey: "home.features.bookmarks.desc",
      iconColor: "text-purple-700",
      iconBgColor: "bg-purple-50",
    },
    {
      icon: Code2,
      titleKey: "home.features.snippets.title",
      descKey: "home.features.snippets.desc",
      iconColor: "text-green-700",
      iconBgColor: "bg-green-50",
    },
    {
      icon: Bot,
      titleKey: "home.features.aiRules.title",
      descKey: "home.features.aiRules.desc",
      iconColor: "text-orange-700",
      iconBgColor: "bg-orange-50",
    },
    {
      icon: Tags,
      titleKey: "home.features.search.title",
      descKey: "home.features.search.desc",
      iconColor: "text-rose-700",
      iconBgColor: "bg-rose-50",
    },
  ];

  const benefits = [
    { icon: Search, titleKey: "home.benefits.search.title", descKey: "home.benefits.search.desc" },
    { icon: Users, titleKey: "home.benefits.teams.title", descKey: "home.benefits.teams.desc" },
    { icon: Tags, titleKey: "home.benefits.tags.title", descKey: "home.benefits.tags.desc" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <Hero
        badge={
          <Badge
            variant="default"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-primary/20"
          >
            <Icon icon={Sparkles} size="sm" className="text-primary" />
            <span className="text-foreground/80">{t("home.badge")}</span>
          </Badge>
        }
        title={
          <>
            <Heading level={1} className="mb-3">
              {t("home.title1")}
            </Heading>
            <Heading level={1} gradient>
              {t("home.title2")}
            </Heading>
          </>
        }
        description={t("home.description")}
        actions={
          <>
            {!isAuthenticated ? (
              <Button
                onClick={() => navigate("/register")}
                size="lg"
                className="text-lg px-8 py-6"
              >
                {t("home.getStarted")}
                <Icon icon={ArrowRight} size="md" className="ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/items")}
                size="lg"
                className="text-lg px-8 py-6"
              >
                {t("home.openKnowledgeBase")}
                <Icon icon={ArrowRight} size="md" className="ml-2" />
              </Button>
            )}
            {!isAuthenticated && (
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6"
                onClick={() => navigate("/login")}
              >
                {t("home.signIn")}
              </Button>
            )}
          </>
        }
      />

      {/* Content Types */}
      <Section
        title={t("home.everythingTitle")}
        subtitle={t("home.everythingSubtitle")}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {contentTypes.map((item) => (
            <FeatureCard
              key={item.titleKey}
              icon={item.icon}
              title={t(item.titleKey)}
              description={t(item.descKey)}
              iconColor={item.iconColor}
              iconBgColor={item.iconBgColor}
            />
          ))}
        </div>
      </Section>

      {/* Benefits */}
      <Section title={t("home.builtForTeams")}>
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map(({ icon, titleKey, descKey }) => (
            <div key={titleKey} className="text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon icon={icon} size="lg" className="text-primary" />
              </div>
              <Heading level={3} className="mb-2">
                {t(titleKey)}
              </Heading>
              <Text color="muted">{t(descKey)}</Text>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="py-20 px-6 bg-secondary">
        <div className="max-w-3xl mx-auto text-center">
          <Heading level={2} className="mb-4 text-secondary-foreground">
            {t("home.ctaTitle")}
          </Heading>
          <Text variant="lead" className="mb-8 text-secondary-foreground/70">
            {t("home.ctaSubtitle")}
          </Text>
          {!isAuthenticated ? (
            <Button
              onClick={() => navigate("/register")}
              size="lg"
              className="text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t("home.createAccount")}
              <Icon icon={ArrowRight} size="md" className="ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/items")}
              size="lg"
              className="text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t("home.goToKnowledgeBase")}
              <Icon icon={ArrowRight} size="md" className="ml-2" />
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

export const HomePageLoader = async () => {
  return { message: "Welcome to Golda" };
};
