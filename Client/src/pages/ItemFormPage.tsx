import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

const TYPE_OPTIONS: { value: ItemType; label: string; icon: typeof FileText; description: string }[] = [
  { value: "note", label: "Note", icon: FileText, description: "Quick thoughts and ideas" },
  { value: "article", label: "Article", icon: BookOpen, description: "Long-form content" },
  { value: "snippet", label: "Code Snippet", icon: Code2, description: "Reusable code blocks" },
  { value: "bookmark", label: "Bookmark", icon: Bookmark, description: "Save a URL for later" },
  { value: "ai-rule", label: "AI Rule/Skill", icon: Bot, description: "Prompts and AI instructions" },
];

const SNIPPET_LANGUAGES = ["typescript", "javascript", "python", "rust", "go", "java", "css", "html", "sql", "bash", "other"];
const AI_PLATFORMS = ["claude", "cursor", "chatgpt", "copilot", "gemini", "other"];

interface ItemFormPageProps {
  editId?: string;
}

export default function ItemFormPage({ editId }: ItemFormPageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
      toast.success("Item created");
      navigate(`/items/${item._id}`);
    },
    onError: () => toast.error("Failed to create item"),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: CreateItemPayload) => updateItem(editId!, payload),
    onSuccess: (item: IItem) => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["item", editId] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Item updated");
      navigate(`/items/${item._id}`);
    },
    onError: () => toast.error("Failed to update item"),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
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
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => navigate(isEditing ? `/items/${editId}` : "/items")}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {isEditing ? "Back to Item" : "Knowledge Base"}
        </button>
      </div>

      <Heading level={1} className="mb-6">{isEditing ? "Edit Item" : "New Item"}</Heading>

      <form onSubmit={handleSubmit} className="space-y-6">
        {!isEditing && (
          <Card variant="outlined">
            <Text className="font-medium mb-3">Item Type</Text>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                    type === opt.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Icon icon={opt.icon} size="md" className={type === opt.value ? "text-blue-600" : "text-gray-500"} />
                  <Text variant="small" className={`text-center font-medium ${type === opt.value ? "text-blue-700" : ""}`}>
                    {opt.label}
                  </Text>
                </button>
              ))}
            </div>
          </Card>
        )}

        <Card variant="outlined">
          <label className="block">
            <Text className="font-medium mb-1">Title *</Text>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your item a clear title"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </label>
        </Card>

        {type === "bookmark" && (
          <Card variant="outlined">
            <Text className="font-medium mb-1">URL</Text>
            <input
              type="url"
              value={metadata.url ?? ""}
              onChange={(e) => setMetadata((m) => ({ ...m, url: e.target.value }))}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </Card>
        )}

        {type === "snippet" && (
          <Card variant="outlined">
            <Text className="font-medium mb-1">Language</Text>
            <select
              value={metadata.language ?? ""}
              onChange={(e) => setMetadata((m) => ({ ...m, language: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Select language</option>
              {SNIPPET_LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </Card>
        )}

        {type === "ai-rule" && (
          <Card variant="outlined">
            <Text className="font-medium mb-1">Platform</Text>
            <select
              value={metadata.platform ?? ""}
              onChange={(e) => setMetadata((m) => ({ ...m, platform: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Select platform</option>
              {AI_PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Card>
        )}

        <Card variant="outlined">
          <Text className="font-medium mb-2">Content</Text>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder={`Write your ${TYPE_OPTIONS.find((o) => o.value === type)?.label.toLowerCase()} content here…`}
          />
        </Card>

        <Card variant="outlined">
          <Text className="font-medium mb-2">Tags</Text>
          <TagInput
            tags={tags}
            onChange={setTags}
            suggestions={availableTags}
            placeholder="Add tags (press Enter or comma)"
          />
        </Card>

        <Card variant="outlined">
          <Text className="font-medium mb-2">Attachments</Text>
          <FileUpload onUpload={(url) => setAttachments((a) => [...a, url])} />
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {attachments.map((url) => (
                <div key={url} className="flex items-center gap-1 text-sm bg-gray-100 rounded px-2 py-1">
                  <span className="truncate max-w-xs">{url.split("/").pop()}</span>
                  <button
                    type="button"
                    onClick={() => setAttachments((a) => a.filter((u) => u !== url))}
                    className="text-gray-400 hover:text-red-500 ml-1"
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
              className="w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <div>
              <Text className="font-medium">Make Public</Text>
              <Text variant="small" color="muted">Visible to all team members</Text>
            </div>
          </label>
        </Card>

        <div className="flex justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={() => navigate(isEditing ? `/items/${editId}` : "/items")}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm text-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            {isPending ? "Saving…" : isEditing ? "Save Changes" : "Create Item"}
          </button>
        </div>
      </form>
    </div>
  );
}
