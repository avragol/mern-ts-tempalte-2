import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Edit2, Trash2, ArrowLeft, FileText, BookOpen, Code2, Bookmark, Bot, Globe, Lock } from "lucide-react";
import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { Badge } from "@/components/Atoms/Badge";
import { Card } from "@/components/Atoms/Card";
import { Icon } from "@/components/Atoms/Icon";
import { LoadingSpinner } from "@/components/Atoms/LoadingSpinner";
import RichTextEditor from "@/components/Molecules/RichTextEditor";
import { getItemById, deleteItem } from "@/services/items";
import type { ItemType } from "@/types/itemsTypes";
import toast from "react-hot-toast";

const TYPE_CONFIG: Record<ItemType, { icon: typeof FileText; labelKey: string; color: string; badgeVariant: "default" | "primary" | "success" | "warning" | "error" | "info" }> = {
  note: { icon: FileText, labelKey: "items.typesSingular.note", color: "text-yellow-600", badgeVariant: "warning" },
  article: { icon: BookOpen, labelKey: "items.typesSingular.article", color: "text-blue-600", badgeVariant: "primary" },
  snippet: { icon: Code2, labelKey: "items.typesSingular.snippet", color: "text-green-600", badgeVariant: "success" },
  bookmark: { icon: Bookmark, labelKey: "items.typesSingular.bookmark", color: "text-purple-600", badgeVariant: "info" },
  "ai-rule": { icon: Bot, labelKey: "items.typesSingular.aiRule", color: "text-orange-600", badgeVariant: "default" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: item, isLoading, isError } = useQuery({
    queryKey: ["item", id],
    queryFn: () => getItemById(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteItem(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success(t("itemDetail.deleted"));
      navigate("/items");
    },
    onError: () => toast.error(t("itemDetail.deleteFailed")),
  });

  const handleDelete = () => {
    if (window.confirm(t("itemDetail.deleteConfirm"))) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="text-center py-20">
        <Text color="muted">{t("itemDetail.notFound")}</Text>
        <button onClick={() => navigate("/items")} className="mt-4 text-primary hover:underline text-sm">
          {t("itemDetail.backLink")}
        </button>
      </div>
    );
  }

  const cfg = TYPE_CONFIG[item.type];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => navigate("/items")}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("itemDetail.backToKnowledgeBase")}
        </button>
      </div>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3 min-w-0">
          <Icon icon={cfg.icon} size="lg" className={`${cfg.color} mt-1 shrink-0`} />
          <div className="min-w-0">
            <Heading level={1} className="break-words">{item.title}</Heading>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <Badge variant={cfg.badgeVariant} size="sm">{t(cfg.labelKey)}</Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {item.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {item.isPublic ? t("itemDetail.public") : t("itemDetail.private")}
              </span>
              <Text variant="small" color="muted">{formatDate(item.createdAt)}</Text>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate(`/items/${item._id}/edit`)}
            className="flex items-center gap-1 px-3 py-2 border border-border rounded-lg hover:bg-muted text-sm text-foreground"
          >
            <Edit2 className="w-4 h-4" />
            {t("itemDetail.edit")}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-1 px-3 py-2 border border-destructive/30 rounded-lg hover:bg-destructive/10 text-sm text-destructive disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {t("itemDetail.delete")}
          </button>
        </div>
      </div>

      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="default" size="sm">{tag}</Badge>
          ))}
        </div>
      )}

      {item.type === "bookmark" && item.metadata?.url && (
        <Card variant="outlined" className="mb-6 p-4">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-purple-600 shrink-0" />
            <a
              href={item.metadata.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm break-all"
            >
              {item.metadata.url}
            </a>
          </div>
        </Card>
      )}

      {item.type === "snippet" && item.metadata?.language && (
        <div className="mb-4">
          <Badge variant="success" size="sm">{item.metadata.language}</Badge>
        </div>
      )}

      {item.type === "ai-rule" && item.metadata?.platform && (
        <div className="mb-4">
          <Badge variant="default" size="sm">
            {t("itemDetail.platform", { platform: item.metadata.platform })}
          </Badge>
        </div>
      )}

      {item.content && (
        <Card variant="outlined" className="mb-6">
          <RichTextEditor content={item.content} onChange={() => {}} readOnly />
        </Card>
      )}

      {item.attachments.length > 0 && (
        <Card variant="outlined">
          <Heading level={3} className="mb-3 text-base">{t("itemDetail.attachments")}</Heading>
          <div className="flex flex-wrap gap-3">
            {item.attachments.map((url) => {
              const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
              return isImage ? (
                <img key={url} src={url} alt="" className="w-32 h-32 object-cover rounded-lg border border-border" />
              ) : (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {url.split("/").pop()}
                </a>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
