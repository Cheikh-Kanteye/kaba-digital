import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BarChart3, Building2, FileText, LogOut, ShieldCheck, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

type AdminSection = "Vue d’ensemble" | "Utilisateurs" | "Biens publiés" | "Demandes";

const navigation: Array<{ label: AdminSection; Icon: typeof Users }> = [
  { label: "Vue d’ensemble", Icon: BarChart3 },
  { label: "Utilisateurs", Icon: Users },
  { label: "Biens publiés", Icon: Building2 },
  { label: "Demandes", Icon: FileText },
];

export default function Admin() {
  const [location, navigate] = useLocation();
  const { user, loading, logout } = useAuth();
  const [active, setActive] = useState<AdminSection>(sectionFromPath(location));
  const stats = trpc.admin.stats.useQuery(undefined, { enabled: user?.role === "admin" });
  const users = trpc.admin.allUsers.useQuery(undefined, { enabled: user?.role === "admin" });
  const properties = trpc.admin.publishedProperties.useQuery(undefined, { enabled: user?.role === "admin" });
  const inquiries = trpc.admin.inquiries.useQuery(undefined, { enabled: user?.role === "admin" });
  const utils = trpc.useUtils();
  const updateInquiryStatus = trpc.admin.updateInquiryStatus.useMutation({ onSuccess: () => utils.admin.inquiries.invalidate() });

  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/login");
    else if (user.role !== "admin") navigate("/dashboard");
  }, [loading, user, navigate]);

  useEffect(() => {
    setActive(sectionFromPath(location));
  }, [location]);

  const selectSection = (section: AdminSection) => {
    const path = section === "Vue d’ensemble" ? "/admin" : section === "Utilisateurs" ? "/admin/users" : section === "Biens publiés" ? "/admin/properties" : "/admin/inquiries";
    navigate(path);
  };

  if (loading || !user || user.role !== "admin") return <div className="dashboard-loading">Vérification des droits administrateur…</div>;

  const data = stats.data;
  const statCards = [
    { label: "Utilisateurs", value: data?.usersCount ?? 0, Icon: Users, section: "Utilisateurs" as AdminSection },
    { label: "Biens enregistrés", value: data?.propertiesCount ?? 0, Icon: Building2, section: "Biens publiés" as AdminSection },
    { label: "Biens publiés", value: data?.publishedCount ?? 0, Icon: BarChart3, section: "Biens publiés" as AdminSection },
    { label: "Demandes reçues", value: data?.inquiriesCount ?? 0, Icon: FileText, section: "Demandes" as AdminSection },
  ];

  return <main className="admin-shell">
    <aside className="admin-sidebar">
      <Link href="/" className="admin-brand"><img src="/manus-storage/icon-kaba_e91dc42c.png" alt="Kaba" /><span>Kaba</span><small>ADMINISTRATION</small></Link>
      <div className="admin-sidebar-label">CONTRÔLE</div>
      <nav className="admin-nav" aria-label="Navigation administration">{navigation.map(({ label, Icon }) => <button key={label} className={active === label ? "is-active" : ""} onClick={() => selectSection(label)}><Icon size={17} /> {label}</button>)}</nav>
      <div className="admin-sidebar-bottom"><Link href="/dashboard"><ArrowLeft size={16} /> Espace professionnel</Link><button onClick={() => logout().then(() => navigate("/login"))}><LogOut size={16} /> Déconnexion</button></div>
    </aside>
    <section className="admin-main">
      <header className="admin-header"><div><p className="admin-kicker"><ShieldCheck size={15} /> Accès administrateur</p><h1>{active}</h1><p>{active === "Vue d’ensemble" ? "Supervision de la plateforme immobilière." : `Gestion dédiée : ${active.toLowerCase()}.`}</p></div><div className="admin-identity"><span>{(user.name || user.email || "A").slice(0, 1).toUpperCase()}</span><div><strong>{user.name || "Administrateur"}</strong><small>{user.email}</small></div></div></header>
      {active === "Vue d’ensemble" && <Overview stats={stats} statCards={statCards} onNavigate={selectSection} />}
      {active === "Utilisateurs" && <UsersView users={users.data ?? []} loading={users.isLoading} error={users.error?.message} />}
      {active === "Biens publiés" && <PropertiesView properties={properties.data ?? []} loading={properties.isLoading} error={properties.error?.message} />}
      {active === "Demandes" && <InquiriesView inquiries={inquiries.data ?? []} loading={inquiries.isLoading} error={inquiries.error?.message} updating={updateInquiryStatus.isPending} onStatus={(id, status) => updateInquiryStatus.mutate({ id, status })} />}
    </section>
  </main>;
}

function sectionFromPath(path: string): AdminSection {
  if (path === "/admin/users") return "Utilisateurs";
  if (path === "/admin/properties") return "Biens publiés";
  if (path === "/admin/inquiries") return "Demandes";
  return "Vue d’ensemble";
}

function Overview({ stats, statCards, onNavigate }: { stats: { isLoading: boolean }; statCards: Array<{ label: string; value: number; Icon: typeof Users; section: AdminSection }>; onNavigate: (section: AdminSection) => void }) {
  return <div className="admin-content"><div className="admin-overview-intro"><p className="admin-section-number">00 / PILOTAGE</p><h2>La plateforme,<br /><em>en un regard.</em></h2><p>Choisissez une rubrique pour consulter les données opérationnelles de Kaba.</p></div><div className="admin-grid">{statCards.map(({ label, value, Icon, section }) => <button className="admin-stat" key={label} onClick={() => onNavigate(section)}><Icon size={18} /><span>{label}</span><strong>{stats.isLoading ? "—" : value}</strong><small>Ouvrir la rubrique →</small></button>)}</div><div className="admin-overview-note"><span>CONSOLE ADMIN</span><strong>Les données affichées viennent des collections MongoDB en temps réel.</strong></div></div>;
}

