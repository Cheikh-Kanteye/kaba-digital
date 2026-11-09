import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, BarChart3, Building2, Download, FileText, LogOut, Plus, RefreshCw, Search, ShieldCheck, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { downloadCsv } from "@/lib/csv";
import { trpc, type RouterInputs, type RouterOutputs } from "@/lib/trpc";

type AdminSection = "Vue d’ensemble" | "Utilisateurs" | "Biens" | "Demandes";
type Dashboard = RouterOutputs["admin"]["dashboard"];
type UserRow = RouterOutputs["admin"]["allUsers"][number];
type PropertyRow = RouterOutputs["admin"]["allProperties"][number];
type InquiryRow = RouterOutputs["admin"]["inquiries"][number];
type InquiryStatus = InquiryRow["status"];
type Filters = { users: string; properties: string; inquiries: string };

const PATHS: Record<AdminSection, string> = {
  "Vue d’ensemble": "/admin",
  Utilisateurs: "/admin/users",
  Biens: "/admin/properties",
  Demandes: "/admin/inquiries",
};

const navigation: Array<{ label: AdminSection; Icon: typeof Users }> = [
  { label: "Vue d’ensemble", Icon: BarChart3 },
  { label: "Utilisateurs", Icon: Users },
  { label: "Biens", Icon: Building2 },
  { label: "Demandes", Icon: FileText },
];

const number = new Intl.NumberFormat("fr-FR");
const plural = (n: number, word: string, many = `${word}s`) => `${number.format(n)} ${n > 1 ? many : word}`;
const shortDate = (date?: Date | string) =>
  date ? new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const trend = (recent: number, previous: number) =>
  !recent && !previous ? "Rien sur les 30 derniers jours" : `+${number.format(recent)} en 30 jours (${number.format(previous)} les 30 jours d’avant)`;

function sectionFromPath(path: string): AdminSection {
  if (path === "/admin/users") return "Utilisateurs";
  if (path === "/admin/properties") return "Biens";
  if (path === "/admin/inquiries") return "Demandes";
  return "Vue d’ensemble";
}

