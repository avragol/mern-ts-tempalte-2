import { useTranslation } from "react-i18next";
import { Text } from "@/components/Atoms/Text";
import { cn } from "@/lib/utils";

export interface FooterProps {
  appName?: string;
  currentYear?: number;
  className?: string;
}

export default function Footer({
  appName = "Golda",
  currentYear = new Date().getFullYear(),
  className,
}: FooterProps) {
  const { t } = useTranslation();

  const links = [
    { labelKey: "footer.privacy", href: "#" },
    { labelKey: "footer.terms", href: "#" },
    { labelKey: "footer.contact", href: "#" },
  ];

  return (
    <footer className={cn("border-t border-border bg-background py-4 px-6", className)}>
      <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
        <Text variant="small" color="muted">
          © {currentYear} {appName}. {t("footer.allRights")}
        </Text>
        <div className="flex space-x-6">
          {links.map((link) => (
            <a
              key={link.labelKey}
              href={link.href}
              className="text-muted-foreground hover:text-primary text-sm transition-colors"
            >
              {t(link.labelKey)}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