function UsersView({ users, loading, error }: { users: Array<{ openId?: string; email?: string; name?: string; profile?: string; role?: string; city?: string; needsProfile?: boolean }>; loading: boolean; error?: string }) {
  return <div className="admin-content"><div className="admin-view-intro"><div><p className="admin-section-number">01 / COMPTES</p><h2>Tous les<br /><em>utilisateurs.</em></h2></div><p>Profils inscrits, rôles et niveau de complétion disponibles pour la supervision.</p></div>{error ? <AdminError message={error} /> : loading ? <AdminLoading label="Chargement des utilisateurs…" /> : users.length === 0 ? <AdminEmpty title="Aucun utilisateur" text="Les comptes créés apparaîtront ici." /> : <div className="admin-data-table"><div className="admin-data-head"><span>Profil</span><span>Type</span><span>Ville</span><span>État</span></div>{users.map((item) => <div className="admin-data-row" key={item.openId || item.email}><div className="admin-table-person"><span className="admin-user-avatar">{(item.name || item.email || "?").slice(0, 1).toUpperCase()}</span><span><strong>{item.name || "Profil incomplet"}</strong><small>{item.email || item.openId}</small></span></div><span className={`admin-role ${item.role === "admin" ? "is-admin" : ""}`}>{item.role === "admin" ? "Admin" : item.profile || "Professionnel"}</span><span>{item.city || "—"}</span><span className={item.needsProfile ? "admin-state pending" : "admin-state"}>{item.needsProfile ? "À compléter" : "Complet"}</span></div>)}</div>}</div>;
}

function PropertiesView({ properties, loading, error }: { properties: Array<{ id: string; title: string; type: string; mode: string; location: string; priceLabel: string; media?: { kind: string; url: string }[]; ownerName?: string; ownerEmail?: string; updatedAt: Date }>; loading: boolean; error?: string }) {
  return <div className="admin-content"><div className="admin-view-intro"><div><p className="admin-section-number">02 / CATALOGUE</p><h2>Biens<br /><em>publiés.</em></h2></div><p>Les adresses actuellement visibles dans la sélection publique Kaba.</p></div>{error ? <AdminError message={error} /> : loading ? <AdminLoading label="Chargement des biens publiés…" /> : properties.length === 0 ? <AdminEmpty title="Aucun bien publié" text="Les professionnels pourront publier leurs adresses depuis leur espace." /> : <div className="admin-published-grid">{properties.map((property) => <article className="admin-published-card" key={property.id}><div className="admin-published-media"><img src={property.media?.[0]?.url || "/manus-storage/kaba-hero-dakar_28cefd79.jpg"} alt={property.title} /><span>{property.media?.length ?? 0} média{property.media?.length === 1 ? "" : "s"}</span></div><div className="admin-published-copy"><div><small>{property.type} <i /> {property.mode}</small><strong>{property.title}</strong><p>{property.location}</p></div><b>{property.priceLabel}</b><footer>Propriétaire : {property.ownerName || property.ownerEmail || "Compte professionnel"}</footer></div></article>)}</div>}</div>;
}

function InquiriesView({ inquiries, loading, error, updating, onStatus }: { inquiries: Array<{ id: string; senderName: string; senderEmail?: string; senderPhone?: string; message?: string; propertyTitle?: string; propertyLocation?: string; status: "new" | "contacted" | "closed"; createdAt: Date }>; loading: boolean; error?: string; updating: boolean; onStatus: (id: string, status: "new" | "contacted" | "closed") => void }) {
  return <div className="admin-content"><div className="admin-view-intro"><div><p className="admin-section-number">03 / RELATION</p><h2>Demandes<br /><em>reçues.</em></h2></div><p>Suivez les demandes envoyées par les visiteurs et accompagnez leur traitement.</p></div>{error ? <AdminError message={error} /> : loading ? <AdminLoading label="Chargement des demandes…" /> : inquiries.length === 0 ? <AdminEmpty title="Aucune demande" text="Les demandes de contact apparaîtront ici depuis les biens publiés." /> : <div className="admin-inquiries">{inquiries.map((item) => <article className="admin-inquiry" key={item.id}><span className="admin-user-avatar">{item.senderName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><div><div className="admin-inquiry-top"><strong>{item.senderName}</strong><span className={`admin-inquiry-status ${item.status}`}>{item.status === "new" ? "Nouvelle" : item.status === "contacted" ? "Contactée" : "Clôturée"}</span></div><small>{item.senderEmail || item.senderPhone || "Coordonnée non renseignée"}</small><p>{item.message || "Demande de renseignements"}</p><footer>{item.propertyTitle || "Bien non identifié"}{item.propertyLocation ? ` · ${item.propertyLocation}` : ""}</footer></div><div className="admin-inquiry-actions">{item.status === "new" && <button disabled={updating} onClick={() => onStatus(item.id, "contacted")}>Marquer contactée</button>}{item.status === "contacted" && <button disabled={updating} onClick={() => onStatus(item.id, "closed")}>Clôturer</button>}{item.status === "closed" && <button disabled={updating} onClick={() => onStatus(item.id, "new")}>Rouvrir</button>}</div></article>)}</div>}</div>;
}

function AdminLoading({ label }: { label: string }) { return <div className="admin-state-panel"><span className="admin-loading-dot" />{label}</div>; }
function AdminEmpty({ title, text }: { title: string; text: string }) { return <div className="admin-state-panel"><strong>{title}</strong><span>{text}</span></div>; }
function AdminError({ message }: { message: string }) { return <div className="admin-state-panel is-error"><strong>Impossible de charger cette rubrique.</strong><span>{message}</span></div>; }