export default function Admin() {
  const [location, navigate] = useLocation();
  const { user, loading, logout } = useAuth();
  const [active, setActive] = useState<AdminSection>(sectionFromPath(location));
  const [filters, setFilters] = useState<Filters>({ users: "", properties: "", inquiries: "" });
  const isAdmin = user?.role === "admin";
  const dashboard = trpc.admin.dashboard.useQuery(undefined, { enabled: isAdmin });
  const users = trpc.admin.allUsers.useQuery(undefined, { enabled: isAdmin });
  const properties = trpc.admin.allProperties.useQuery(undefined, { enabled: isAdmin });
  const inquiries = trpc.admin.inquiries.useQuery(undefined, { enabled: isAdmin });
  const utils = trpc.useUtils();
  const [actionError, setActionError] = useState("");

  const onDone = (refresh: () => Promise<unknown>) => ({
    onSuccess: async () => { setActionError(""); await Promise.all([refresh(), utils.admin.dashboard.invalidate()]); },
    onError: (error: { message: string }) => setActionError(error.message),
  });
  const updateInquiryStatus = trpc.admin.updateInquiryStatus.useMutation(onDone(() => utils.admin.inquiries.invalidate()));
  const updatePropertyStatus = trpc.admin.updatePropertyStatus.useMutation(onDone(() => utils.admin.allProperties.invalidate()));
  const updateProperty = trpc.admin.updateProperty.useMutation(onDone(() => utils.admin.allProperties.invalidate()));
  const updateUserRole = trpc.admin.updateUserRole.useMutation(onDone(() => utils.admin.allUsers.invalidate()));

  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/login");
    else if (user.role !== "admin") navigate("/dashboard");
  }, [loading, user, navigate]);

  useEffect(() => { setActive(sectionFromPath(location)); }, [location]);

  const open = (section: AdminSection, filter?: Partial<Filters>) => {
    if (filter) setFilters((current) => ({ ...current, ...filter }));
    navigate(PATHS[section]);
  };

  if (loading || !user || user.role !== "admin") return <div className="dashboard-loading">Vérification des droits administrateur…</div>;

  return <main className="admin-shell">
    <aside className="admin-sidebar">
      <Link href="/" className="admin-brand"><img src="/assets/kaba/icon-kaba.webp" alt="Kaba" /><span>Kaba</span><small>ADMINISTRATION</small></Link>
      <div className="admin-sidebar-label">CONTRÔLE</div>
      <nav className="admin-nav" aria-label="Navigation administration">{navigation.map(({ label, Icon }) => <button key={label} className={active === label ? "is-active" : ""} onClick={() => open(label)}><Icon size={17} /> {label}</button>)}</nav>
      <div className="admin-sidebar-bottom"><Link href="/dashboard"><ArrowLeft size={16} /> Espace professionnel</Link><button onClick={() => logout().then(() => navigate("/login"))}><LogOut size={16} /> Déconnexion</button></div>
    </aside>
    <section className="admin-main">
      <header className="admin-header"><div><p className="admin-kicker"><ShieldCheck size={15} /> Accès administrateur</p><h1>{active}</h1><p>{active === "Vue d’ensemble" ? "Supervision de la plateforme immobilière." : `Gestion dédiée : ${active.toLowerCase()}.`}</p></div><div className="admin-identity"><span>{(user.name || user.email || "A").slice(0, 1).toUpperCase()}</span><div><strong>{user.name || "Administrateur"}</strong><small>{user.email}</small></div></div></header>
      {actionError && <div className="admin-action-error" role="alert">{actionError}</div>}
      {active === "Vue d’ensemble" && <Overview data={dashboard.data} loading={dashboard.isLoading} error={dashboard.error?.message} refreshing={dashboard.isFetching} onRefresh={() => dashboard.refetch()} onOpen={open} />}
      {active === "Utilisateurs" && <UsersView users={users.data ?? []} loading={users.isLoading} error={users.error?.message} filter={filters.users} onFilter={(value) => setFilters((f) => ({ ...f, users: value }))} selfId={user.openId} updating={updateUserRole.isPending} onRole={(openId, role) => updateUserRole.mutate({ openId, role })} />}
      {active === "Biens" && <PropertiesView properties={properties.data ?? []} loading={properties.isLoading} error={properties.error?.message} filter={filters.properties} onFilter={(value) => setFilters((f) => ({ ...f, properties: value }))} updating={updatePropertyStatus.isPending} onStatus={(id, status) => updatePropertyStatus.mutate({ id, status })} saving={updateProperty.isPending} onSave={(id, changes, done) => updateProperty.mutate({ id, changes }, { onSuccess: done })} />}
      {active === "Demandes" && <InquiriesView inquiries={inquiries.data ?? []} loading={inquiries.isLoading} error={inquiries.error?.message} filter={filters.inquiries} onFilter={(value) => setFilters((f) => ({ ...f, inquiries: value }))} updating={updateInquiryStatus.isPending} onStatus={(id, status) => updateInquiryStatus.mutate({ id, status })} />}
    </section>
  </main>;
}

/* ---------------------------- Vue d'ensemble ---------------------------- */

