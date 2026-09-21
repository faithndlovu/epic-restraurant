import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/menu")({
  head: () => ({
    meta: [
      { title: "Admin · Menu — Epic Restaurant" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminMenu,
});

type Item = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category: string;
  tag: string | null;
  sort_order: number;
  is_available: boolean;
};

const categories = ["Starters", "Main Courses", "Desserts", "Drinks"];

// Must match the menu-images bucket limits in the admin_features migration.
const IMAGE_BUCKET = "menu-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function uploadDishImage(file: File): Promise<string> {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error("Use a JPG, PNG or WebP image.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Image must be 5 MB or smaller.");
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  // Unique name per upload, so a replaced photo never shows a stale cached copy.
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) throw new Error(error.message);
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

function emptyDraft(): Omit<Item, "id"> {
  return {
    name: "",
    description: "",
    price: 0,
    image_url: "",
    category: "Main Courses",
    tag: "",
    sort_order: 0,
    is_available: true,
  };
}

function AdminMenu() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Omit<Item, "id">>(emptyDraft());
  const [error, setError] = useState<string | null>(null);
  const { confirm, dialog } = useConfirm();

  async function load() {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("category")
      .order("sort_order");
    if (error) setError(error.message);
    else setItems((data ?? []) as Item[]);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(item: Item) {
    setEditingId(item.id);
    setDraft({
      name: item.name,
      description: item.description,
      price: item.price,
      image_url: item.image_url ?? "",
      category: item.category,
      tag: item.tag ?? "",
      sort_order: item.sort_order,
      is_available: item.is_available,
    });
  }

  function startNew() {
    setEditingId("new");
    setDraft(emptyDraft());
  }

  async function save() {
    setError(null);
    const payload = {
      ...draft,
      tag: draft.tag || null,
      image_url: draft.image_url || null,
      price: Number(draft.price),
      sort_order: Number(draft.sort_order),
    };
    const isNew = editingId === "new";
    if (isNew) {
      const { error } = await supabase.from("menu_items").insert(payload);
      if (error) return toast.error("Could not add the item", { description: error.message });
    } else if (editingId) {
      const { error } = await supabase.from("menu_items").update(payload).eq("id", editingId);
      if (error) return toast.error("Could not save the item", { description: error.message });
    }
    toast.success(isNew ? `Added "${payload.name}" to the menu.` : `Saved "${payload.name}".`);
    setEditingId(null);
    load();
  }

  async function remove(id: string) {
    if (
      !(await confirm({
        title: "Delete this menu item?",
        description:
          "It will be removed from the menu permanently. To take it off temporarily, mark it unavailable instead.",
        confirmLabel: "Delete",
        destructive: true,
      }))
    )
      return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) return toast.error("Could not delete the item", { description: error.message });
    toast.success("Menu item deleted.");
    load();
  }

  async function toggleAvailable(item: Item) {
    const nowAvailable = !item.is_available;
    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: nowAvailable })
      .eq("id", item.id);
    if (error) return toast.error("Could not update availability", { description: error.message });
    toast.success(
      nowAvailable ? `"${item.name}" is back on the menu.` : `"${item.name}" is now unavailable.`,
    );
    load();
  }

  if (!items) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      {dialog}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl">Menu Items</h2>
          <p className="text-sm text-muted-foreground">{items.length} items · click to edit</p>
        </div>
        <button
          onClick={startNew}
          className="btn-gold rounded-full px-5 py-2.5 text-sm inline-flex items-center gap-2"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 text-red-300 text-sm p-3">
          {error}
        </div>
      )}

      {editingId && (
        <DraftForm
          draft={draft}
          setDraft={setDraft}
          onCancel={() => setEditingId(null)}
          onSave={save}
          isNew={editingId === "new"}
        />
      )}

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-muted-foreground text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left p-4">Item</th>
              <th className="text-left p-4 hidden md:table-cell">Category</th>
              <th className="text-left p-4">Price</th>
              <th className="text-left p-4 hidden lg:table-cell">Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-border hover:bg-card/60">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {item.image_url && (
                      <img src={item.image_url} alt="" className="h-10 w-10 rounded object-cover" />
                    )}
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                        {item.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell">{item.category}</td>
                <td className="p-4 text-gold">${item.price.toFixed(2)}</td>
                <td className="p-4 hidden lg:table-cell">
                  <button
                    onClick={() => toggleAvailable(item)}
                    className={`text-xs px-2 py-1 rounded-full ${item.is_available ? "bg-emerald-500/15 text-emerald-300" : "bg-muted text-muted-foreground"}`}
                  >
                    {item.is_available ? "Available" : "Hidden"}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => startEdit(item)}
                    className="p-2 hover:text-gold"
                    aria-label="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => remove(item.id)}
                    className="p-2 hover:text-red-400"
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No menu items yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DraftForm({
  draft,
  setDraft,
  onCancel,
  onSave,
  isNew,
}: {
  draft: Omit<Item, "id">;
  setDraft: React.Dispatch<React.SetStateAction<Omit<Item, "id">>>;
  onCancel: () => void;
  onSave: () => void;
  isNew: boolean;
}) {
  const set = <K extends keyof Omit<Item, "id">>(k: K, v: Omit<Item, "id">[K]) =>
    setDraft({ ...draft, [k]: v });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file after an error
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const url = await uploadDishImage(file);
      // Functional update: keep anything typed into the form while uploading.
      setDraft((d) => ({ ...d, image_url: url }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }
  const input =
    "w-full bg-secondary rounded-md px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-gold border border-transparent focus:border-gold/50";
  return (
    <div className="rounded-xl border border-gold/40 bg-card p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-display text-xl">{isNew ? "New menu item" : "Edit item"}</h3>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <X size={18} />
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
            Name
          </span>
          <input
            className={input}
            value={draft.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
            Category
          </span>
          <select
            className={input}
            value={draft.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
            Description
          </span>
          <textarea
            rows={3}
            className={input + " resize-none"}
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
            Price (USD)
          </span>
          <input
            type="number"
            step="0.01"
            className={input}
            value={draft.price}
            onChange={(e) => set("price", Number(e.target.value))}
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
            Tag (optional)
          </span>
          <input
            className={input}
            value={draft.tag ?? ""}
            onChange={(e) => set("tag", e.target.value)}
            placeholder="Signature, Chef's Pick…"
          />
        </label>
        <div className="md:col-span-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
            Photo
          </span>
          <div className="flex items-start gap-4">
            <div className="h-24 w-24 shrink-0 rounded-md bg-secondary overflow-hidden grid place-items-center">
              {draft.image_url ? (
                <img src={draft.image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-muted-foreground">No photo</span>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <label
                className={`inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm cursor-pointer hover:border-gold/60 hover:text-gold ${uploading ? "opacity-60 pointer-events-none" : ""}`}
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading ? "Uploading…" : draft.image_url ? "Replace photo" : "Upload photo"}
                <input
                  type="file"
                  accept={IMAGE_TYPES.join(",")}
                  className="sr-only"
                  onChange={onPickImage}
                  disabled={uploading}
                />
              </label>
              <p className="text-xs text-muted-foreground">JPG, PNG or WebP, up to 5 MB.</p>
              {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
              <input
                className={input}
                value={draft.image_url ?? ""}
                onChange={(e) => set("image_url", e.target.value)}
                placeholder="…or paste an image URL"
              />
            </div>
          </div>
        </div>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
            Sort order
          </span>
          <input
            type="number"
            className={input}
            value={draft.sort_order}
            onChange={(e) => set("sort_order", Number(e.target.value))}
          />
        </label>
        <label className="flex items-center gap-3 mt-6">
          <input
            type="checkbox"
            checked={draft.is_available}
            onChange={(e) => set("is_available", e.target.checked)}
            className="accent-[#d4af37]"
          />
          <span className="text-sm">Available to customers</span>
        </label>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onCancel} className="rounded-full border border-border px-5 py-2 text-sm">
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={uploading}
          className="btn-gold rounded-full px-5 py-2 text-sm inline-flex items-center gap-2 disabled:opacity-60"
        >
          <Save size={14} /> Save
        </button>
      </div>
    </div>
  );
}
