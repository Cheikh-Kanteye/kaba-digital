import { useEffect, useMemo, useState } from "react";
import { Bell, Building2, ChevronDown, FileText, Image as ImageIcon, LayoutDashboard, LogOut, Menu, Plus, Search, Settings, UserRound, Video, X } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

type DashboardMedia = { kind: "image" | "video"; url: string; alt?: string; publicId?: string; format?: string; bytes?: number; width?: number; height?: number; duration?: number };

const menu = [
  { label: "Vue d’ensemble", icon: LayoutDashboard },
  { label: "Mes biens", icon: Building2 },
  { label: "Médias", icon: ImageIcon },
  { label: "Demandes reçues", icon: FileText },
  { label: "Mon profil", icon: UserRound },
];

export default function Dashboard() {
  const [active, setActive] = useState("Vue d’ensemble");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const propertiesQuery = trpc.kaba.ownerProperties.useQuery(undefined, { enabled: Boolean(user) });
  const inquiriesQuery = trpc.kaba.ownerInquiries.useQuery(undefined, { enabled: Boolean(user) });
  const profileQuery = trpc.kaba.profile.me.useQuery(undefined, { enabled: Boolean(user) });
  const [profileMessage, setProfileMessage] = useState("");
  const updateProfile = trpc.kaba.profile.update.useMutation({ onSuccess: async () => { await profileQuery.refetch(); setProfileMessage("Profil synchronisé."); } });

  useEffect(() => {
    if (!user || typeof window === "undefined") return;
    const raw = sessionStorage.getItem("kaba-registration-intent");
    if (!raw) return;
    try {
      const intent = JSON.parse(raw) as Record<string, unknown>;
      const clean = Object.fromEntries(Object.entries(intent).filter(([, value]) => typeof value === "string" && value.trim().length > 0));
      updateProfile.mutate(clean as Parameters<typeof updateProfile.mutate>[0], { onSuccess: () => sessionStorage.removeItem("kaba-registration-intent") });
    } catch {
      sessionStorage.removeItem("kaba-registration-intent");
    }
  }, [user]);

  if (authLoading) return <div className="dashboard-loading">Chargement de votre espace professionnel…</div>;
  if (!user) return <div className="dashboard-loading"><h1>Connexion requise</h1><p>Connectez-vous pour accéder à vos biens et à vos demandes.</p><Link href="/login" className="dashboard-primary">Se connecter</Link></div>;

  const properties = propertiesQuery.data ?? [];
  const inquiries = inquiriesQuery.data ?? [];
  const initials = (user.name || user.email || "Kaba").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const profileLabel = user.email ? "Professionnel Kaba" : "Membre Kaba";

  return <main className="dashboard-shell">
    <aside className={menuOpen ? "dashboard-sidebar is-open" : "dashboard-sidebar"}>
      <div className="dashboard-brand"><img src="/assets/kaba/icon-kaba.webp" alt="Kaba" /><span>Kaba</span><small>ESPACE PRO</small></div>
      <nav className="dashboard-nav" aria-label="Navigation du dashboard">{menu.map(({ label, icon: Icon }) => <button className={active === label ? "is-active" : ""} key={label} onClick={() => { setActive(label); setMenuOpen(false); }}><Icon size={17} />{label}{label === "Demandes reçues" && inquiries.length > 0 && <b>{inquiries.length}</b>}</button>)}</nav>
      <div className="dashboard-sidebar-bottom"><button onClick={() => { setActive("Mon profil"); setMenuOpen(false); }}><Settings size={16} /> Paramètres du profil</button><Link href="/"><LogOut size={16} /> Quitter l’espace</Link></div>
    </aside>
    <section className="dashboard-main">
      <header className="dashboard-header"><button className="dashboard-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Ouvrir le menu">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button><div><p className="dashboard-breadcrumb">ESPACE PROFESSIONNEL <span>/</span> {active.toUpperCase()}</p><h1>{active}</h1></div><div className="dashboard-header-actions"><button className="dashboard-notification" aria-label="Ouvrir les demandes reçues" onClick={() => setActive("Demandes reçues")}><Bell size={18} /><i /></button><div className="dashboard-profile-wrap"><button className="dashboard-profile" onClick={() => setProfileOpen(!profileOpen)}><span className="dashboard-avatar">{initials}</span><span><strong>{user.name || user.email || "Membre Kaba"}</strong><small>{profileLabel}</small></span><ChevronDown size={15} /></button>{profileOpen && <div className="dashboard-profile-menu"><button onClick={() => setActive("Mon profil")}>Mon profil</button><Link href="/">Quitter l’espace</Link></div>}</div></div></header>
      {active === "Vue d’ensemble" && <Overview properties={properties} inquiriesCount={inquiries.length} onNavigate={setActive} />}
      {active === "Mes biens" && <Properties properties={properties} loading={propertiesQuery.isLoading} />}
      {active === "Médias" && <MediaLibrary properties={properties} />}
      {active === "Demandes reçues" && <Requests inquiries={inquiries} loading={inquiriesQuery.isLoading} />}
      {active === "Mon profil" && <Profile user={user} profile={profileQuery.data} loading={profileQuery.isLoading} profileMessage={profileMessage} updateProfile={updateProfile} />}
    </section>
  </main>;
}

