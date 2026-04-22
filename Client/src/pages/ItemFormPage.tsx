import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Save, FileText, BookOpen, Code2, Bookmark, Bot } from "lucide-react";
import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { Card } from "@/components/Atoms/Card";
import { Icon } from "@/components/Atoms/Icon";
import RichTextEditor from "@/components/Molecules/RichTextEditor";
import TagInput from "@/components/Molecules/TagInput";
import FileUpload from "@/components/Molecules/FileUpload";
import { createItem, updateItem, getItemById, getTags } from "@/services/items";
import type { ItemType, CreateItemPayload, IItem } from "@/types/itemsTypes";
import toast from "react-hot-toast";

const TYPE_OPTIONS: { value: ItemType; icon: typeof FileText; labelKey: string; descKey: string }[] = [
  { value: "note", icon: FileText, labelKey: "items.typesSingular.note", descKey: "items.typeDesc.note" },
  { value: "article", icon: BookOpen, labelKey: "items.typesSingular.article", descKey: "items.typeDesc.article" },
  { value: "snippet", icon: Code2, labelKey: "items.typesSingular.snippet", descKey: "items.typeDesc.snippet" },
  { value: "bookmark", icon: Bookmark, labelKey: "items.typesSingular.bookmark", descKey: "items.typeDesc.bookmark" },
  { value: "ai-rule", icon: Bot, labelKey: "items.typesSingular.aiRule", descKey: "items.typeDesc.aiRule" },
];

const SNIPPET_LANGUAGES = ["typescript", "javascript", "python", "rust", "go", "java", "css", "html", "sql", "bash", "other"];
const AI_PLATFORMS = ["claude", "cursor", "chatgpt", "copilot", "gemini", "other"];

interface ItemFormPageProps {
  editId?: string;
}

export default function ItemFormPage({ editId }: ItemFormPageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type") as ItemType | null;

  const [type, setType] = useState<ItemType>(initialType ?? "note");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<string[]>([]);

  const isEditing = !!editId;

  const { data: existingItem } = useQuery({
    queryKey: ["item", editId],
    queryFn: () => getItemById(editId!),
    enabled: isEditing,
  });

  const { data: availableTags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
  });

  useEffect(() => {
    if (existingItem) {
      setType(existingItem.type);
      setTitle(existingItem.title);
      setContent(existingItem.content);
      setTags(existingItem.tags);
      setIsPublic(existingItem.isPublic);
      setMetadata((existingItem.metadata as Record<string, string>) ?? {});
      setAttachments(existingItem.attachments);
    }
  }, [existingItem]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateItemPayload) => createItem(payload),
    onSuccess: (item: IItem) => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success(t("itemForm.created"));
      navigate(`/items/${item._id}`);
    },
    onError: () => toast.error(t("itemForm.createFailed")),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: CreateItemPayload) => updateItem(editId!, payload),
    onSuccess: (item: IItem) => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["item", editId] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success(t("itemForm.updated"));
      navigate(`/items/${item._id}`);
    },
    onError: () => toast.error(t("itemForm.updateFailed")),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error(t("itemForm.titleRequired"));
      return;
    }
    const payload: CreateItemPayload = {
      title: title.trim(),
      content,
      type,
      tags,
      isPublic,
      metadata: Object.keys(metadata).length ? metadata : undefined,
      attachments,
    };
    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => navigate(isEditing ? `/items/${editId}` : "/items")}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {isEditing ? t("itemForm.backToItem") : t("itemForm.backToKnowledgeBase")}
        </button>
      </div>

      <Heading level={1} className="mb-6">
        {isEditing ? t("itemForm.editItem") : t("itemForm.newItem")}
      </Heading>

      <form onSubmit={handleSubmit} className="space-y-6">
        {!isEditing && (
          <Card variant="outlined">
            <Text className="font-medium mb-3">{t("itemForm.itemType")}</Text>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                    type === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-border/80"
                  }`}
                >
                  <Icon
                    icon={opt.icon}
                    size="md"
                    className={type === opt.value ? "text-primary" : "text-muted-foreground"}
                  />
                  <Text
                    variant="small"
                    className={`text-center font-medium ${type === opt.value ? "text-primary" : ""}`}
                  >
                    {t(opt.labelKey)}
                  </Text>
                </button>
              ))}
            </div>
          </Card>
        )}

        <Card variant="outlined">
          <label className="block">
            <Text className="font-medium mb-1">{t("itemForm.title")} *</Text>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("itemForm.titlePlaceholder")}
              required
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background text-foreground"
            />
          </label>
        </Card>

        {type === "bookmark" && (
          <Card variant="outlined">
            <Text className="font-medium mb-1">{t("itemForm.url")}</Text>
            <input
              type="url"
              value={metadata.url ?? ""}
              onChange={(e) => setMetadata((m) => ({ ...m, url: e.target.value }))}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background text-foreground"
            />
          </Card>
        )}

        {type === "snippet" && (
          <Card variant="outlined">
            <Text className="font-medium mb-1">{t("itemForm.language")}</Text>
            <select
              value={metadata.language ?? ""}
              onChange={(e) => setMetadata((m) => ({ ...m, language: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background text-foreground"
            >
              <option value="">{t("itemForm.selectLanguage")}</option>
              {SNIPPET_LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </Card>
        )}

        {type === "ai-rule" && (
          <Card variant="outlined">
            <Text className="font-medium mb-1">{t("itemForm.platform")}</Text>
            <select
              value={metadata.platform ?? ""}
              onChange={(e) => setMetadata((m) => ({ ...m, platform: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background text-foreground"
            >
              <option value="">{t("itemForm.selectPlatform")}</option>
              {AI_PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Card>
        )}

        <Card variant="outlined">
          <Text className="font-medium mb-2">{t("itemForm.content")}</Text>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder={`${t(TYPE_OPTIONS.find((o) => o.value === type)?.descKey ?? "")}…`}
          />
        </Card>

        <Card variant="outlined">
          <Text className="font-medium mb-2">{t("itemForm.tags")}</Text>
          <TagInput
            tags={tags}
            onChange={setTags}
            suggestions={availableTags}
            placeholder={t("itemForm.tagsPlaceholder")}
          />
        </Card>

        <Card variant="outlined">
          <Text className="font-medium mb-2">{t("itemForm.attachments")}</Text>
          <FileUpload onUpload={(url) => setAttachments((a) => [...a, url])} />
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {attachments.map((url) => (
                <div key={url} className="flex items-center gap-1 text-sm bg-muted rounded px-2 py-1">
                  <span className="truncate max-w-xs">{url.split("/").pop()}</span>
                  <button
                    type="button"
                    onClick={() => setAttachments((a) => a.filter((u) => u !== url))}
                    className="text-muted-foreground hover:text-destructive ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card variant="outlined">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-primary"
            />
            <div>
              <Text className="font-medium">{t("itemForm.makePublic")}</Text>
              <Text variant="small" color="muted">{t("itemForm.makePublicDesc")}</Text>
            </div>
          </label>
        </Card>

        <div className="flex justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={() => navigate(isEditing ? `/items/${editId}` : "/items")}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted text-sm text-foreground"
          >
            {t("itemForm.cancel")}
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            {isPending
              ? t("itemForm.saving")
              : isEditing
              ? t("itemForm.save")
              : t("itemForm.create")}
          </button>
        </div>
      </form>
    </div>
  );
}
