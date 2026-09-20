import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Layers,
  Heart,
  Tag,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { useAuth } from "@/context/AuthContext";
import { ROLE_CODE } from "@/constants/roleCodes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeleteModal, AccessRestricted, LoadingSpinner } from "@/components/common";
import {
  useGetMarketplaceCategoriesQuery,
  useGetMarketplaceItemsQuery,
  useGetMyMarketplaceItemsQuery,
  useGetSavedMarketplaceItemsQuery,
  useDeleteMarketplaceItemMutation,
  useRecordMarketplaceViewMutation,
  useToggleMarketplaceFavoriteMutation,
} from "../api/marketplaceApi";
import {
  MarketplaceCard,
  MarketplaceFormModal,
  MarketplaceDetailModal,
  MarketplaceChatModal,
} from "../components";
import type { MarketplaceItem, MarketplaceFilters } from "../types";

const CONDITION_FILTER_OPTIONS = [
  { value: "", label: "All Conditions" },
  { value: "New", label: "Brand New" },
  { value: "Like New", label: "Like New" },
  { value: "Excellent", label: "Excellent" },
  { value: "Good", label: "Good" },
  { value: "Fair", label: "Fair" },
];

const SORT_OPTIONS = [
  { value: "Newest", label: "Newest First" },
  { value: "Oldest", label: "Oldest First" },
];