function Overview({ data, loading, error, refreshing, onRefresh, onOpen }: { data?: Dashboard; loading: boolean; error?: string; refreshing: boolean; onRefresh: () => void; onOpen: (section: AdminSection, filter?: Partial<Filters>) => void }) {
  const intro = <div className="admin-overview-head"><div className="admin-overview-intro"><p className="admin-section-number">00 / PILOTAGE</p><h2>La plateforme,<br /><em>en un regard.</em></h2></div><div className="admin-actions"><a className="admin-btn" href="/dashboard#biens"><Plus size={15} /> Ajouter un bien</a></div></div>;
  if (error) return <div className="admin-content">{intro}<AdminError message={error} /></div>;
  if (loading || !data) return <div className="admin-content">{intro}<AdminLoading label="Calcul des statistiques…" /></div>;

  const { properties: p, users: u, inquiries: i } = data;
  const cards = [
    { label: "Biens publiés", value: p.published, note: trend(p.recent, p.previous), Icon: Building2, section: "Biens" as const },
    { label: "Professionnels", value: u.pros, note: trend(u.recent, u.previous), Icon: Users, section: "Utilisateurs" as const },
    { label: "Consultations", value: p.views, note: p.published ? `${number.format(Math.round(p.views / p.published))} par bien en moyenne` : "Aucun bien à consulter", Icon: BarChart3, section: "Biens" as const },
    { label: "Demandes", value: i.total, note: i.open ? `${plural(i.open, "nouvelle")} à traiter` : trend(i.recent, i.previous), Icon: FileText, section: "Demandes" as const },
  ];
  const figures: Array<[string, string]> = [
    ["À vendre", number.format(p.sale)],
    ["À louer", number.format(p.rent)],
    ["Brouillons", number.format(p.draft)],
    ["Archivés", number.format(p.archived)],
    ["Administrateurs", number.format(u.admins)],
    ["Demandes traitées", i.total ? `${Math.round((i.closed / i.total) * 100)} %` : "—"],
  ];
  const steps = [
    { done: p.published > 0, title: "Publier un premier bien", text: "Il apparaît aussitôt dans la sélection publique.", action: <a className="admin-link" href="/dashboard#biens">Ajouter un bien</a> },
    { done: u.pros > 0, title: "Accueillir un premier professionnel", text: "Le lien d’inscription est à partager avec les agents et les courtiers.", action: <a className="admin-link" href="/register">Ouvrir l’inscription</a> },
    { done: i.total > 0, title: "Recevoir une première demande", text: "Les visiteurs écrivent depuis la fiche d’un bien publié.", action: <a className="admin-link" href="/selection">Voir la sélection</a> },
  ];
  const doneCount = steps.filter((step) => step.done).length;
  const tasks = [
    { n: i.open, one: "demande à traiter", many: "demandes à traiter", go: () => onOpen("Demandes", { inquiries: "new" }) },
    { n: i.contacted, one: "demande contactée à clôturer", many: "demandes contactées à clôturer", go: () => onOpen("Demandes", { inquiries: "contacted" }) },
    { n: p.noMedia, one: "bien publié sans photo ni vidéo", many: "biens publiés sans photo ni vidéo", go: () => onOpen("Biens", { properties: "no-media" }) },
    { n: p.noPrice, one: "bien publié sans prix", many: "biens publiés sans prix", go: () => onOpen("Biens", { properties: "no-price" }) },
    { n: p.draft, one: "brouillon non publié", many: "brouillons non publiés", go: () => onOpen("Biens", { properties: "draft" }) },
    { n: u.incomplete, one: "profil professionnel incomplet", many: "profils professionnels incomplets", go: () => onOpen("Utilisateurs", { users: "incomplete" }) },
  ].filter((task) => task.n > 0);

  return <div className="admin-content">
    {intro}
    <div className="admin-grid">{cards.map(({ label, value, note, Icon, section }) => <button className="admin-stat" key={label} onClick={() => onOpen(section)}><Icon size={18} /><span>{label}</span><strong>{number.format(value)}</strong><small>{note}</small></button>)}</div>
    <dl className="admin-figures">{figures.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>

    {doneCount < steps.length && <Block title="Pour démarrer" note={`${doneCount} sur ${steps.length}`}><ol className="admin-steps">{steps.map((step) => <li key={step.title} className={step.done ? "is-done" : ""}><span className="admin-step-mark" aria-hidden="true">{step.done ? "✓" : ""}</span><span className="admin-step-copy"><b>{step.title}{step.done && <span className="sr-only"> (fait)</span>}</b>{!step.done && <small>{step.text}</small>}</span>{!step.done && step.action}</li>)}</ol></Block>}

    <Block title="À traiter">{tasks.length ? <ul className="admin-tasks">{tasks.map((task) => <li key={task.one}><strong>{number.format(task.n)}</strong><span>{task.n > 1 ? task.many : task.one}</span><button className="admin-link" onClick={task.go}>Voir</button></li>)}</ul> : <p className="admin-nothing">Rien à traiter pour l’instant.</p>}</Block>

    <Block title="Activité" note="12 dernières semaines"><div className="admin-charts">
      <WeekChart title="Biens créés" weeks={data.weeks} field="properties" unit="bien" />
      <WeekChart title="Inscriptions" weeks={data.weeks} field="users" unit="inscription" />
      <WeekChart title="Demandes" weeks={data.weeks} field="inquiries" unit="demande" />
    </div></Block>

    <Block title="Répartition" note="biens publiés et professionnels"><div className="admin-charts">
      <Distribution title="Biens par type" rows={p.byType} empty="Aucun bien publié." />
      <Distribution title="Biens par ville" rows={p.byCity} empty="Aucun bien publié." limit={6} />
      <Distribution title="Professionnels par profil" rows={u.byProfile} empty="Aucun professionnel inscrit." />
    </div></Block>

    <div className="admin-lists">
      <Block title="Les plus consultés"><RankList empty="Aucune consultation pour l’instant." rows={p.topViewed.map((b) => ({ key: b.id, title: b.title, text: b.location, value: plural(b.views, "vue") }))} /></Block>
      <Block title="Les plus demandés"><RankList empty="Aucune demande pour l’instant." rows={i.topProperties.map((b) => ({ key: b.id, title: b.title || "Bien retiré", text: "", value: plural(b.n, "demande") }))} /></Block>
      <Block title="Derniers biens"><RankList empty="Aucun bien enregistré." rows={p.latest.map((b) => ({ key: b.id, title: b.title, text: `${b.location} · ${shortDate(b.createdAt)}`, value: STATUS_LABEL[b.status] ?? b.status }))} /></Block>
      <Block title="Derniers comptes"><RankList empty="Aucun compte." rows={u.latest.map((c, index) => ({ key: c.email ?? String(index), title: c.name || "Profil incomplet", text: `${c.email ?? ""} · ${shortDate(c.createdAt)}`, value: c.role === "admin" ? "Admin" : c.profile ?? "Professionnel" }))} /></Block>
    </div>

    <p className="admin-updated"><span role="status">Mis à jour à {new Date(data.generatedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span><button className="admin-link" disabled={refreshing} onClick={onRefresh}><RefreshCw size={13} /> Actualiser</button></p>
  </div>;
}

function Block({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return <section className="admin-block"><h3>{title}{note && <small>{note}</small>}</h3>{children}</section>;
}

/** Petit multiple : une série, donc une teinte, un axe et pas de légende. */
function WeekChart({ title, weeks, field, unit }: { title: string; weeks: Dashboard["weeks"]; field: "properties" | "users" | "inquiries"; unit: string }) {
  const max = Math.max(...weeks.map((week) => week[field]));
  const total = weeks.reduce((sum, week) => sum + week[field], 0);
  const day = (date: Date) => new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
  return <figure className="admin-chart">
    <figcaption><b>{title}</b><small>{number.format(total)} sur 12 semaines{max > 0 ? `, maximum ${number.format(max)} par semaine` : ""}</small></figcaption>
    <ol className="admin-bars">{weeks.map((week) => {
      const info = `Semaine du ${day(week.start)} : ${plural(week[field], unit)}`;
      return <li key={String(week.start)} tabIndex={0} aria-label={info} data-info={info}><span style={{ height: `${max ? Math.max(week[field] ? 6 : 0, (week[field] / max) * 100) : 0}%` }} /></li>;
    })}</ol>
    <div className="admin-axis"><span>{day(weeks[0].start)}</span><span>{day(weeks[weeks.length - 1].start)}</span></div>
  </figure>;
}

/** Au-delà de `limit` catégories, le reste est regroupé dans « Autres ». */
function Distribution({ title, rows, empty, limit }: { title: string; rows: Array<{ name: string; n: number }>; empty: string; limit?: number }) {
  const shown = limit && rows.length > limit
    ? [...rows.slice(0, limit - 1), { name: "Autres", n: rows.slice(limit - 1).reduce((sum, row) => sum + row.n, 0) }]
    : rows;
  const total = shown.reduce((sum, row) => sum + row.n, 0);
  const max = Math.max(0, ...shown.map((row) => row.n));
  return <figure className="admin-chart"><figcaption><b>{title}</b></figcaption>{total ? <ul className="admin-hbars">{shown.map((row) => <li key={row.name}><span>{row.name}</span><i><em style={{ width: `${(row.n / max) * 100}%` }} /></i><b>{number.format(row.n)} <small>{Math.round((row.n / total) * 100)} %</small></b></li>)}</ul> : <p className="admin-nothing">{empty}</p>}</figure>;
}

function RankList({ rows, empty }: { rows: Array<{ key: string; title: string; text: string; value: string }>; empty: string }) {
  if (!rows.length) return <p className="admin-nothing">{empty}</p>;
  return <ol className="admin-rank">{rows.map((row) => <li key={row.key}><span><b>{row.title}</b>{row.text && <small>{row.text}</small>}</span><em>{row.value}</em></li>)}</ol>;
}

/* ------------------------------ Outils de liste ------------------------------ */

function Toolbar({ search, onSearch, placeholder, filter, onFilter, options, count, onExport, action }: { search: string; onSearch: (value: string) => void; placeholder: string; filter: string; onFilter: (value: string) => void; options: Array<[string, string]>; count: string; onExport: () => void; action?: ReactNode }) {
  return <div className="admin-toolbar">
    <label className="admin-search"><Search size={15} /><span className="sr-only">Rechercher</span><input type="search" value={search} placeholder={placeholder} onChange={(event) => onSearch(event.target.value)} /></label>
    <label><span className="sr-only">Filtrer</span><select value={filter} onChange={(event) => onFilter(event.target.value)}>{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <div className="admin-actions"><button className="admin-btn is-ghost" onClick={onExport}><Download size={15} /> Exporter (CSV)</button>{action}</div>
    <p className="admin-count" role="status">{count}</p>
  </div>;
}

const matches = (query: string, values: Array<string | undefined>) => {
  const needle = query.trim().toLowerCase();
  return !needle || values.join(" ").toLowerCase().includes(needle);
};
const countLabel = (shown: number, total: number, word: string) =>
  shown === total ? plural(total, word) : `${number.format(shown)} sur ${plural(total, word)}`;

/* ------------------------------ Utilisateurs ------------------------------ */

const isIncomplete = (item: UserRow) => item.role !== "admin" && (item.needsProfile === true || (!item.phone && !item.whatsapp));

function UsersView({ users, loading, error, filter, onFilter, selfId, updating, onRole }: { users: UserRow[]; loading: boolean; error?: string; filter: string; onFilter: (value: string) => void; selfId?: string; updating: boolean; onRole: (openId: string, role: "user" | "admin") => void }) {
  const [search, setSearch] = useState("");
  const shown = useMemo(() => users.filter((item) => {
    if (filter === "admin" && item.role !== "admin") return false;
    if (filter === "pro" && item.role === "admin") return false;
    if (filter === "incomplete" && !isIncomplete(item)) return false;
    return matches(search, [item.name, item.email, item.phone, item.whatsapp, item.city]);
  }), [users, filter, search]);

  const exportCsv = () => downloadCsv("kaba-comptes", ["Nom", "Email", "Rôle", "Profil", "Téléphone", "WhatsApp", "Ville", "Profil complet", "Inscrit le"],
    shown.map((item) => [item.name, item.email, item.role === "admin" ? "admin" : "professionnel", item.profile, item.phone, item.whatsapp, item.city, isIncomplete(item) ? "non" : "oui", item.createdAt ? new Date(item.createdAt) : ""]));
  const changeRole = (item: UserRow, role: "user" | "admin") => {
    if (item.openId && window.confirm(role === "admin" ? `Donner l’accès administrateur à ${item.name || item.email} ?` : `Retirer l’accès administrateur à ${item.name || item.email} ?`)) onRole(item.openId, role);
  };

  return <div className="admin-content"><div className="admin-view-intro"><div><p className="admin-section-number">01 / COMPTES</p><h2>Tous les<br /><em>utilisateurs.</em></h2></div><p>Profils inscrits, rôles et niveau de complétion disponibles pour la supervision.</p></div>
    {error ? <AdminError message={error} /> : loading ? <AdminLoading label="Chargement des utilisateurs…" /> : <>
      <Toolbar search={search} onSearch={setSearch} placeholder="Nom, email, téléphone, ville…" filter={filter} onFilter={onFilter} options={[["", "Tous les comptes"], ["pro", "Professionnels"], ["admin", "Administrateurs"], ["incomplete", "Profils incomplets"]]} count={countLabel(shown.length, users.length, "compte")} onExport={exportCsv} />
      {shown.length === 0 ? <AdminEmpty title={users.length ? "Aucun compte ne correspond" : "Aucun utilisateur"} text={users.length ? "Essayez un autre terme ou retirez le filtre." : "Les comptes créés apparaîtront ici."} action={users.length ? undefined : <a className="admin-btn" href="/register">Ouvrir l’inscription</a>} /> : <div className="admin-data-table admin-users-table"><div className="admin-data-head"><span>Profil</span><span>Type</span><span>Ville</span><span>État</span><span>Action</span></div>{shown.map((item) => <div className="admin-data-row" key={item.openId || item.email}><div className="admin-table-person"><span className="admin-user-avatar">{(item.name || item.email || "?").slice(0, 1).toUpperCase()}</span><span><strong>{item.name || "Profil incomplet"}</strong><small>{item.email || item.openId}</small></span></div><span className={`admin-role ${item.role === "admin" ? "is-admin" : ""}`}>{item.role === "admin" ? "Admin" : item.profile || "Professionnel"}</span><span>{item.city || "—"}</span><span className={isIncomplete(item) ? "admin-state pending" : "admin-state"}>{isIncomplete(item) ? "À compléter" : "Complet"}</span><span>{item.openId && item.openId !== selfId ? <button className="admin-link" disabled={updating} onClick={() => changeRole(item, item.role === "admin" ? "user" : "admin")}>{item.role === "admin" ? "Retirer l’admin" : "Rendre admin"}</button> : item.openId === selfId ? <small className="admin-self">Vous</small> : "—"}</span></div>)}</div>}
    </>}
  </div>;
}

/* ---------------------------------- Biens ---------------------------------- */

const STATUS_LABEL: Record<string, string> = { published: "Publié", draft: "Brouillon", archived: "Archivé" };

type PropertyChanges = RouterInputs["admin"]["updateProperty"]["changes"];

/** Première photo, sinon l'image que Cloudinary extrait d'une vidéo : un .mp4 ne s'affiche pas dans une balise img. */
function coverOf(property: PropertyRow): string {
  const media = property.media ?? [];
  const photo = media.find((item) => item.kind === "image");
  if (photo) return photo.url;
  const video = media.find((item) => item.kind === "video");
  if (video?.url.includes("res.cloudinary.com")) return video.url.replace(/\.[a-z0-9]+$/i, ".jpg");
  return "/assets/kaba/hero-dakar.webp";
}

function PropertyEditor({ property, saving, onSave, onClose }: { property: PropertyRow; saving: boolean; onSave: (changes: PropertyChanges) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    title: property.title,
    type: property.type,
    mode: property.mode,
    location: property.location,
    priceLabel: property.priceLabel ?? "",
    description: property.description ?? "",
    surface: property.surface ?? "",
    bedrooms: property.bedrooms ?? 0,
    bathrooms: property.bathrooms ?? 0,
  });
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [key]: value }));
  return <Dialog open onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
    <DialogContent className="admin-editor">
      <DialogHeader><DialogTitle>Modifier le bien</DialogTitle></DialogHeader>
      <form onSubmit={(event) => { event.preventDefault(); onSave(form); }}>
        <label className="is-wide">Titre<input required value={form.title} onChange={(event) => set("title", event.target.value)} /></label>
        <label>Type<select value={form.type} onChange={(event) => set("type", event.target.value as typeof form.type)}><option>Maison</option><option>Villa</option><option>Appartement</option><option>Terrain</option></select></label>
        <label>Transaction<select value={form.mode} onChange={(event) => set("mode", event.target.value as typeof form.mode)}><option>Vente</option><option>Location</option></select></label>
        <label className="is-wide">Lieu<input required placeholder="Almadies · Dakar" value={form.location} onChange={(event) => set("location", event.target.value)} /></label>
        <label>Prix<input placeholder="185 000 000 FCFA" value={form.priceLabel} onChange={(event) => set("priceLabel", event.target.value)} /></label>
        <label>Surface<input placeholder="420 m²" value={form.surface} onChange={(event) => set("surface", event.target.value)} /></label>
        <label>Chambres<input type="number" min={0} value={form.bedrooms} onChange={(event) => set("bedrooms", Number(event.target.value))} /></label>
        <label>Salles de bain<input type="number" min={0} value={form.bathrooms} onChange={(event) => set("bathrooms", Number(event.target.value))} /></label>
        <label className="is-wide">Description<textarea rows={4} value={form.description} onChange={(event) => set("description", event.target.value)} /></label>
        <div className="admin-editor-media is-wide">{(property.media ?? []).slice(0, 8).map((item) => item.kind === "video" ? <video key={item.url} src={item.url} controls preload="metadata" /> : <img key={item.url} src={item.url} alt={item.alt ?? property.title} />)}</div>
        <div className="admin-actions is-wide"><button className="admin-btn" type="submit" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</button><button className="admin-btn is-ghost" type="button" onClick={onClose}>Annuler</button></div>
      </form>
    </DialogContent>
  </Dialog>;
}

function PropertiesView({ properties, loading, error, filter, onFilter, updating, onStatus, saving, onSave }: { properties: PropertyRow[]; loading: boolean; error?: string; filter: string; onFilter: (value: string) => void; updating: boolean; onStatus: (id: string, status: "published" | "archived") => void; saving: boolean; onSave: (id: string, changes: PropertyChanges, done: () => void) => void }) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<PropertyRow | null>(null);
  const shown = useMemo(() => properties.filter((item) => {
    if (["published", "draft", "archived"].includes(filter) && item.status !== filter) return false;
    if (["Vente", "Location"].includes(filter) && item.mode !== filter) return false;
    if (filter === "no-media" && (item.status !== "published" || (item.media?.length ?? 0) > 0)) return false;
    if (filter === "no-price" && (item.status !== "published" || item.priceLabel)) return false;
    return matches(search, [item.title, item.location, item.type, item.ownerName, item.ownerEmail]);
  }), [properties, filter, search]);

  const exportCsv = () => downloadCsv("kaba-biens", ["Titre", "Statut", "Type", "Transaction", "Lieu", "Prix", "Vues", "Médias", "Propriétaire", "Créé le"],
    shown.map((item) => [item.title, STATUS_LABEL[item.status] ?? item.status, item.type, item.mode, item.location, item.priceLabel, item.views ?? 0, item.media?.length ?? 0, item.ownerName ?? item.ownerEmail, item.createdAt ? new Date(item.createdAt) : ""]));
  const change = (item: PropertyRow, status: "published" | "archived") => {
    if (window.confirm(status === "archived" ? `Retirer « ${item.title} » de la sélection publique ?` : `Publier « ${item.title} » dans la sélection publique ?`)) onStatus(item.id, status);
  };

  return <div className="admin-content"><div className="admin-view-intro"><div><p className="admin-section-number">02 / CATALOGUE</p><h2>Tous les<br /><em>biens.</em></h2></div><p>Publiés, brouillons et archivés : un bien archivé quitte la sélection publique sans être supprimé.</p></div>
    {error ? <AdminError message={error} /> : loading ? <AdminLoading label="Chargement des biens…" /> : <>
      <Toolbar search={search} onSearch={setSearch} placeholder="Titre, lieu, propriétaire…" filter={filter} onFilter={onFilter} options={[["", "Tous les biens"], ["published", "Publiés"], ["draft", "Brouillons"], ["archived", "Archivés"], ["Vente", "À vendre"], ["Location", "À louer"], ["no-media", "Publiés sans média"], ["no-price", "Publiés sans prix"]]} count={countLabel(shown.length, properties.length, "bien")} onExport={exportCsv} action={<a className="admin-btn" href="/dashboard#biens"><Plus size={15} /> Ajouter un bien</a>} />
      {shown.length === 0 ? <AdminEmpty title={properties.length ? "Aucun bien ne correspond" : "Le catalogue attend sa première adresse"} text={properties.length ? "Essayez un autre terme ou retirez le filtre." : "Chaque bien publié apparaît dans la sélection publique, avec ses consultations et ses demandes."} action={properties.length ? undefined : <a className="admin-btn" href="/dashboard#biens"><Plus size={15} /> Ajouter un bien</a>} /> : <div className="admin-published-grid">{shown.map((property) => <article className="admin-published-card" key={property.id}><div className="admin-published-media"><img src={coverOf(property)} alt={property.title} /><span>{property.media?.length ?? 0} média{property.media?.length === 1 ? "" : "s"}</span></div><div className="admin-published-copy"><div><small>{property.type} <i /> {property.mode} <i /> {STATUS_LABEL[property.status] ?? property.status}</small><strong>{property.title}</strong><p>{property.location}</p></div><b>{property.priceLabel || "Prix non renseigné"}</b><footer>Propriétaire : {property.ownerName || property.ownerEmail || "Compte professionnel"} · {plural(property.views ?? 0, "vue")}</footer><div className="admin-card-actions"><button className="admin-link" onClick={() => setEditing(property)}>Modifier</button><button className="admin-link" disabled={updating} onClick={() => change(property, property.status === "published" ? "archived" : "published")}>{property.status === "published" ? "Archiver" : "Publier"}</button></div></div></article>)}</div>}
      {editing && <PropertyEditor property={editing} saving={saving} onClose={() => setEditing(null)} onSave={(changes) => onSave(editing.id, changes, () => setEditing(null))} />}
    </>}
  </div>;
}