function Overview({ properties, inquiriesCount, onNavigate }: { properties: Array<{ status: string }>; inquiriesCount: number; onNavigate: (section: string) => void }) {
  const shortcuts = [
    { label: "Gérer vos biens", detail: "Créer, modifier et publier", section: "Mes biens", Icon: Building2 },
    { label: "Ouvrir la bibliothèque", detail: "Images et films de lieu", section: "Médias", Icon: ImageIcon },
    { label: "Lire les demandes", detail: `${inquiriesCount} demande${inquiriesCount === 1 ? "" : "s"} à traiter`, section: "Demandes reçues", Icon: FileText },
    { label: "Compléter le profil", detail: "Informations professionnelles", section: "Mon profil", Icon: UserRound },
  ];
  return <div className="dashboard-content"><div className="dashboard-welcome"><div><p className="eyebrow"><span>01</span> Votre espace</p><h2>Votre activité,<br /><em>en un regard.</em></h2></div><button className="dashboard-primary" onClick={() => onNavigate("Mes biens")}><Plus size={16} /> Ajouter un bien</button></div><div className="dashboard-stats"><div><span>Biens publiés</span><strong>{properties.filter((property) => property.status === "published").length}</strong><small>Données en direct</small></div><div><span>Biens enregistrés</span><strong>{properties.length}</strong><small>Votre catalogue Kaba</small></div><div><span>Demandes reçues</span><strong>{inquiriesCount}</strong><small>Depuis la mise en ligne</small></div><div><span>Profil</span><strong>OK</strong><small>Session sécurisée</small></div></div><div className="dashboard-section-head"><div><p className="eyebrow"><span>02</span> Accès rapides</p><h3>Chaque outil,<br /><em>à sa place.</em></h3></div><p className="dashboard-section-note">La vue d’ensemble reste volontairement concise. Ouvrez une rubrique pour travailler dans son espace dédié.</p></div><div className="dashboard-shortcuts">{shortcuts.map(({ label, detail, section, Icon }) => <button className="dashboard-shortcut" key={section} onClick={() => onNavigate(section)}><span className="dashboard-shortcut-icon"><Icon size={18} /></span><span><strong>{label}</strong><small>{detail}</small></span><span className="dashboard-shortcut-arrow">→</span></button>)}</div></div>;
}

