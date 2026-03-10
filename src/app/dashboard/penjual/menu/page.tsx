"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Utensils,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Upload,
  Save,
  AlertCircle,
  Search,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  Tags,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface Menu {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  status: "AVAILABLE" | "OUT_OF_STOCK";
  categoryId: string | null;
  category: Category | null;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function MenuManagementPage() {
  const router = useRouter();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formStatus, setFormStatus] = useState<"AVAILABLE" | "OUT_OF_STOCK">("AVAILABLE");
  const [formCategoryId, setFormCategoryId] = useState<string>("");

  const fetchMenus = useCallback(async () => {
    try {
      const res = await fetch("/api/penjual/menu");
      const data = await res.json();
      setMenus(data.menus || []);
    } catch {
      console.error("Failed to fetch menus");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch {
      console.error("Failed to fetch categories");
    }
  }, []);

  useEffect(() => {
    fetchMenus();
    fetchCategories();
  }, [fetchMenus, fetchCategories]);

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormPrice("");
    setFormImage("");
    setFormStatus("AVAILABLE");
    setFormCategoryId("");
    setEditingMenu(null);
    setError("");
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (menu: Menu) => {
    setEditingMenu(menu);
    setFormName(menu.name);
    setFormDescription(menu.description);
    setFormPrice(menu.price.toString());
    setFormImage(menu.image || "");
    setFormStatus(menu.status);
    setFormCategoryId(menu.categoryId || "");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formName || !formDescription || !formPrice) {
      setError("Nama, deskripsi, dan harga harus diisi");
      return;
    }

    setIsSubmitting(true);

    try {
      const body = {
        name: formName,
        description: formDescription,
        price: formPrice,
        image: formImage || null,
        status: formStatus,
        categoryId: formCategoryId || null,
      };

      const res = editingMenu
        ? await fetch(`/api/penjual/menu/${editingMenu.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/penjual/menu", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan menu");
      }

      fetchMenus();
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan menu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (menuId: string) => {
    try {
      const res = await fetch(`/api/penjual/menu/${menuId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchMenus();
      }
    } catch {
      console.error("Failed to delete menu");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const toggleStatus = async (menu: Menu) => {
    const newStatus = menu.status === "AVAILABLE" ? "OUT_OF_STOCK" : "AVAILABLE";
    try {
      await fetch(`/api/penjual/menu/${menu.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchMenus();
    } catch {
      console.error("Failed to toggle status");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter menus
  const filteredMenus = menus.filter(
    (menu) =>
      menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      menu.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableMenus = filteredMenus.filter((m) => m.status === "AVAILABLE");
  const outOfStockMenus = filteredMenus.filter((m) => m.status === "OUT_OF_STOCK");

  // Stats
  const totalMenus = menus.length;
  const totalAvailable = menus.filter((m) => m.status === "AVAILABLE").length;
  const totalOutOfStock = menus.filter((m) => m.status === "OUT_OF_STOCK").length;

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-neutral-800/50 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Kelola Menu</h1>
              <p className="text-sm text-neutral-400">Tambah, edit, atau hapus menu dagangan</p>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/25"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Tambah Menu</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Total Menu</p>
                <p className="text-2xl font-bold text-white">{totalMenus}</p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Tersedia</p>
                <p className="text-2xl font-bold text-white">{totalAvailable}</p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Habis</p>
                <p className="text-2xl font-bold text-white">{totalOutOfStock}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari menu..."
              className="w-full pl-12 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-40 bg-neutral-800" />
                <div className="p-5">
                  <div className="bg-neutral-800 h-5 rounded w-3/4 mb-2" />
                  <div className="bg-neutral-800 h-4 rounded w-1/2 mb-4" />
                  <div className="bg-neutral-800 h-6 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : menus.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-neutral-900 rounded-full flex items-center justify-center mb-6">
              <Utensils className="w-12 h-12 text-neutral-600" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Belum ada menu</h2>
            <p className="text-neutral-400 mb-6 text-center max-w-md">
              Tambahkan menu pertamamu untuk mulai berjualan
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-orange-500/25"
            >
              <Plus className="w-5 h-5" />
              Tambah Menu Pertama
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Available Menus */}
            {availableMenus.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Menu Tersedia ({availableMenus.length})
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {availableMenus.map((menu) => (
                    <div
                      key={menu.id}
                      className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all group"
                    >
                      {/* Image */}
                      <div className="relative h-40 bg-gradient-to-br from-neutral-800 to-neutral-900 overflow-hidden">
                        {menu.image ? (
                          <img src={menu.image} alt={menu.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Utensils className="w-12 h-12 text-neutral-700" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className="bg-green-500/20 text-green-400 text-xs font-medium px-2.5 py-1 rounded-full">
                            Tersedia
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-white font-semibold text-lg mb-1 truncate">{menu.name}</h3>
                        {menu.category && (
                          <span className="inline-flex items-center gap-1 text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full mb-2">
                            <Tags className="w-3 h-3" />
                            {menu.category.name}
                          </span>
                        )}
                        <p className="text-neutral-400 text-sm line-clamp-2 mb-3">{menu.description}</p>
                        <p className="text-orange-400 font-bold text-xl">{formatPrice(menu.price)}</p>
                      </div>

                      {/* Actions */}
                      <div className="px-5 pb-5 flex gap-2">
                        <button
                          onClick={() => toggleStatus(menu)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-sm text-orange-400 font-medium transition-colors"
                        >
                          <ToggleRight className="w-4 h-4" />
                          Habiskan
                        </button>
                        <button
                          onClick={() => openEditModal(menu)}
                          className="p-2.5 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl text-amber-400 transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(menu.id)}
                          className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Delete Confirmation */}
                      {deleteConfirm === menu.id && (
                        <div className="px-5 pb-5">
                          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                            <p className="text-red-400 text-sm mb-3">Hapus "{menu.name}"?</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDelete(menu.id)}
                                className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 font-medium"
                              >
                                Ya, Hapus
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-3 py-2 bg-neutral-700 text-white text-sm rounded-lg hover:bg-neutral-600"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Out of Stock Menus */}
            {outOfStockMenus.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-neutral-400 mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-400" />
                  Menu Habis ({outOfStockMenus.length})
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {outOfStockMenus.map((menu) => (
                    <div
                      key={menu.id}
                      className="bg-neutral-900/30 border border-neutral-800/50 rounded-2xl overflow-hidden opacity-60 hover:opacity-100 transition-all"
                    >
                      {/* Image */}
                      <div className="relative h-40 bg-gradient-to-br from-neutral-800 to-neutral-900 overflow-hidden grayscale">
                        {menu.image ? (
                          <img src={menu.image} alt={menu.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Utensils className="w-12 h-12 text-neutral-700" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className="bg-red-500/20 text-red-400 text-xs font-medium px-2.5 py-1 rounded-full">
                            Habis
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-neutral-300 font-semibold text-lg mb-1 truncate">{menu.name}</h3>
                        {menu.category && (
                          <span className="inline-flex items-center gap-1 text-xs text-neutral-400 bg-neutral-700/30 px-2 py-0.5 rounded-full mb-2">
                            <Tags className="w-3 h-3" />
                            {menu.category.name}
                          </span>
                        )}
                        <p className="text-neutral-500 text-sm line-clamp-2 mb-3">{menu.description}</p>
                        <p className="text-neutral-400 font-bold text-xl">{formatPrice(menu.price)}</p>
                      </div>

                      {/* Actions */}
                      <div className="px-5 pb-5 flex gap-2">
                        <button
                          onClick={() => toggleStatus(menu)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-green-500/10 hover:bg-green-500/20 rounded-xl text-sm text-green-400 font-medium transition-colors"
                        >
                          <ToggleLeft className="w-4 h-4" />
                          Sediakan
                        </button>
                        <button
                          onClick={() => openEditModal(menu)}
                          className="p-2.5 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl text-amber-400 transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(menu.id)}
                          className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Delete Confirmation */}
                      {deleteConfirm === menu.id && (
                        <div className="px-5 pb-5">
                          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                            <p className="text-red-400 text-sm mb-3">Hapus "{menu.name}"?</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDelete(menu.id)}
                                className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 font-medium"
                              >
                                Ya, Hapus
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-3 py-2 bg-neutral-700 text-white text-sm rounded-lg hover:bg-neutral-600"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-800">
              <h2 className="text-lg font-bold text-white">
                {editingMenu ? "Edit Menu" : "Tambah Menu Baru"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Foto Menu (Opsional)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-neutral-800 rounded-xl flex items-center justify-center overflow-hidden border border-neutral-700">
                    {formImage ? (
                      <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Utensils className="w-8 h-8 text-neutral-600" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm font-medium transition-colors">
                      <Upload className="w-4 h-4" />
                      Upload Foto
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                    {formImage && (
                      <button
                        type="button"
                        onClick={() => setFormImage("")}
                        className="block text-red-400 text-sm hover:text-red-300"
                      >
                        Hapus foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Nama Menu <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Nasi Goreng Spesial"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Deskripsi <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Deskripsi menu..."
                  rows={3}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 resize-none transition-colors"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Harga (Rp) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="15000"
                    min="0"
                    className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Kategori
                </label>
                <div className="relative">
                  <Tags className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Pilih Kategori (Opsional)</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                {categories.length === 0 && (
                  <p className="text-neutral-500 text-sm mt-2">
                    Belum ada kategori. Hubungi admin untuk membuat kategori.
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Status Ketersediaan
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormStatus("AVAILABLE")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
                      formStatus === "AVAILABLE"
                        ? "border-green-500 bg-green-500/10 text-green-400"
                        : "border-neutral-700 text-neutral-400 hover:border-neutral-600"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Tersedia
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus("OUT_OF_STOCK")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
                      formStatus === "OUT_OF_STOCK"
                        ? "border-red-500 bg-red-500/10 text-red-400"
                        : "border-neutral-700 text-neutral-400 hover:border-neutral-600"
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    Habis
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </form>

            {/* Modal Footer */}
            <div className="p-5 border-t border-neutral-800 flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Simpan
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
