import { useNavigate } from "react-router";
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
  const { user } = useAppSelector((state) => state.user);
  const isAuthenticated = !!user;

  const contentTypes = [
    {
      icon: FileText,
      title: "Notes",
      description: "Quick thoughts, meeting notes, and ideas — always within reach",
      iconColor: "text-amber-600",
      iconBgColor: "bg-amber-50",
    },
    {
      icon: BookOpen,
      title: "Articles",
      description: "Long-form documents and research, richly formatted and searchable",
      iconColor: "text-blue-700",
      iconBgColor: "bg-blue-50",
    },
    {
      icon: Bookmark,
      title: "Bookmarks",
      description: "Save web links with context — no more lost tabs or forgotten URLs",
      iconColor: "text-purple-700",
      iconBgColor: "bg-purple-50",
    },
    {
      icon: Code2,
      title: "Code Snippets",
      description: "Store reusable code with language tagging and syntax highlighting",
      iconColor: "text-green-700",
      iconBgColor: "bg-green-50",
    },
    {
      icon: Bot,
      title: "AI Rules & Skills",
      description: "Organise your custom AI prompts, rules, and agent configurations",
      iconColor: "text-orange-700",
      iconBgColor: "bg-orange-50",
    },
    {
      icon: Tags,
      title: "Tags & Full-Text Search",
      description: "Find anything instantly — search across titles, content, and tags",
      iconColor: "text-rose-700",
      iconBgColor: "bg-rose-50",
    },
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
            <span className="text-foreground/80">Your team's knowledge, organised</span>
          </Badge>
        }
        title={
          <>
            <Heading level={1} className="mb-3">
              One place for
            </Heading>
            <Heading level={1} gradient>
              everything you know
            </Heading>
          </>
        }
        description="Golda is a personal and team knowledge base for notes, articles, bookmarks, code snippets, and AI rules — all searchable, tagged, and always with you."
        actions={
          <>
            {!isAuthenticated ? (
              <Button
                onClick={() => navigate("/register")}
                size="lg"
                className="text-lg px-8 py-6"
              >
                Get started free
                <Icon icon={ArrowRight} size="md" className="ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/items")}
                size="lg"
                className="text-lg px-8 py-6"
              >
                Open knowledge base
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
                Sign in
              </Button>
            )}
          </>
        }
      />

      {/* Content Types */}
      <Section
        title="Everything in one place"
        subtitle="Five content types, one unified workspace"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {contentTypes.map((item, i) => (
            <FeatureCard
              key={i}
              icon={item.icon}
              title={item.title}
              description={item.description}
              iconColor={item.iconColor}
              iconBgColor={item.iconBgColor}
            />
          ))}
        </div>
      </Section>

      {/* Benefits */}
      <Section title="Built for teams and individuals">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Search,
              title: "Instant search",
              desc: "Full-text search across all your content — find anything in seconds",
            },
            {
              icon: Users,
              title: "Team-ready",
              desc: "Share knowledge with your team. Role-based access keeps things organised",
            },
            {
              icon: Tags,
              title: "Smart tagging",
              desc: "Tag your content and filter by type, tag, or date to find what you need",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon icon={icon} size="lg" className="text-primary" />
              </div>
              <Heading level={3} className="mb-2">
                {title}
              </Heading>
              <Text color="muted">{desc}</Text>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="py-20 px-6 bg-secondary">
        <div className="max-w-3xl mx-auto text-center">
          <Heading level={2} className="mb-4 text-secondary-foreground">
            Ready to organise your knowledge?
          </Heading>
          <Text variant="lead" className="mb-8 text-secondary-foreground/70">
            Start capturing, organising, and sharing what you know.
          </Text>
          {!isAuthenticated ? (
            <Button
              onClick={() => navigate("/register")}
              size="lg"
              className="text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Create your free account
              <Icon icon={ArrowRight} size="md" className="ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/items")}
              size="lg"
              className="text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Go to my knowledge base
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