/* --------------------------------- Demandes --------------------------------- */

const INQUIRY_LABEL: Record<InquiryStatus, string> = { new: "Nouvelle", contacted: "Contactée", closed: "Clôturée" };

function InquiriesView({ inquiries, loading, error, filter, onFilter, updating, onStatus }: { inquiries: InquiryRow[]; loading: boolean; error?: string; filter: string; onFilter: (value: string) => void; updating: boolean; onStatus: (id: string, status: InquiryStatus) => void }) {
  const [search, setSearch] = useState("");
  const shown = useMemo(() => inquiries.filter((item) => (!filter || item.status === filter) && matches(search, [item.senderName, item.senderEmail, item.senderPhone, item.propertyTitle, item.message])), [inquiries, filter, search]);

  const exportCsv = () => downloadCsv("kaba-demandes", ["Nom", "Email", "Téléphone", "Bien", "Lieu", "Message", "Statut", "Reçue le"],
    shown.map((item) => [item.senderName, item.senderEmail, item.senderPhone, item.propertyTitle, item.propertyLocation, item.message, INQUIRY_LABEL[item.status], new Date(item.createdAt)]));

  return <div className="admin-content"><div className="admin-view-intro"><div><p className="admin-section-number">03 / RELATION</p><h2>Demandes<br /><em>reçues.</em></h2></div><p>Suivez les demandes envoyées par les visiteurs et accompagnez leur traitement.</p></div>
    {error ? <AdminError message={error} /> : loading ? <AdminLoading label="Chargement des demandes…" /> : <>
      <Toolbar search={search} onSearch={setSearch} placeholder="Nom, email, bien, message…" filter={filter} onFilter={onFilter} options={[["", "Toutes les demandes"], ["new", "Nouvelles"], ["contacted", "Contactées"], ["closed", "Clôturées"]]} count={countLabel(shown.length, inquiries.length, "demande")} onExport={exportCsv} />
      {shown.length === 0 ? <AdminEmpty title={inquiries.length ? "Aucune demande ne correspond" : "Aucune demande"} text={inquiries.length ? "Essayez un autre terme ou retirez le filtre." : "Les demandes de contact apparaîtront ici depuis les biens publiés."} /> : <div className="admin-inquiries">{shown.map((item) => <article className="admin-inquiry" key={item.id}><span className="admin-user-avatar">{item.senderName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><div><div className="admin-inquiry-top"><strong>{item.senderName}</strong><span className={`admin-inquiry-status ${item.status}`}>{INQUIRY_LABEL[item.status]}</span></div><small>{item.senderEmail || item.senderPhone || "Coordonnée non renseignée"} · {shortDate(item.createdAt)}</small><p>{item.message || "Demande de renseignements"}</p><footer>{item.propertyTitle || "Bien non identifié"}{item.propertyLocation ? ` · ${item.propertyLocation}` : ""}</footer></div><div className="admin-inquiry-actions">{item.status === "new" && <button disabled={updating} onClick={() => onStatus(item.id, "contacted")}>Marquer contactée</button>}{item.status === "contacted" && <button disabled={updating} onClick={() => onStatus(item.id, "closed")}>Clôturer</button>}{item.status === "closed" && <button disabled={updating} onClick={() => onStatus(item.id, "new")}>Rouvrir</button>}</div></article>)}</div>}
    </>}
  </div>;
}

function AdminLoading({ label }: { label: string }) { return <div className="admin-state-panel"><span className="admin-loading-dot" />{label}</div>; }
function AdminEmpty({ title, text, action }: { title: string; text: string; action?: ReactNode }) { return <div className="admin-state-panel"><strong>{title}</strong><span>{text}</span>{action && <div className="admin-empty-action">{action}</div>}</div>; }
function AdminError({ message }: { message: string }) { return <div className="admin-state-panel is-error"><strong>Impossible de charger cette rubrique.</strong><span>{message}</span></div>; }
