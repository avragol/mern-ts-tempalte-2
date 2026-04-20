import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Icon icon={BookOpen} size="lg" className="text-blue-600" />
            <Heading level={1}>Knowledge Base</Heading>
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
          {data?.total ?? 0} items in your knowledge base
        </Text>
      </div>

      <div className="mb-4">
        <SearchBar
          value={filters.search ?? ""}
          onChange={(search) => setFilters((f) => ({ ...f, search, page: 1 }))}
          placeholder="Search by title, content, or tags…"
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
          <Text color="muted">Failed to load items. Please try again.</Text>
        </div>
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <div className="text-center py-16">
          <Icon icon={BookOpen} size="xl" className="text-gray-300 mx-auto mb-4" />
          <Heading level={3} className="text-gray-400 mb-2">No items found</Heading>
          <Text color="muted" className="mb-4">
            {filters.search || filters.type || filters.tags?.length
              ? "Try adjusting your filters."
              : "Create your first item to get started."}
          </Text>
          <button
            onClick={() => navigate("/items/new")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Create Item
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
                className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-50 text-sm"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {filters.page ?? 1} of {Math.ceil(data!.total / (filters.limit ?? 20))}
              </span>
              <button
                disabled={(filters.page ?? 1) >= Math.ceil(data!.total / (filters.limit ?? 20))}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-50 text-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
