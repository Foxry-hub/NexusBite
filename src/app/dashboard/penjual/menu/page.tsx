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
} from "lucide-react";

interface Menu {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  status: "AVAILABLE" | "OUT_OF_STOCK";
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
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formStatus, setFormStatus] = useState<"AVAILABLE" | "OUT_OF_STOCK">("AVAILABLE");

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

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormPrice("");
    setFormImage("");
    setFormStatus("AVAILABLE");
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

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-white">Kelola Menu</h1>
          </div>
          <button
            onClick={openAddModal}
            className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="px-4 py-6 pb-24 max-w-4xl mx-auto">
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-slate-800 rounded-lg" />
                  <div className="flex-1">
                    <div className="bg-slate-800 h-4 rounded w-1/3 mb-2" />
                    <div className="bg-slate-800 h-3 rounded w-2/3 mb-2" />
                    <div className="bg-slate-800 h-3 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : menus.length === 0 ? (
          <div className="text-center py-16">
            <Utensils className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400 mb-4">Belum ada menu</p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              Tambah Menu Pertama
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {menus.map((menu) => (
              <div
                key={menu.id}
                className={`bg-slate-900/50 border rounded-xl p-4 ${
                  menu.status === "OUT_OF_STOCK" ? "border-red-500/30 opacity-60" : "border-slate-800"
                }`}
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {menu.image ? (
                      <img src={menu.image} alt={menu.name} className="w-full h-full object-cover" />
                    ) : (
                      <Utensils className="w-8 h-8 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-white font-semibold truncate">{menu.name}</h3>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                          menu.status === "AVAILABLE"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {menu.status === "AVAILABLE" ? "Tersedia" : "Habis"}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-2">{menu.description}</p>
                    <p className="text-orange-400 font-bold">{formatPrice(menu.price)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => toggleStatus(menu)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      menu.status === "AVAILABLE"
                        ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-slate-500/10 text-slate-400 hover:bg-slate-500/20"
                    }`}
                  >
                    {menu.status === "AVAILABLE" ? (
                      <>
                        <ToggleRight className="w-4 h-4" /> Tersedia
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4" /> Habis
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(menu)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-sm transition-colors"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(menu.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus
                  </button>
                </div>

                {/* Delete Confirmation */}
                {deleteConfirm === menu.id && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm mb-3">
                      Yakin ingin menghapus menu "{menu.name}"?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(menu.id)}
                        className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                      >
                        Ya, Hapus
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-600"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">
                {editingMenu ? "Edit Menu" : "Tambah Menu Baru"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Foto Menu (Opsional)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden">
                    {formImage ? (
                      <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Utensils className="w-8 h-8 text-slate-600" />
                    )}
                  </div>
                  <div>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors">
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
                        className="ml-2 text-red-400 text-sm hover:text-red-300"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nama Menu *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Nasi Goreng Spesial"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Deskripsi *
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Deskripsi menu..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Harga (Rp) *
                </label>
                <input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="15000"
                  min="0"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status Ketersediaan
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormStatus("AVAILABLE")}
                    className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                      formStatus === "AVAILABLE"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                        : "border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    Tersedia
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus("OUT_OF_STOCK")}
                    className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                      formStatus === "OUT_OF_STOCK"
                        ? "border-red-500 bg-red-500/10 text-red-400"
                        : "border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    Habis
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </form>

            {/* Actions */}
            <div className="p-4 border-t border-slate-800 flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
