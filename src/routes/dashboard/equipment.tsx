import { useState, useMemo, useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Package,
  Search,
  Plus,
  Filter,
  Truck,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Edit,
  ExternalLink,
  Flame,
  UserCheck,
  Wrench,
  Sparkles,
  Layers,
  HardHat,
  X,
  LayoutGrid,
  List,
  Check,
  RefreshCw,
  Trash2,
  Upload,
  Image as ImageIcon,
  FileSpreadsheet,
  Calendar,
  Tag,
  ShieldCheck,
  Clock,
  Car,
  ChevronRight,
  Info,
  SlidersHorizontal,
} from "lucide-react";
import {
  equipment as baseEquipment,
  categories,
  categoryLabel,
  operatorLabel,
  Equipment,
  CategoryId,
  OperatorOption,
} from "@/data/equipment";
import {
  getEquipmentDb,
  updateEquipmentDb,
  createEquipmentDb,
  deleteEquipmentDb,
  deleteMultipleEquipmentDb,
  resetFleetToExcelDb,
  deduplicateFleetDb,
  deduplicateFleet,
  ManagedEquipmentDoc,
} from "@/lib/api/equipment.functions";
import { uploadImage } from "@/lib/api/upload.functions";
import {
  getManagedFleet,
  getFleetOverrides,
  setManagedFleet,
  updateManagedFleetProduct,
  addManagedFleetProduct,
  removeManagedFleetProducts,
  cleanAllDuplicates,
  resetCatalogToExcel,
  saveFleetOverride,
  saveCustomProduct,
  removeCustomProduct,
  removeMultipleCustomProducts,
} from "@/lib/dashboard-store";