function Properties({ properties, loading }: { properties: Array<{ id: string; title: string; location: string; status: string; priceLabel: string; updatedAt: Date; media: DashboardMedia[] }>; loading: boolean }) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [priceLabel, setPriceLabel] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<Array<{ kind: "image" | "video"; url: string; alt?: string; publicId?: string; format?: string; bytes?: number; width?: number; height?: number; duration?: number }>>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const utils = trpc.useUtils();
  const resetForm = () => { setShowForm(false); setEditingId(null); setTitle(""); setLocation(""); setPriceLabel(""); setUploadedMedia([]); setUploadMessage(""); setDragActive(false); };
  const createProperty = trpc.kaba.createProperty.useMutation({ onSuccess: async () => { setMessage("Bien enregistré."); resetForm(); await utils.kaba.ownerProperties.invalidate(); } });
  const uploadMedia = trpc.kaba.uploadMedia.useMutation();
  const updateProperty = trpc.kaba.updateProperty.useMutation({ onSuccess: async () => { setMessage("Bien modifié."); resetForm(); await utils.kaba.ownerProperties.invalidate(); await utils.kaba.publishedProperties.invalidate(); } });
  const deleteProperty = trpc.kaba.deleteProperty.useMutation({ onSuccess: async () => { setMessage("Bien supprimé."); await utils.kaba.ownerProperties.invalidate(); await utils.kaba.publishedProperties.invalidate(); } });
  const publishProperty = trpc.kaba.publishProperty.useMutation({ onSuccess: () => { setMessage("Bien publié dans la sélection Kaba."); utils.kaba.ownerProperties.invalidate(); utils.kaba.publishedProperties.invalidate(); } });
  const uploadFiles = async (files: File[]) => {
    setUploadMessage("");
    const oversized = files.find((file) => file.size > 20 * 1024 * 1024);
    if (oversized) { setUploadMessage(`${oversized.name} dépasse la limite de 20 Mo.`); return; }
    setUploading(true);
    try {
      const uploaded = [] as Array<{ kind: "image" | "video"; url: string; alt?: string; publicId?: string; format?: string; bytes?: number; width?: number; height?: number; duration?: number }>;
      for (const file of files) {
        const data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
          reader.onload = () => resolve(String(reader.result));
          reader.readAsDataURL(file);
        });
        const result = await uploadMedia.mutateAsync({ filename: file.name, mimeType: file.type, data });
        uploaded.push({ kind: result.kind, url: result.url, publicId: result.publicId, format: result.format, bytes: result.bytes, width: result.width, height: result.height, duration: result.duration, alt: file.name });
      }
      setUploadedMedia((current) => [...current, ...uploaded]);
      setUploadMessage(`${uploaded.length} média${uploaded.length > 1 ? "s" : ""} envoyé${uploaded.length > 1 ? "s" : ""} sur Cloudinary.`);
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : "Upload Cloudinary impossible.");
    } finally {
      setUploading(false);
    }
  };
  const handleFiles = (files: File[]) => { if (files.length > 0) void uploadFiles(files); };
  const removeMedia = (url: string) => setUploadedMedia((current) => current.filter((item) => item.url !== url));
  const filtered = useMemo(() => properties.filter((property) => `${property.title} ${property.location}`.toLowerCase().includes(search.toLowerCase())), [properties, search]);
  const submit = (event: React.FormEvent) => { event.preventDefault(); const media = uploadedMedia.map((item) => ({ ...item, alt: item.alt || title })); const payload = { title, type: "Maison" as const, mode: "Vente" as const, location, priceLabel: priceLabel || "Sur demande", media, status: (editingId ? properties.find((property) => property.id === editingId)?.status || "draft" : "draft") as "draft" | "published" | "archived" }; if (editingId) updateProperty.mutate({ id: editingId, changes: payload }); else createProperty.mutate(payload); };
  return <div className="dashboard-content"><div className="dashboard-toolbar"><div className="dashboard-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher dans vos biens" /></div><button className="dashboard-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} /> Ajouter un bien</button></div>{showForm && <form className="dashboard-property-form" onSubmit={submit}><label>Titre<input value={title} onChange={(event) => setTitle(event.target.value)} required placeholder="Ex. Villa des Almadies" /></label><label>Quartier<input value={location} onChange={(event) => setLocation(event.target.value)} required placeholder="Ex. Almadies · Dakar" /></label><label>Prix<input value={priceLabel} onChange={(event) => setPriceLabel(event.target.value)} placeholder="Ex. 120 000 000 FCFA" /></label><div className={dragActive ? "media-dropzone is-dragging" : "media-dropzone"} onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (event.currentTarget === event.target) setDragActive(false); }} onDrop={(event) => { event.preventDefault(); setDragActive(false); handleFiles(Array.from(event.dataTransfer.files)); }}><input id="property-media-upload" className="media-dropzone-input" type="file" accept="image/*,video/*" multiple onChange={(event) => { handleFiles(Array.from(event.target.files ?? [])); event.currentTarget.value = ""; }} /><label htmlFor="property-media-upload" className="media-dropzone-content"><span className="media-dropzone-icon"><ImageIcon size={22} /><Video size={20} /></span><strong>{uploading ? "Envoi vers Cloudinary…" : "Glissez vos images et vidéos ici"}</strong><span>{uploading ? "Ne fermez pas cette fenêtre pendant l’envoi" : "ou cliquez pour sélectionner plusieurs fichiers"}</span><small>Images JPG, PNG, WebP · vidéos MP4, MOV · 20 Mo maximum par fichier</small></label></div>{uploadMessage && <p className="form-success">{uploadMessage}</p>}{uploadedMedia.length > 0 && <div className="uploaded-media-grid">{uploadedMedia.map((item) => <div className="uploaded-media-item" key={item.url}>{item.kind === "video" ? <video src={item.url} muted playsInline /> : <img src={item.url} alt={item.alt || "Média du bien"} />}<span className="uploaded-media-kind">{item.kind === "video" ? "Vidéo" : "Image"}</span><button type="button" className="uploaded-media-remove" onClick={() => removeMedia(item.url)} aria-label={`Supprimer ${item.alt || "ce média"}`}><X size={15} /></button></div>)}</div>}<button className="dashboard-primary" disabled={createProperty.isPending || updateProperty.isPending || uploading || uploadedMedia.length === 0}>{editingId ? "Enregistrer les modifications" : "Enregistrer le bien"}</button>{createProperty.error && <p className="form-error">{createProperty.error.message}</p>}</form>}{message && <p className="form-success">{message}</p>}{(createProperty.error || updateProperty.error || deleteProperty.error) && <p className="form-error">{createProperty.error?.message || updateProperty.error?.message || deleteProperty.error?.message || "Action impossible pour le moment."}</p>}{loading ? <div className="dashboard-empty">Chargement…</div> : filtered.length === 0 ? <EmptyState title="Aucun bien trouvé" text="Ajoutez une adresse ou modifiez votre recherche." action={() => setShowForm(true)} /> : <div className="dashboard-table"><div className="dashboard-table-head"><span>Bien</span><span>Statut</span><span>Prix</span><span>Dernière modification</span><span /></div>{filtered.map((property) => <div className="dashboard-table-row" key={property.id}><div className="table-property"><img src={property.media[0]?.url || "/assets/kaba/hero-dakar.webp"} alt="" /><span><strong>{property.title}</strong><small>{property.location}</small></span></div><span className={`status status-${property.status}`}>{property.status}</span><span>{property.priceLabel}</span><span>{new Date(property.updatedAt).toLocaleDateString("fr-FR")}</span><div className="table-actions">{property.status === "draft" && <button className="table-action" onClick={() => publishProperty.mutate({ id: property.id })}>Publier</button>}<button className="table-action" onClick={() => { setEditingId(property.id); setShowForm(true); setTitle(property.title); setLocation(property.location); setPriceLabel(property.priceLabel); setUploadedMedia(property.media); }}>Modifier</button><button className="table-action danger" onClick={() => { if (window.confirm("Supprimer ce bien ?")) deleteProperty.mutate({ id: property.id }); }}>Supprimer</button></div></div>)}</div>}</div>;
}

function MediaLibrary({ properties }: { properties: Array<{ id: string; title: string; media: DashboardMedia[] }> }) { const media = properties.flatMap((property) => property.media.map((item) => ({ ...item, title: property.title }))); return <div className="dashboard-content"><div className="dashboard-section-head"><div><p className="eyebrow"><span>02</span> Bibliothèque</p><h3>Vos images,<br /><em>vos films.</em></h3></div></div>{media.length === 0 ? <EmptyState title="Aucun média" text="Les médias apparaîtront ici quand vous aurez ajouté un bien." /> : <div className="dashboard-media-grid">{media.map((item, index) => <div className="dashboard-media-card" key={`${item.url}-${index}`}>{item.kind === "video" ? <video src={item.url} controls playsInline /> : <img src={item.url} alt={item.title} />}{item.kind === "video" && <span><Video size={13} /> Film</span>}</div>)}</div>}</div>; }

function Requests({ inquiries, loading }: { inquiries: Array<{ id: string; propertyId: string; senderName: string; message?: string; status: string; createdAt: Date }>; loading: boolean }) {
  const utils = trpc.useUtils();
  const updateStatus = trpc.kaba.updateInquiryStatus.useMutation({ onSuccess: () => utils.kaba.ownerInquiries.invalidate() });
  return <div className="dashboard-content"><div className="dashboard-section-head"><div><p className="eyebrow"><span>03</span> Relation</p><h3>Les personnes qui<br /><em>regardent vos biens.</em></h3></div></div>{loading ? <div className="dashboard-empty">Chargement des demandes…</div> : inquiries.length === 0 ? <EmptyState title="Aucune demande" text="Les demandes envoyées depuis vos biens publiés apparaîtront ici." /> : <div className="dashboard-requests">{inquiries.map((inquiry) => <div className="dashboard-request" key={inquiry.id}><span className="request-avatar">{inquiry.senderName.split(" ").map((part) => part[0]).join("")}</span><div><strong>{inquiry.senderName}</strong><p>{inquiry.message || "Demande de renseignements"}</p><small className="request-status">{inquiry.status}</small></div><small>{new Date(inquiry.createdAt).toLocaleDateString("fr-FR")}</small><button onClick={() => updateStatus.mutate({ id: inquiry.id, status: inquiry.status === "new" ? "contacted" : "closed" })}>{inquiry.status === "new" ? "Marquer contactée" : "Clôturer"} →</button></div>)}</div>}</div>;
}

function Profile({ user, profile, loading, profileMessage, updateProfile }: { user: { name?: string | null; email?: string | null; role?: string }; profile?: { name?: string; email?: string; profile?: string; phone?: string; city?: string; rcNumber?: string; ninea?: string; agencyAddress?: string }; loading: boolean; profileMessage: string; updateProfile: { mutate: (input: Record<string, string>) => void; isPending: boolean; error?: { message?: string } | null } }) {
  const data = profile || {};
  return <div className="dashboard-content"><div className="profile-card"><div className="profile-card-top"><span className="dashboard-avatar large">{(data.name || user.name || user.email || "K").slice(0, 2).toUpperCase()}</span><div><p className="eyebrow"><span>04</span> Profil professionnel</p><h3>{data.name || user.name || "Membre Kaba"}</h3><p>{data.email || user.email || "Email non renseigné"}</p></div><span className="verified"><span>✓</span> Session vérifiée</span></div>{loading ? <div className="dashboard-empty">Chargement du profil…</div> : <div className="profile-fields"><label>Nom complet<input value={data.name || user.name || ""} readOnly placeholder="Non renseigné" /></label><label>Email professionnel<input value={data.email || user.email || ""} readOnly placeholder="Non renseigné" /></label><label>Profil<input value={data.profile || "Non renseigné"} readOnly /></label><label>Téléphone<input value={data.phone || ""} readOnly placeholder="Non renseigné" /></label><label>Ville<input value={data.city || ""} readOnly placeholder="Dakar" /></label><label>RC / NINEA<input value={[data.rcNumber, data.ninea].filter(Boolean).join(" · ")} readOnly placeholder="Non renseigné" /></label><label>Adresse d’agence<input value={data.agencyAddress || ""} readOnly placeholder="Non renseignée" /></label><button className="dashboard-primary" type="button" onClick={() => updateProfile.mutate({ name: data.name || user.name || "", profile: data.profile || "Agent immobilier", phone: data.phone || "", city: data.city || "", rcNumber: data.rcNumber || "", ninea: data.ninea || "", agencyAddress: data.agencyAddress || "" })}>{updateProfile.isPending ? "Synchronisation…" : "Synchroniser le profil"}</button></div>}{profileMessage && <p className="form-success" role="status">{profileMessage}</p>}{updateProfileError(updateProfile) && <p className="form-error" role="alert">{updateProfileError(updateProfile)}</p>}</div></div>;
}

function updateProfileError(updateProfile: { error?: { message?: string } | null }) { return updateProfile.error?.message || ""; }

function EmptyState({ title, text, action }: { title: string; text: string; action?: () => void }) { return <div className="dashboard-empty"><h3>{title}</h3><p>{text}</p>{action && <button className="dashboard-primary" onClick={action}><Plus size={16} /> Ajouter</button>}</div>; }