export const MarketplacePage: React.FC = () => {
  const { account } = useAuth();
  const { canView, canCreate, canUpdate, canDelete, isLoading: isPermLoading } =
    usePermission("marketplace");
  const canManageAll = account?.role_code === ROLE_CODE.ADMIN || account?.role_code === ROLE_CODE.SUPER_ADMIN;

  usePageHeader({
    title: "Community Marketplace",
    description: "Buy, sell, or rent goods and services within your verified resident community.",
  });

  const [activeTab, setActiveTab] = useState<"discover" | "my_listings" | "saved">("discover");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isNegotiableFilter, setIsNegotiableFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"Newest" | "Oldest">("Newest");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<MarketplaceItem | null>(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState<MarketplaceItem | null>(null);
  const [chatItem, setChatItem] = useState<MarketplaceItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MarketplaceItem | null>(null);

  const { data: categories = [] } = useGetMarketplaceCategoriesQuery();

  const queryFilters: MarketplaceFilters = useMemo(
    () => ({
      category_id: selectedCategory || undefined,
      condition: selectedCondition || undefined,
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
      is_negotiable: isNegotiableFilter !== "" ? isNegotiableFilter : undefined,
      sort: sortOrder,
    }),
    [selectedCategory, selectedCondition, minPrice, maxPrice, isNegotiableFilter, sortOrder]
  );

  const {
    data: discoverItems = [],
    isLoading: isLoadingDiscover,
    refetch: refetchDiscover,
  } = useGetMarketplaceItemsQuery(queryFilters, {
    skip: activeTab !== "discover" || !canView,
  });

  const {
    data: myItems = [],
    isLoading: isLoadingMy,
    refetch: refetchMy,
  } = useGetMyMarketplaceItemsQuery(undefined, {
    skip: activeTab !== "my_listings" || !canView,
  });

  const {
    data: savedItems = [],
    isLoading: isLoadingSaved,
    refetch: refetchSaved,
  } = useGetSavedMarketplaceItemsQuery(undefined, {
    skip: activeTab !== "saved" || !canView,
  });

  const [deleteItem, { isLoading: isDeleting }] = useDeleteMarketplaceItemMutation();
  const [recordView] = useRecordMarketplaceViewMutation();
  const [toggleFavorite] = useToggleMarketplaceFavoriteMutation();

  const rawItems = useMemo(() => {
    if (activeTab === "my_listings") return myItems;
    if (activeTab === "saved") return savedItems;
    return discoverItems;
  }, [activeTab, discoverItems, myItems, savedItems]);

  const displayedItems = useMemo(() => {
    if (!searchQuery.trim()) return rawItems;
    const q = searchQuery.toLowerCase().trim();
    return rawItems.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.category_name?.toLowerCase().includes(q) ||
        item.brand?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q)
    );
  }, [rawItems, searchQuery]);

  const isLoading =
    (activeTab === "discover" && isLoadingDiscover) ||
    (activeTab === "my_listings" && isLoadingMy) ||
    (activeTab === "saved" && isLoadingSaved);

  const handleOpenItem = (item: MarketplaceItem) => {
    setSelectedDetailItem(item);
    recordView(item.id).catch(() => { });
  };

  const handleOpenAdd = () => {
    setItemToEdit(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (item: MarketplaceItem) => {
    setItemToEdit(item);
    setFormModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteItem(itemToDelete.id).unwrap();
      toast.success("Listing deleted successfully");
      setItemToDelete(null);
      if (activeTab === "my_listings") refetchMy();
      else if (activeTab === "saved") refetchSaved();
      else refetchDiscover();
    } catch (err: any) {
      toast.error(err?.data?.detail || err?.message || "Failed to delete listing");
    }
  };

  const handleSaveToggle = async (itemId: string, isSaved: boolean) => {
    try {
      await toggleFavorite(itemId).unwrap();
      toast.success(isSaved ? "Saved to favorites" : "Removed from favorites");
    } catch (err: any) {
      toast.error("Failed to update favorite");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedCondition("");
    setMinPrice("");
    setMaxPrice("");
    setIsNegotiableFilter("");
    setSortOrder("Newest");
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(selectedCategory) ||
    Boolean(selectedCondition) ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    Boolean(isNegotiableFilter) ||
    sortOrder !== "Newest";

  if (!isPermLoading && !canView) {
    return <AccessRestricted moduleName="Marketplace" showAction />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as any)}
            className="w-full sm:w-auto"
          >
            <TabsList className="bg-slate-100 p-1 rounded-xl">
              <TabsTrigger
                value="discover"
                className="rounded-lg text-xs font-semibold px-4 py-2 gap-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs"
              >
                <ShoppingBag size={14} />
                <span>Discover</span>
              </TabsTrigger>
              <TabsTrigger
                value="my_listings"
                className="rounded-lg text-xs font-semibold px-4 py-2 gap-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs"
              >
                <Tag size={14} />
                <span>My Listings</span>
              </TabsTrigger>
              <TabsTrigger
                value="saved"
                className="rounded-lg text-xs font-semibold px-4 py-2 gap-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs"
              >
                <Heart size={14} />
                <span>Saved Items</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {canCreate && (
          <Button
            onClick={handleOpenAdd}
            className="rounded-xl gap-2 font-semibold text-xs cursor-pointer shadow-sm self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Post an Item for Sale</span>
          </Button>
        )}
      </div>

      {activeTab === "discover" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 items-center">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items, brands"
                className="h-10 text-xs"
              />
            </div>

            <Select
              icon={<Layers size={14} />}
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              options={[
                { value: "", label: "All Categories" },
                ...categories.map((c) => ({
                  value: String(c.id),
                  label: c.name,
                })),
              ]}
              placeholder="Category"
              size="md"
            />

            <Select
              value={selectedCondition}
              onValueChange={setSelectedCondition}
              options={CONDITION_FILTER_OPTIONS}
              placeholder="Condition"
              size="md"
            />

            <Select
              icon={<ArrowUpDown size={14} />}
              value={sortOrder}
              onValueChange={(val) => setSortOrder(val as any)}
              options={SORT_OPTIONS}
              size="md"
            />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min ₹"
                className="text-xs"
              />
              <Input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max ₹"
                className="text-xs"
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 font-normal border border-rose-200 hover:border-rose-300"
              >
                <X size={13} />
                <span>Reset Filters</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <LoadingSpinner size="lg" />
          <p className="text-xs text-slate-400 font-medium">
            Loading marketplace items
          </p>
        </div>
      ) : displayedItems.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <ShoppingBag size={22} />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {activeTab === "my_listings"
              ? "No Listings Posted"
              : activeTab === "saved"
                ? "No Saved Items"
                : "No Items Found"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === "my_listings"
              ? "You haven't listed any items for sale yet. Turn unused goods into cash!"
              : activeTab === "saved"
                ? "You haven't saved any items yet. Click the heart icon on any product to bookmark it."
                : "No listings match your search or filter criteria. Try adjusting your search filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {displayedItems.map((item) => {
            const isOwner = Boolean(
              account &&
                item.user_id &&
                (item.user_id === account.id ||
                  item.user_id === account.account_id ||
                  String(item.user_id) === String(account.id) ||
                  String(item.user_id) === String(account.account_id))
            );
            const canManageItem = isOwner || canManageAll;

            return (
              <MarketplaceCard
                key={item.id}
                item={item}
                onClick={handleOpenItem}
                onSaveToggle={handleSaveToggle}
                onEdit={handleOpenEdit}
                onDelete={(i) => setItemToDelete(i)}
                canManage={canManageItem}
              />
            );
          })}
        </div>
      )}

      <MarketplaceFormModal
        isOpen={isFormModalOpen}
        onClose={() => setFormModalOpen(false)}
        itemToEdit={itemToEdit}
        onSuccess={() => {
          if (activeTab === "my_listings") refetchMy();
          else if (activeTab === "saved") refetchSaved();
          else refetchDiscover();
        }}
      />

      <MarketplaceDetailModal
        isOpen={Boolean(selectedDetailItem)}
        onClose={() => setSelectedDetailItem(null)}
        item={selectedDetailItem}
        onOpenChat={(item) => setChatItem(item)}
        onEdit={handleOpenEdit}
        onDelete={(item) => setItemToDelete(item)}
        canManage={Boolean(
          selectedDetailItem &&
            account &&
            selectedDetailItem.user_id &&
            (selectedDetailItem.user_id === account.id ||
              selectedDetailItem.user_id === account.account_id ||
              String(selectedDetailItem.user_id) === String(account.id) ||
              String(selectedDetailItem.user_id) === String(account.account_id) ||
              canManageAll)
        )}
        onSaveToggled={(id, saved) => {
          if (selectedDetailItem && selectedDetailItem.id === id) {
            setSelectedDetailItem({
              ...selectedDetailItem,
              is_saved: saved ? 1 : 0,
            });
          }
          if (activeTab === "saved") refetchSaved();
        }}
      />

      <MarketplaceChatModal
        isOpen={Boolean(chatItem)}
        onClose={() => setChatItem(null)}
        item={chatItem}
      />

      <DeleteModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onDelete={handleConfirmDelete}
        itemName={itemToDelete?.title}
        itemType="Marketplace Listing"
        description={`Are you sure you want to delete "${itemToDelete?.title}"? This listing and its chat history will be permanently removed.`}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default MarketplacePage;