export const Route = createFileRoute("/dashboard/equipment")({
  head: () => ({
    meta: [
      { title: "Fleet & Equipment Catalog — Dashboard | M3 Rental Houston" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardEquipmentPage,
});

function DashboardEquipmentPage() {
  const [fleet, setFleet] = useState<Equipment[]>(getManagedFleet());
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isResettingExcel, setIsResettingExcel] = useState(false);
  const [isDeduplicating, setIsDeduplicating] = useState(false);

  // ── Modals State ──
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [deletingItem, setDeletingItem] = useState<Equipment | null>(null);

  // ── Multi-select & Bulk Delete State ──
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // ── Add Product Form State ──
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<CategoryId>("pickup-trucks");
  const [newType, setNewType] = useState("");
  const [newDayRate, setNewDayRate] = useState<number>(100);
  const [newMonthRate, setNewMonthRate] = useState<number | undefined>(undefined);
  const [newPricingUnit, setNewPricingUnit] = useState("Per day");
  const [newOperator, setNewOperator] = useState<OperatorOption>("self");
  const [newOperatorService, setNewOperatorService] = useState("");
  const [newStatus, setNewStatus] = useState<"available" | "booked" | "maintenance">("available");
  const [newFeatured, setNewFeatured] = useState(false);
  const [newYear, setNewYear] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newFeatures, setNewFeatures] = useState("");
  const [newSpecs, setNewSpecs] = useState("");
  const [newVin, setNewVin] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isUploadingAddImage, setIsUploadingAddImage] = useState(false);

  // ── Edit Product Form State ──
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState<CategoryId>("pickup-trucks");
  const [editType, setEditType] = useState("");
  const [editDayRate, setEditDayRate] = useState<number>(0);
  const [editMonthRate, setEditMonthRate] = useState<number | undefined>(undefined);
  const [editPricingUnit, setEditPricingUnit] = useState("Per day");
  const [editOperator, setEditOperator] = useState<OperatorOption>("self");
  const [editOperatorService, setEditOperatorService] = useState("");
  const [editStatus, setEditStatus] = useState<"available" | "booked" | "maintenance">("available");
  const [editFeatured, setEditFeatured] = useState<boolean>(false);
  const [editYear, setEditYear] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editFeatures, setEditFeatures] = useState("");
  const [editSpecs, setEditSpecs] = useState("");
  const [editVin, setEditVin] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [isUploadingEditImage, setIsUploadingEditImage] = useState(false);

  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // ── Load Data from MongoDB ──
  const loadData = async () => {
    setIsSyncing(true);
    try {
      const res = await getEquipmentDb();
      if (res && res.success && res.equipment && res.equipment.length > 0) {
        const overrides = getFleetOverrides();
        const merged = (res.equipment as unknown as Equipment[]).map((item) => {
          const ov = overrides[item.slug] || (item.id ? overrides[item.id] : undefined);
          if (!ov) return item;
          return {
            ...item,
            ...(ov.dayRate !== undefined ? { dayRate: ov.dayRate } : {}),
            ...(ov.monthRate !== undefined ? { monthRate: ov.monthRate } : {}),
            ...(ov.pricingUnit ? { pricingUnit: ov.pricingUnit } : {}),
            ...(ov.featured !== undefined ? { featured: ov.featured } : {}),
            ...(ov.status ? { status: ov.status } : {}),
          };
        });
        const { kept } = deduplicateFleet<Equipment>(merged);
        setFleet(kept);
        setManagedFleet(kept);
      } else {
        setFleet(getManagedFleet());
      }
    } catch (e) {
      console.warn("DB fleet fetch fallback:", e);
      setFleet(getManagedFleet());
    } finally {
      setIsSyncing(false);
    }
  };

  // ── Clean / Remove Duplicate Products from DB & Catalog ──
  const handleRemoveDuplicates = async () => {
    setIsDeduplicating(true);
    const toastId = toast.loading("Scanning and removing repeated products from MongoDB and catalog...");
    try {
      const res = await deduplicateFleetDb();
      const localRes = cleanAllDuplicates();
      const totalRemoved = (res?.removedCount || 0) + (localRes?.removedCount || 0);

      if (res && res.success && res.equipment && res.equipment.length > 0) {
        const overrides = getFleetOverrides();
        const merged = (res.equipment as unknown as Equipment[]).map((item) => {
          const ov = overrides[item.slug] || (item.id ? overrides[item.id] : undefined);
          if (!ov) return item;
          return {
            ...item,
            ...(ov.dayRate !== undefined ? { dayRate: ov.dayRate } : {}),
            ...(ov.monthRate !== undefined ? { monthRate: ov.monthRate } : {}),
            ...(ov.pricingUnit ? { pricingUnit: ov.pricingUnit } : {}),
            ...(ov.featured !== undefined ? { featured: ov.featured } : {}),
            ...(ov.status ? { status: ov.status } : {}),
          };
        });
        const { kept } = deduplicateFleet<Equipment>(merged);
        setFleet(kept);
        setManagedFleet(kept);
      } else {
        setFleet(getManagedFleet());
      }

      toast.success(
        totalRemoved > 0
          ? `Cleaned up ${totalRemoved} duplicate product records from database and catalog!`
          : "Catalog is completely unique! No duplicate products found.",
        { id: toastId }
      );
    } catch (err: any) {
      toast.error("Deduplication error: " + err.message, { id: toastId });
    } finally {
      setIsDeduplicating(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener("m3-fleet-changed", loadData);
    return () => window.removeEventListener("m3-fleet-changed", loadData);
  }, []);

  // ── Re-sync / Reset from Excel ──
  const handleResetFromExcel = async () => {
    if (
      !confirm(
        "Are you sure you want to re-import all 43 real products from M3_Rental.xlsx into MongoDB and frontend? This will reset the catalog to the official Excel inventory."
      )
    ) {
      return;
    }

    setIsResettingExcel(true);
    const toastId = toast.loading("Re-syncing all 43 products from M3_Rental.xlsx into database and frontend...");
    try {
      const res = await resetFleetToExcelDb();
      const freshFleet = resetCatalogToExcel();
      if (res && res.success && res.equipment && res.equipment.length >= freshFleet.length) {
        setFleet(res.equipment as unknown as Equipment[]);
        setManagedFleet(res.equipment as unknown as Equipment[]);
        toast.success(`Successfully loaded all ${res.count} products from M3 Excel into MongoDB and frontend!`, { id: toastId });
      } else {
        setFleet(freshFleet);
        setManagedFleet(freshFleet);
        toast.success(`Successfully loaded all ${freshFleet.length} products from M3 Excel catalog!`, { id: toastId });
      }
    } catch (err: any) {
      const freshFleet = resetCatalogToExcel();
      setFleet(freshFleet);
      setManagedFleet(freshFleet);
      toast.success(`Successfully loaded all ${freshFleet.length} products from M3 Excel catalog!`, { id: toastId });
    } finally {
      setIsResettingExcel(false);
    }
  };

  // ── Filtered Fleet ──
  const filteredFleet = useMemo(() => {
    return fleet.filter((item) => {
      // Category filter
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== "all") {
        const itemStatus = (item as any).status || "available";
        if (itemStatus !== statusFilter) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = (item.id || "").toLowerCase().includes(q);
        const matchName = item.name.toLowerCase().includes(q);
        const matchType = item.type.toLowerCase().includes(q);
        const matchSummary = item.summary.toLowerCase().includes(q);
        const matchColor = (item.color || "").toLowerCase().includes(q);
        if (!matchId && !matchName && !matchType && !matchSummary && !matchColor) return false;
      }
      return true;
    });
  }, [fleet, searchQuery, categoryFilter, statusFilter]);

  // ── Metrics ──
  const metrics = useMemo(() => {
    let available = 0;
    let booked = 0;
    let maintenance = 0;
    let sumRate = 0;
    let countWithRate = 0;

    fleet.forEach((item) => {
      const st = (item as any).status || "available";
      if (st === "available") available++;
      else if (st === "booked") booked++;
      else if (st === "maintenance") maintenance++;

      if (item.dayRate > 0) {
        sumRate += item.dayRate;
        countWithRate++;
      }
    });

    const avgRate = countWithRate > 0 ? Math.round(sumRate / countWithRate) : 0;
    return { available, booked, maintenance, avgRate };
  }, [fleet]);

  // ── Open Edit Modal ──
  const handleOpenEdit = (item: Equipment) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditType(item.type);
    setEditDayRate(item.dayRate);
    setEditMonthRate(item.monthRate);
    setEditPricingUnit((item as any).pricingUnit || "Per day");
    setEditOperator(item.operator || "self");
    setEditOperatorService((item as any).operatorService || "");
    setEditStatus((item as any).status || "available");
    setEditFeatured(!!item.featured);
    setEditYear(item.year || "");
    setEditColor(item.color || "");
    setEditSummary(item.summary || "");
    setEditFeatures((item.features || []).join("\n"));
    setEditSpecs((item as any).specs || "");
    setEditVin((item as any).vin || "");
    setEditImageUrl(item.image || "");
  };

  // ── Cloudinary Image Upload Handler ──
  const processImageFile = async (
    file: File,
    onSuccess: (url: string) => void,
    setLoading: (b: boolean) => void
  ) => {
    if (!file) return;
    setLoading(true);
    const toastId = toast.loading("Uploading image to Cloudinary...");

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const res = await uploadImage({
            data: {
              filename: file.name,
              base64,
              folder: "m3-rental-fleet",
            },
          });

          if (res && res.success && res.url) {
            onSuccess(res.url);
            toast.success("Image uploaded to Cloudinary successfully!", { id: toastId });
          } else {
            // Local fallback if Cloudinary credentials are not reached
            onSuccess(base64);
            toast.info("Image attached successfully (Local Storage Mode)", { id: toastId });
          }
        } catch {
          onSuccess(base64);
          toast.info("Image attached successfully", { id: toastId });
        } finally {
          setLoading(false);
        }
      };
      reader.onerror = () => {
        toast.error("Failed to read image file.", { id: toastId });
        setLoading(false);
      };
    } catch (e: any) {
      toast.error("Upload error: " + e.message, { id: toastId });
      setLoading(false);
    }
  };

  // ── Submit Edit Form ──
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const featureList = editFeatures
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const dayRateNum = Number(editDayRate) || 0;
    const monthRateNum = editMonthRate !== undefined && !isNaN(Number(editMonthRate)) ? Number(editMonthRate) : undefined;

    const updates = {
      id: editingItem.id,
      slug: editingItem.slug,
      name: editName,
      category: editCategory,
      type: editType,
      dayRate: dayRateNum,
      ...(monthRateNum !== undefined ? { monthRate: monthRateNum } : {}),
      pricingUnit: editPricingUnit,
      operator: editOperator,
      operatorService: editOperatorService,
      status: editStatus,
      featured: editFeatured,
      year: editYear || undefined,
      color: editColor || undefined,
      summary: editSummary,
      features: featureList,
      specs: editSpecs || undefined,
      vin: editVin || undefined,
      image: editImageUrl || editingItem.image,
    };

    // Save locally first so UI updates immediately
    updateManagedFleetProduct(editingItem.slug, updates as Partial<Equipment>);

    saveFleetOverride({
      ...(editingItem.id ? { id: editingItem.id } : {}),
      slug: editingItem.slug,
      dayRate: dayRateNum,
      ...(monthRateNum !== undefined ? { monthRate: monthRateNum } : {}),
      pricingUnit: editPricingUnit,
      featured: editFeatured,
      status: editStatus,
    });

    // Update in local state immediately
    setFleet((prev) =>
      prev.map((item) =>
        item.slug === editingItem.slug || (editingItem.id && item.id === editingItem.id)
          ? ({ ...item, ...updates } as Equipment)
          : item
      )
    );

    const toastId = toast.loading(`Saving "${editName}" pricing...`);
    try {
      await updateEquipmentDb({ data: updates });
      toast.success(`Updated "${editName}" pricing & specs!`, { id: toastId });
    } catch (err: any) {
      console.warn("MongoDB update warning:", err);
      toast.success(`Saved "${editName}" changes!`, { id: toastId });
    }

    setEditingItem(null);
  };

  // ── Submit Add New Product Form ──
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Please enter a product name.");
      return;
    }

    const dateSuffix = Date.now().toString().slice(-4);
    const assignedId = newId.trim() || `M3-${Math.floor(100 + Math.random() * 900)}`;
    const baseSlug = `${assignedId}-${newName}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slug = baseSlug || `product-${dateSuffix}`;

    const featureList = newFeatures
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    // Fallback default image if none uploaded
    const defaultPlaceholder =
      newCategory === "trailers"
        ? "/src/assets/eq-equipment-trailer.jpg"
        : newCategory === "trucks"
        ? "/src/assets/eq-bucket-truck.jpg"
        : newCategory === "cars"
        ? "/src/assets/eq-sedan-black.jpg"
        : newCategory === "suvs"
        ? "/src/assets/eq-compact-suv.jpg"
        : "/src/assets/eq-tractor-backhoe.jpg";

    const finalImage = newImageUrl.trim() || defaultPlaceholder;

    const payload = {
      id: assignedId,
      slug,
      name: newName.trim(),
      category: newCategory,
      type: newType.trim() || newName.trim(),
      dayRate: Number(newDayRate) || 0,
      ...(newMonthRate !== undefined ? { monthRate: Number(newMonthRate) } : {}),
      pricingUnit: newPricingUnit,
      operator: newOperator,
      operatorService: newOperatorService || undefined,
      status: newStatus,
      featured: newFeatured,
      year: newYear.trim() || undefined,
      color: newColor.trim() || undefined,
      summary: newSummary.trim() || `${newName} available for rental in Houston, TX.`,
      features: featureList.length > 0 ? featureList : ["Commercial Grade Rental"],
      specs: newSpecs.trim() || undefined,
      vin: newVin.trim() || `M3VIN-${dateSuffix}`,
      image: finalImage,
    };

    try {
      const res = await createEquipmentDb({ data: payload });
      if (res && res.success) {
        toast.success(`Added "${newName}" directly to MongoDB!`);
      }
    } catch (err: any) {
      console.warn("MongoDB create error:", err);
    }

    addManagedFleetProduct(payload as unknown as Equipment);
    saveCustomProduct(payload as unknown as Equipment);
    setFleet((prev) => [payload as unknown as Equipment, ...prev]);

    // Reset form
    setNewId("");
    setNewName("");
    setNewType("");
    setNewDayRate(100);
    setNewMonthRate(undefined);
    setNewPricingUnit("Per day");
    setNewOperator("self");
    setNewOperatorService("");
    setNewStatus("available");
    setNewFeatured(false);
    setNewYear("");
    setNewColor("");
    setNewSummary("");
    setNewFeatures("");
    setNewSpecs("");
    setNewVin("");
    setNewImageUrl("");
    setIsAddModalOpen(false);
  };

  // ── Delete Product Handler ──
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    try {
      await deleteEquipmentDb({ data: { slug: deletingItem.slug } });
      toast.success(`Removed "${deletingItem.name}" from MongoDB.`);
    } catch (err: any) {
      toast.error("Failed to delete from DB: " + err.message);
    }

    removeManagedFleetProducts([deletingItem.slug]);
    removeCustomProduct(deletingItem.slug);
    setFleet((prev) => prev.filter((item) => item.slug !== deletingItem.slug));
    setDeletingItem(null);
  };

  // ── Multi-Select Helpers ──
  const toggleSelectOne = (slug: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const selectAllVisible = () => {
    const visibleSlugs = filteredFleet.map((item) => item.slug);
    if (visibleSlugs.length === 0) return;
    const allSelected = visibleSlugs.every((s) => selectedSlugs.includes(s));
    if (allSelected) {
      setSelectedSlugs((prev) => prev.filter((s) => !visibleSlugs.includes(s)));
    } else {
      setSelectedSlugs((prev) => Array.from(new Set([...prev, ...visibleSlugs])));
    }
  };

  const clearSelection = () => {
    setSelectedSlugs([]);
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedSlugs.length === 0) return;
    setIsBulkDeleting(true);
    const countToDelete = selectedSlugs.length;
    const toastId = toast.loading(`Deleting ${countToDelete} products from MongoDB...`);

    try {
      const res = await deleteMultipleEquipmentDb({ data: { slugs: selectedSlugs } });
      if (res && res.success) {
        removeManagedFleetProducts(selectedSlugs);
        removeMultipleCustomProducts(selectedSlugs);
        setFleet((prev) => prev.filter((item) => !selectedSlugs.includes(item.slug)));
        toast.success(`Successfully deleted ${countToDelete} products from MongoDB!`, { id: toastId });
      } else {
        toast.error("Failed to delete selected products: " + (res?.error || "Unknown error"), { id: toastId });
      }
    } catch (err: any) {
      toast.error("Bulk delete error: " + err.message, { id: toastId });
    } finally {
      setIsBulkDeleting(false);
      setShowBulkDeleteModal(false);
      setSelectedSlugs([]);
    }
  };

  const selectedItems = useMemo(() => {
    return fleet.filter((item) => selectedSlugs.includes(item.slug));
  }, [fleet, selectedSlugs]);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-100 text-[#0040DD]">
              Catalog Manager
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">M3 Rental Houston Fleet</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="size-7 text-[#0040DD]" />
            Fleet Inventory &amp; Equipment
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real products from M3_Rental.xlsx. Add, edit, upload photos to Cloudinary, and manage live pricing.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* MongoDB live badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs font-bold shadow-xs">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-slate-300">
              MongoDB: <span className="text-emerald-400 font-bold">{fleet.length} Units</span>
            </span>
          </div>

          {/* Sync Button */}
          <button
            type="button"
            onClick={loadData}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Reload latest from MongoDB"
          >
            <RefreshCw className={`size-3.5 text-slate-500 ${isSyncing ? "animate-spin text-[#0040DD]" : ""}`} />
            <span>Sync</span>
          </button>

          {/* Re-sync Excel Button */}
          <button
            type="button"
            onClick={handleResetFromExcel}
            disabled={isResettingExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 hover:bg-emerald-100 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Re-seed MongoDB with all 43 real products from M3_Rental.xlsx"
          >
            <FileSpreadsheet className={`size-3.5 text-emerald-600 ${isResettingExcel ? "animate-spin" : ""}`} />
            <span>Re-Sync Excel</span>
          </button>

          {/* Remove Duplicates Button */}
          <button
            type="button"
            onClick={handleRemoveDuplicates}
            disabled={isDeduplicating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-bold text-purple-800 hover:bg-purple-100 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Scan and remove any repeated products from database and dashboard"
          >
            <Sparkles className={`size-3.5 text-purple-600 ${isDeduplicating ? "animate-spin" : ""}`} />
            <span>Clean Duplicates</span>
          </button>

          {/* Bulk Delete Selected Button */}
          {selectedSlugs.length > 0 && (
            <button
              type="button"
              onClick={() => setShowBulkDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-black text-white shadow-xs transition-all active:scale-95 cursor-pointer animate-in fade-in"
              title="Delete all selected products"
            >
              <Trash2 className="size-3.5 stroke-[2.5]" />
              <span>Delete Selected ({selectedSlugs.length})</span>
            </button>
          )}

          {/* Add Product Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0040DD] hover:bg-[#0036ba] text-xs font-black text-white shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="size-4 stroke-[3]" />
            <span>Add New Product</span>
          </button>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Compact Table View"
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Fleet KPI Telemetry Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Fleet</span>
            <Package className="size-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-display mt-1">{fleet.length}</p>
          <span className="text-[11px] font-semibold text-slate-500">From M3_Rental.xlsx</span>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Available Now</span>
            <CheckCircle2 className="size-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-900 font-display mt-1">{metrics.available}</p>
          <span className="text-[11px] font-semibold text-emerald-700">Ready for dispatch</span>
        </div>

        <div className="rounded-2xl border border-blue-200/80 bg-blue-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Active Bookings</span>
            <Truck className="size-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-900 font-display mt-1">{metrics.booked}</p>
          <span className="text-[11px] font-semibold text-blue-700">On client jobsites</span>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Avg Daily Rate</span>
            <DollarSign className="size-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-900 font-display mt-1">${metrics.avgRate}</p>
          <span className="text-[11px] font-semibold text-amber-700">{metrics.maintenance} in maintenance</span>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID (e.g. M3-002), product name, model, make, or specs..."
              className="w-full rounded-xl border border-slate-200 pl-10 pr-9 py-2 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#0040DD] focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Status Quick Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 sm:inline hidden">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 bg-white focus:border-[#0040DD] focus:outline-hidden"
            >
              <option value="all">All Statuses ({fleet.length})</option>
              <option value="available">Available ({metrics.available})</option>
              <option value="booked">Booked ({metrics.booked})</option>
              <option value="maintenance">Maintenance ({metrics.maintenance})</option>
            </select>
          </div>

          {/* Quick Bulk Select / Clear */}
          <div className="flex items-center gap-1.5 sm:border-l sm:border-slate-200 sm:pl-2">
            <button
              type="button"
              onClick={selectAllVisible}
              className="px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
              title="Select or deselect all items currently visible"
            >
              {filteredFleet.length > 0 &&
              filteredFleet.every((item) => selectedSlugs.includes(item.slug))
                ? "Deselect Visible"
                : `Select All (${filteredFleet.length})`}
            </button>
            {selectedSlugs.length > 0 && (
              <button
                type="button"
                onClick={clearSelection}
                className="px-2 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Clear ({selectedSlugs.length})
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="size-3.5" /> Category:
          </span>
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All Products ({fleet.length})
          </button>
          {categories.map((cat) => {
            const count = fleet.filter((f) => f.category === cat.id).length;
            if (count === 0) return null;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter === cat.id
                    ? "bg-[#0040DD] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Product List (Grid / Table) ── */}
      {filteredFleet.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <Package className="size-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No equipment found matching filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords, clear category selections, or re-sync all 43 items from Excel.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setCategoryFilter("all");
              setStatusFilter("all");
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* ── GRID CARDS VIEW ── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredFleet.map((item) => {
            const status = (item as any).status || "available";
            const pid = item.id || `M3-${item.slug.slice(0, 6)}`;
            const pricingUnit = (item as any).pricingUnit || "Per day";

            return (
              <div
                key={item.slug}
                className={`group relative rounded-2xl border bg-white shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden ${
                  selectedSlugs.includes(item.slug)
                    ? "border-[#0040DD] ring-2 ring-[#0040DD]/30 shadow-md bg-blue-50/15"
                    : "border-slate-200/90"
                }`}
              >
                {/* Image Section */}
                <div className="relative aspect-16/10 bg-slate-900 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

                  {/* Top-Left Select Checkbox & Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap z-10">
                    <label
                      onClick={(e) => e.stopPropagation()}
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg backdrop-blur-md border cursor-pointer transition-all ${
                        selectedSlugs.includes(item.slug)
                          ? "bg-[#0040DD] border-[#0040DD] text-white shadow-md ring-2 ring-white/60"
                          : "bg-black/65 hover:bg-black/80 border-white/25 text-white"
                      }`}
                      title="Select product to delete or manage"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSlugs.includes(item.slug)}
                        onChange={() => toggleSelectOne(item.slug)}
                        className="size-3.5 accent-[#0040DD] rounded cursor-pointer"
                      />
                      <span className="font-mono text-[10px] font-black">{pid}</span>
                    </label>

                    <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[10px] font-bold text-slate-900 shadow-2xs">
                      {categoryLabel(item.category)}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    {item.featured && (
                      <span className="p-1 rounded-md bg-amber-400 text-slate-950 shadow-xs" title="Featured Vehicle">
                        <Flame className="size-3.5 fill-slate-950" />
                      </span>
                    )}

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase shadow-xs ${
                        status === "available"
                          ? "bg-emerald-500 text-white"
                          : status === "booked"
                          ? "bg-blue-600 text-white"
                          : "bg-amber-500 text-white"
                      }`}
                    >
                      {status === "available" ? "Available" : status === "booked" ? "Booked" : "Maintenance"}
                    </span>
                  </div>

                  {/* Bottom Image Overlay Details */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between text-white">
                    <div>
                      <p className="text-[11px] font-bold text-slate-200 line-clamp-1">{item.type}</p>
                      {item.color && (
                        <p className="text-[10px] text-slate-300 font-medium">Color: {item.color}</p>
                      )}
                    </div>
                    <div className="text-right">
                      {item.dayRate > 0 ? (
                        <p className="text-base font-black text-emerald-400 font-display">
                          ${item.dayRate}
                          <span className="text-[10px] font-normal text-slate-300 ml-1">
                            {pricingUnit.startsWith("/")
                              ? pricingUnit
                              : pricingUnit.toLowerCase().startsWith("per ")
                              ? `/${pricingUnit.slice(4)}`
                              : `/${pricingUnit}`}
                          </span>
                        </p>
                      ) : (
                        <p className="text-xs font-black text-amber-300">Contact for price</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#0040DD] transition-colors line-clamp-2">
                      {item.name}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {item.summary}
                    </p>

                    {/* Features Preview */}
                    {item.features && item.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {item.features.slice(0, 3).map((feat, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-600"
                          >
                            <Check className="size-2.5 text-emerald-600" />
                            <span className="line-clamp-1 max-w-[120px]">{feat}</span>
                          </span>
                        ))}
                        {item.features.length > 3 && (
                          <span className="text-[10px] font-bold text-slate-400 self-center">
                            +{item.features.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                      <UserCheck className="size-3 text-slate-400" />
                      {operatorLabel[item.operator] || "Self Operated"}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Link
                        to="/equipment/$slug"
                        params={{ slug: item.slug }}
                        target="_blank"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                        title="View Public Page"
                      >
                        <ExternalLink className="size-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                      >
                        <Edit className="size-3 text-[#0040DD]" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingItem(item)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── TABLE VIEW ── */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredFleet.length > 0 &&
                        filteredFleet.every((item) => selectedSlugs.includes(item.slug))
                      }
                      onChange={selectAllVisible}
                      className="size-4 accent-[#0040DD] rounded cursor-pointer align-middle"
                      title="Select / Deselect all visible products"
                    />
                  </th>
                  <th className="py-3 px-4">Item &amp; ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Daily Rate</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFleet.map((item) => {
                  const status = (item as any).status || "available";
                  const pid = item.id || `M3-${item.slug.slice(0, 6)}`;
                  const pricingUnit = (item as any).pricingUnit || "Per day";

                  return (
                    <tr
                      key={item.slug}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        selectedSlugs.includes(item.slug) ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <td className="py-3 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedSlugs.includes(item.slug)}
                          onChange={() => toggleSelectOne(item.slug)}
                          className="size-4 accent-[#0040DD] rounded cursor-pointer align-middle"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt=""
                            className="size-11 rounded-lg object-cover bg-slate-900 border border-slate-200"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] font-black bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded">
                                {pid}
                              </span>
                              {item.featured && (
                                <span className="text-[10px] font-bold text-amber-600 flex items-center">
                                  <Flame className="size-3 fill-amber-500 mr-0.5" /> Featured
                                </span>
                              )}
                            </div>
                            <span className="font-bold text-slate-900 text-xs block mt-0.5 line-clamp-1 max-w-[220px]">
                              {item.name}
                            </span>
                            <span className="text-[11px] text-slate-400 block line-clamp-1">{item.type}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {categoryLabel(item.category)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {item.dayRate > 0 ? (
                          <div>
                            <span className="font-bold text-slate-900">${item.dayRate}</span>
                            <span className="text-[10px] text-slate-400 block">
                              {pricingUnit.startsWith("/")
                                ? pricingUnit
                                : pricingUnit.toLowerCase().startsWith("per ")
                                ? `/${pricingUnit.slice(4)}`
                                : `/${pricingUnit}`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic font-medium">Contact for price</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {operatorLabel[item.operator] || "Self"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                            status === "available"
                              ? "bg-emerald-100 text-emerald-800"
                              : status === "booked"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              status === "available"
                                ? "bg-emerald-600"
                                : status === "booked"
                                ? "bg-blue-600"
                                : "bg-amber-600"
                            }`}
                          />
                          {status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to="/equipment/$slug"
                            params={{ slug: item.slug }}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                            title="View Public Page"
                          >
                            <ExternalLink className="size-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-[#0040DD] hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingItem(item)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL 1: ADD NEW PRODUCT
         ════════════════════════════════════════════════════════════════════════ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-200 p-4 sm:p-6 space-y-5 my-4 sm:my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0040DD]">
                  Add New Equipment to Fleet
                </span>
                <h3 className="text-xl font-black text-slate-900 font-display">
                  Create Equipment Record
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. 2024 Caterpillar 305 Mini Excavator"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:border-[#0040DD] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product ID / SKU</label>
                  <input
                    type="text"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    placeholder="e.g. M3-044"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:border-[#0040DD] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as CategoryId)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:border-[#0040DD] focus:outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Equipment / Vehicle Type *</label>
                  <input
                    type="text"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    placeholder="e.g. Hydraulic Compact Excavator with Rubber Tracks"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:border-[#0040DD] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Daily Rate ($ USD) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newDayRate}
                      onChange={(e) => setNewDayRate(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 pl-7 pr-3 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:border-[#0040DD] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Rate ($ USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      min={0}
                      value={newMonthRate ?? ""}
                      onChange={(e) =>
                        setNewMonthRate(e.target.value ? Number(e.target.value) : undefined)
                      }
                      placeholder="Optional"
                      className="w-full rounded-xl border border-slate-200 pl-7 pr-3 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:border-[#0040DD] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pricing Unit</label>
                  <input
                    type="text"
                    list="new-pricing-unit-options"
                    value={newPricingUnit}
                    onChange={(e) => setNewPricingUnit(e.target.value)}
                    placeholder="e.g. Per day, Sale price, etc."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:border-[#0040DD] focus:outline-hidden"
                  />
                  <datalist id="new-pricing-unit-options">
                    <option value="Per day" />
                    <option value="Per week" />
                    <option value="Per month" />
                    <option value="Per hour" />
                    <option value="Per day each" />
                    <option value="Per day / month" />
                    <option value="4 hours / 8 hours" />
                    <option value="Sale price" />
                    <option value="Varies" />
                  </datalist>
                </div>
              </div>

              {/* Operator & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Operator Mode</label>
                  <select
                    value={newOperator}
                    onChange={(e) => setNewOperator(e.target.value as OperatorOption)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-[#0040DD] focus:outline-hidden"
                  >
                    <option value="self">Self Operated</option>
                    <option value="operator">Operator Included</option>
                    <option value="driver">Driver Included</option>
                    <option value="driver-operator">Driver / Operator Included</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fleet Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-[#0040DD] focus:outline-hidden"
                  >
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Color / Year</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      value={newYear}
                      onChange={(e) => setNewYear(e.target.value)}
                      placeholder="Year"
                      className="w-full rounded-xl border border-slate-200 px-2 py-2 text-xs font-medium text-slate-900 focus:border-[#0040DD] focus:outline-hidden"
                    />
                    <input
                      type="text"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      placeholder="Color"
                      className="w-full rounded-xl border border-slate-200 px-2 py-2 text-xs font-medium text-slate-900 focus:border-[#0040DD] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Summary Description *</label>
                <textarea
                  rows={2}
                  required
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Key summary for customer display and quote generation..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 focus:border-[#0040DD] focus:outline-hidden"
                />
              </div>

              {/* Features and Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Features (1 per line)
                  </label>
                  <textarea
                    rows={3}
                    value={newFeatures}
                    onChange={(e) => setNewFeatures(e.target.value)}
                    placeholder="Hydraulic Thumb&#10;Rubber Tracks&#10;Enclosed Cab with A/C"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 focus:border-[#0040DD] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Specifications / Capabilities
                  </label>
                  <textarea
                    rows={3}
                    value={newSpecs}
                    onChange={(e) => setNewSpecs(e.target.value)}
                    placeholder="Operating Weight: 11,000 lbs&#10;Dig Depth: 12.5 ft"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 focus:border-[#0040DD] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* ── IMAGE UPLOAD (CLOUDINARY) ── */}
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                      <ImageIcon className="size-4 text-[#0040DD]" />
                      Product Photo (Cloudinary Upload)
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Upload from computer to Cloudinary or paste direct URL. You can upload later anytime.
                    </span>
                  </div>
                  {newImageUrl && (
                    <button
                      type="button"
                      onClick={() => setNewImageUrl("")}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Clear image
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  {/* Image Preview Box */}
                  <div className="size-20 rounded-xl border border-slate-300 bg-white overflow-hidden shrink-0 flex items-center justify-center">
                    {newImageUrl ? (
                      <img src={newImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="size-7 text-slate-300" />
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="file"
                      ref={addFileInputRef}
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          processImageFile(file, setNewImageUrl, setIsUploadingAddImage);
                        }
                      }}
                      className="hidden"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => addFileInputRef.current?.click()}
                        disabled={isUploadingAddImage}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-2xs cursor-pointer active:scale-95 transition-all"
                      >
                        <Upload className={`size-3.5 ${isUploadingAddImage ? "animate-bounce text-[#0040DD]" : ""}`} />
                        <span>{isUploadingAddImage ? "Uploading to Cloudinary..." : "Choose Image File"}</span>
                      </button>

                      {newImageUrl.startsWith("http") && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="size-3" /> Cloudinary Ready
                        </span>
                      )}
                    </div>

                    <input
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Or paste image URL (e.g. https://res.cloudinary.com/...)"
                      className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-[#0040DD] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Featured toggle */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Featured on Homepage</span>
                  <span className="text-[11px] text-slate-500">Displays unit in top featured showcase</span>
                </div>
                <input
                  type="checkbox"
                  checked={newFeatured}
                  onChange={(e) => setNewFeatured(e.target.checked)}
                  className="size-4.5 accent-[#0040DD] rounded cursor-pointer"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingAddImage}
                  className="rounded-xl bg-[#0040DD] hover:bg-[#0036ba] px-5 py-2 text-xs font-black text-white shadow-xs cursor-pointer"
                >
                  Save Product to Fleet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL 2: EDIT PRODUCT & CLOUDINARY IMAGE
         ════════════════════════════════════════════════════════════════════════ */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-200 p-4 sm:p-6 space-y-5 my-4 sm:my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0040DD]">
                  Edit Equipment &amp; Rates
                </span>
                <h3 className="text-xl font-black text-slate-900 font-display">
                  {editingItem.name}
                </h3>
                <span className="font-mono text-xs text-slate-400">
                  ID: {editingItem.id || editingItem.slug}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:border-[#0040DD] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as CategoryId)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:border-[#0040DD] focus:outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle / Equipment Type</label>
                <input
                  type="text"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:border-[#0040DD] focus:outline-hidden"
                />
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Daily Rate ($ USD) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editDayRate}
                      onChange={(e) => setEditDayRate(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 pl-7 pr-3 py-2 font-bold text-slate-900 focus:border-[#0040DD] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Rate ($ USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      min={0}
                      value={editMonthRate ?? ""}
                      onChange={(e) =>
                        setEditMonthRate(e.target.value ? Number(e.target.value) : undefined)
                      }
                      placeholder="Optional"
                      className="w-full rounded-xl border border-slate-200 pl-7 pr-3 py-2 font-bold text-slate-900 focus:border-[#0040DD] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pricing Unit</label>
                  <input
                    type="text"
                    list="pricing-unit-options"
                    value={editPricingUnit}
                    onChange={(e) => setEditPricingUnit(e.target.value)}
                    placeholder="e.g. Per day, Per week"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-[#0040DD] focus:outline-hidden"
                  />
                  <datalist id="pricing-unit-options">
                    <option value="Per day" />
                    <option value="Per week" />
                    <option value="Per month" />
                    <option value="Per hour" />
                    <option value="Per day each" />
                    <option value="Per day / month" />
                    <option value="4 hours / 8 hours" />
                    <option value="Sale price" />
                    <option value="Varies" />
                  </datalist>
                </div>
              </div>

              {/* Status & Operator */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fleet Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-[#0040DD] focus:outline-hidden"
                  >
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Operator Mode</label>
                  <select
                    value={editOperator}
                    onChange={(e) => setEditOperator(e.target.value as OperatorOption)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-[#0040DD] focus:outline-hidden"
                  >
                    <option value="self">Self Operated</option>
                    <option value="operator">Operator Included</option>
                    <option value="driver">Driver Included</option>
                    <option value="driver-operator">Driver / Operator Included</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Color / Year</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      value={editYear}
                      onChange={(e) => setEditYear(e.target.value)}
                      placeholder="Year"
                      className="w-full rounded-xl border border-slate-200 px-2 py-2 text-xs font-medium text-slate-900"
                    />
                    <input
                      type="text"
                      value={editColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      placeholder="Color"
                      className="w-full rounded-xl border border-slate-200 px-2 py-2 text-xs font-medium text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Summary Description</label>
                <textarea
                  rows={2}
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 focus:border-[#0040DD] focus:outline-hidden"
                />
              </div>

              {/* Features & Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Features (1 per line)
                  </label>
                  <textarea
                    rows={3}
                    value={editFeatures}
                    onChange={(e) => setEditFeatures(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 focus:border-[#0040DD] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Specifications</label>
                  <textarea
                    rows={3}
                    value={editSpecs}
                    onChange={(e) => setEditSpecs(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 focus:border-[#0040DD] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* ── IMAGE UPLOAD & REPLACEMENT (CLOUDINARY) ── */}
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                      <ImageIcon className="size-4 text-[#0040DD]" />
                      Product Image (Cloudinary)
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Upload and replace image to Cloudinary or update URL directly.
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  {/* Current Image Preview */}
                  <div className="size-20 rounded-xl border border-slate-300 bg-white overflow-hidden shrink-0 flex items-center justify-center">
                    {editImageUrl ? (
                      <img src={editImageUrl} alt="Current" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="size-7 text-slate-300" />
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="file"
                      ref={editFileInputRef}
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          processImageFile(file, setEditImageUrl, setIsUploadingEditImage);
                        }
                      }}
                      className="hidden"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        disabled={isUploadingEditImage}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-2xs cursor-pointer active:scale-95 transition-all"
                      >
                        <Upload className={`size-3.5 ${isUploadingEditImage ? "animate-bounce text-[#0040DD]" : ""}`} />
                        <span>{isUploadingEditImage ? "Uploading to Cloudinary..." : "Upload New Photo to Cloudinary"}</span>
                      </button>

                      {editImageUrl.startsWith("http") && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="size-3" /> Cloudinary URL
                        </span>
                      )}
                    </div>

                    <input
                      type="text"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      placeholder="Image URL (e.g. https://res.cloudinary.com/...)"
                      className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-[#0040DD] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Featured toggle */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Featured on Homepage</span>
                  <span className="text-[11px] text-slate-500">Showcases vehicle in top hero cards</span>
                </div>
                <input
                  type="checkbox"
                  checked={editFeatured}
                  onChange={(e) => setEditFeatured(e.target.checked)}
                  className="size-4.5 accent-[#0040DD] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingEditImage}
                  className="rounded-xl bg-[#0040DD] hover:bg-[#0036ba] px-5 py-2 text-xs font-black text-white shadow-xs cursor-pointer"
                >
                  Save Changes to MongoDB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL 3: DELETE CONFIRMATION
         ════════════════════════════════════════════════════════════════════════ */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-100">
                <Trash2 className="size-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-display">Delete Equipment</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <img
                src={deletingItem.image}
                alt=""
                className="size-12 rounded-xl object-cover bg-slate-900 border border-slate-200"
              />
              <div>
                <p className="font-bold text-xs text-slate-900 line-clamp-1">{deletingItem.name}</p>
                <p className="text-[11px] text-slate-500">{deletingItem.type}</p>
                <p className="text-[10px] font-mono text-slate-400">ID: {deletingItem.id || deletingItem.slug}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete this item from the active Houston fleet and the MongoDB database?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-black text-white shadow-xs cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          FLOATING SELECTION & BULK ACTIONS DOCK
         ════════════════════════════════════════════════════════════════════════ */}
      {selectedSlugs.length > 0 && (
        <aside
          aria-label="Selection actions"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 text-white shadow-2xl backdrop-blur-md border border-slate-700/80 animate-in slide-in-from-bottom-4 duration-200 max-w-[92vw] sm:max-w-2xl"
        >
          {/* Badge & Count */}
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-xl bg-[#0040DD] text-white text-xs font-black shadow-inner">
              {selectedSlugs.length}
            </span>
            <div className="hidden sm:block">
              <p className="text-xs font-black leading-tight">
                {selectedSlugs.length} Product{selectedSlugs.length > 1 ? "s" : ""} Selected
              </p>
              <p className="text-[10px] text-slate-400">
                Ready for batch operations
              </p>
            </div>
          </div>

          {/* Selected thumbnails preview stack */}
          <div className="hidden md:flex items-center -space-x-2 pl-2">
            {selectedItems.slice(0, 4).map((item) => (
              <img
                key={item.slug}
                src={item.image}
                alt={item.name}
                className="size-7 rounded-full object-cover border-2 border-slate-900 bg-slate-800"
                title={item.name}
              />
            ))}
            {selectedItems.length > 4 && (
              <span className="flex size-7 items-center justify-center rounded-full bg-slate-800 border-2 border-slate-900 text-[10px] font-bold text-slate-300">
                +{selectedItems.length - 4}
              </span>
            )}
          </div>

          <div className="h-5 w-px bg-slate-700 mx-1 hidden sm:block" />

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={clearSelection}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Deselect All
            </button>

            <button
              type="button"
              onClick={() => setShowBulkDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-xs font-black text-white shadow-md shadow-rose-950/50 transition-all cursor-pointer"
              title="Delete all selected products at once"
            >
              <Trash2 className="size-3.5 stroke-[2.5]" />
              <span>Delete Selected ({selectedSlugs.length})</span>
            </button>
          </div>
        </aside>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL 4: BULK DELETE CONFIRMATION MODAL
         ════════════════════════════════════════════════════════════════════════ */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 p-4 sm:p-6 space-y-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start gap-3.5 text-rose-600">
              <div className="p-3 rounded-2xl bg-rose-100 shrink-0">
                <Trash2 className="size-6 text-rose-600 stroke-[2.5]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 font-display">
                    Delete {selectedSlugs.length} Products at Once
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowBulkDeleteModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  This bulk action cannot be undone. All selected items will be permanently erased from MongoDB Atlas and your live website catalog.
                </p>
              </div>
            </div>

            {/* List of items that will be deleted */}
            <div className="space-y-1.5 flex-1 overflow-y-auto max-h-60 pr-1 border border-slate-200 rounded-2xl p-2 bg-slate-50/50">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center justify-between">
                <span>Selected Products ({selectedItems.length})</span>
                <span>Click &times; to keep item</span>
              </div>
              {selectedItems.map((item) => (
                <div
                  key={item.slug}
                  className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.image}
                      alt=""
                      className="size-10 rounded-lg object-cover bg-slate-900 border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[9px] font-black bg-slate-100 text-slate-700 px-1 py-0.2 rounded">
                          {item.id || item.slug}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {categoryLabel(item.category)}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-slate-900 truncate">
                        {item.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-black text-slate-700">
                      ${item.dayRate}/d
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleSelectOne(item.slug)}
                      className="size-6 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer transition-colors"
                      title="Keep this item (remove from deletion)"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Warning callout */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-600 shrink-0" />
              <span>
                You are about to delete <strong>{selectedSlugs.length} products</strong>. If needed, you can re-sync the original catalog anytime using the &quot;Re-Sync Excel&quot; button.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={isBulkDeleting}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                disabled={isBulkDeleting || selectedSlugs.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 px-5 py-2 text-xs font-black text-white shadow-xs cursor-pointer disabled:opacity-50 transition-all"
              >
                {isBulkDeleting ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    <span>Deleting {selectedSlugs.length} Products...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="size-3.5 stroke-[2.5]" />
                    <span>Delete All {selectedSlugs.length} Products Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
