import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, BookOpen, Code2, Bookmark, Bot, Plus } from "lucide-react";
import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { Card } from "@/components/Atoms/Card";
import { Icon } from "@/components/Atoms/Icon";
import { Badge } from "@/components/Atoms/Badge";
import { getItems } from "@/services/items";
import type { ItemType } from "@/types/itemsTypes";

const TYPE_CONFIG: Record<ItemType, { icon: typeof FileText; label: string; color: string; badgeVariant: "default" | "primary" | "success" | "warning" | "error" | "info" }> = {
  note: { icon: FileText, label: "Notes", color: "text-yellow-600", badgeVariant: "warning" },
  article: { icon: BookOpen, label: "Articles", color: "text-blue-600", badgeVariant: "primary" },
  snippet: { icon: Code2, label: "Snippets", color: "text-green-600", badgeVariant: "success" },
  bookmark: { icon: Bookmark, label: "Bookmarks", color: "text-purple-600", badgeVariant: "info" },
  "ai-rule": { icon: Bot, label: "AI Rules", color: "text-orange-600", badgeVariant: "default" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const { data: allItems } = useQuery({
    queryKey: ["items"],
    queryFn: () => getItems({ limit: 100 }),
  });

  const { data: recentItems } = useQuery({
    queryKey: ["items", "recent"],
    queryFn: () => getItems({ limit: 5 }),
  });

  const typeCounts = (Object.keys(TYPE_CONFIG) as ItemType[]).map((type) => ({
    type,
    count: allItems?.data.filter((i) => i.type === type).length ?? 0,
    ...TYPE_CONFIG[type],
  }));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Icon icon={LayoutDashboard} size="lg" className="text-blue-600" />
            <Heading level={1}>Dashboard</Heading>
          </div>
          <button
            onClick={() => navigate("/items/new")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Item
          </button>
        </div>
        <Text variant="lead" color="muted">
          Your knowledge base at a glance.
        </Text>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {typeCounts.map(({ type, count, icon, label, color }) => (
          <Card
            key={type}
            hover
            variant="outlined"
            className="cursor-pointer"
            onClick={() => navigate(`/items?type=${type}`)}
          >
            <div className="flex flex-col items-center gap-2 py-2">
              <Icon icon={icon} size="lg" className={color} />
              <Heading level={3} className="text-2xl font-bold">
                {count}
              </Heading>
              <Text variant="small" color="muted">{label}</Text>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <Heading level={3}>Recent Items</Heading>
              <button
                onClick={() => navigate("/items")}
                className="text-sm text-blue-600 hover:underline"
              >
                View all
              </button>
            </div>
            {recentItems?.data.length === 0 ? (
              <Text color="muted">No items yet. Create your first one!</Text>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentItems?.data.map((item) => {
                  const cfg = TYPE_CONFIG[item.type];
                  return (
                    <div
                      key={item._id}
                      className="py-3 flex items-start justify-between gap-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded"
                      onClick={() => navigate(`/items/${item._id}`)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon icon={cfg.icon} size="sm" className={cfg.color} />
                        <div className="min-w-0">
                          <Text className="font-medium truncate">{item.title}</Text>
                          <Text variant="small" color="muted">{formatDate(item.createdAt)}</Text>
                        </div>
                      </div>
                      <Badge variant={cfg.badgeVariant} size="sm">{cfg.label}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card>
            <Heading level={3} className="mb-4">Quick Actions</Heading>
            <div className="flex flex-col gap-2">
              {(Object.entries(TYPE_CONFIG) as [ItemType, typeof TYPE_CONFIG[ItemType]][]).map(([type, cfg]) => (
                <button
                  key={type}
                  onClick={() => navigate(`/items/new?type=${type}`)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <Icon icon={cfg.icon} size="sm" className={cfg.color} />
                  <Text variant="small">New {cfg.label.slice(0, -1)}</Text>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
