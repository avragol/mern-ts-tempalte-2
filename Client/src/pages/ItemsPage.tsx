import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, BookOpen } from "lucide-react";
import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { Icon } from "@/components/Atoms/Icon";
import { LoadingSpinner } from "@/components/Atoms/LoadingSpinner";
import SearchBar from "@/components/Molecules/SearchBar";
import ItemFilters from "@/components/Molecules/ItemFilters";
import ItemCard from "@/components/Molecules/ItemCard";
import { getItems, getTags } from "@/services/items";
import type { ItemFilters as IItemFilters, ItemType } from "@/types/itemsTypes";

export default function ItemsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type") as ItemType | null;

  const [filters, setFilters] = useState<IItemFilters>({
    type: initialType ?? undefined,
    tags: [],
    search: "",
    page: 1,
    limit: 20,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["items", filters],
    queryFn: () => getItems(filters),
  });

  const { data: tags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
  });

  const total = data?.total ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Icon icon={BookOpen} size="lg" className="text-primary" />
            <Heading level={1}>{t("items.page.title")}</Heading>
          </div>
          <button
            onClick={() => navigate("/items/new")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            {t("nav.newItem")}
          </button>
        </div>
        <Text variant="lead" color="muted">
          {t("items.page.count", { count: total })}
        </Text>
      </div>

      <div className="mb-4">
        <SearchBar
          value={filters.search ?? ""}
          onChange={(search) => setFilters((f) => ({ ...f, search, page: 1 }))}
          placeholder={t("items.page.searchPlaceholder")}
          className="mb-4"
        />
        <ItemFilters
          filters={filters}
          onFiltersChange={(f) => setFilters({ ...f, page: 1 })}
          availableTags={tags}
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {isError && (
        <div className="text-center py-16">
          <Text color="muted">{t("items.page.failed")}</Text>
        </div>
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <div className="text-center py-16">
          <Icon icon={BookOpen} size="xl" className="text-muted-foreground/30 mx-auto mb-4" />
          <Heading level={3} className="text-muted-foreground mb-2">{t("items.page.noItems")}</Heading>
          <Text color="muted" className="mb-4">
            {filters.search || filters.type || filters.tags?.length
              ? t("items.page.noItemsFilter")
              : t("items.page.noItemsCreate")}
          </Text>
          <button
            onClick={() => navigate("/items/new")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            {t("items.page.createItem")}
          </button>
        </div>
      )}

      {!isLoading && !isError && (data?.data.length ?? 0) > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data!.data.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>

          {data!.total > (filters.limit ?? 20) && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                disabled={(filters.page ?? 1) <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
                className="px-4 py-2 border border-border rounded-lg disabled:opacity-40 hover:bg-muted text-sm"
              >
                {t("items.page.previous")}
              </button>
              <span className="px-4 py-2 text-sm text-muted-foreground">
                {t("items.page.page", {
                  page: filters.page ?? 1,
                  total: Math.ceil(data!.total / (filters.limit ?? 20)),
                })}
              </span>
              <button
                disabled={(filters.page ?? 1) >= Math.ceil(data!.total / (filters.limit ?? 20))}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                className="px-4 py-2 border border-border rounded-lg disabled:opacity-40 hover:bg-muted text-sm"
              >
                {t("items.page.next")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
