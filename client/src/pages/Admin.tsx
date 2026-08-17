import { useEffect } from "react";
import { ArrowLeft, BarChart3, Building2, FileText, LogOut, ShieldCheck, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export default function Admin() {
  const [, navigate] = useLocation();
  const { user, loading, logout } = useAuth();
  const stats = trpc.admin.stats.useQuery(undefined, { enabled: user?.role === "admin" });
  const recentUsers = trpc.admin.recentUsers.useQuery(undefined, { enabled: user?.role === "admin" });

  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/login");
    else if (user.role !== "admin") navigate("/dashboard");
  }, [loading, user, navigate]);

  if (loading || !user || user.role !== "admin") return <div className="dashboard-loading">Vérification des droits administrateur…</div>;
  const data = stats.data;
  const statCards = [
    { label: "Utilisateurs", value: data?.usersCount ?? 0, Icon: Users },
    { label: "Biens enregistrés", value: data?.propertiesCount ?? 0, Icon: Building2 },
    { label: "Biens publiés", value: data?.publishedCount ?? 0, Icon: BarChart3 },
    { label: "Demandes reçues", value: data?.inquiriesCount ?? 0, Icon: FileText },
  ];

  return <main className="admin-shell">
    <aside className="admin-sidebar">
      <Link href="/" className="admin-brand"><img src="/manus-storage/icon-kaba_e91dc42c.png" alt="Kaba" /><span>Kaba</span><small>ADMINISTRATION</small></Link>
      <div className="admin-sidebar-label">CONTRÔLE</div>
      <nav className="admin-nav"><a className="is-active" href="#overview"><BarChart3 size={17} /> Vue d’ensemble</a><a href="#users"><Users size={17} /> Utilisateurs</a><a href="#properties"><Building2 size={17} /> Biens publiés</a><a href="#inquiries"><FileText size={17} /> Demandes</a></nav>
      <div className="admin-sidebar-bottom"><Link href="/dashboard"><ArrowLeft size={16} /> Espace professionnel</Link><button onClick={() => logout().then(() => navigate("/login"))}><LogOut size={16} /> Déconnexion</button></div>
    </aside>
    <section className="admin-main" id="overview">
      <header className="admin-header"><div><p className="admin-kicker"><ShieldCheck size={15} /> Accès administrateur</p><h1>Console Kaba</h1><p>Supervision de la plateforme immobilière.</p></div><div className="admin-identity"><span>{(user.name || user.email || "A").slice(0, 1).toUpperCase()}</span><div><strong>{user.name || "Administrateur"}</strong><small>{user.email}</small></div></div></header>
      <div className="admin-grid">{statCards.map(({ label, value, Icon }) => <article className="admin-stat" key={label}><Icon size={18} /><span>{label}</span><strong>{stats.isLoading ? "—" : value}</strong><small>Données en direct</small></article>)}</div>
      <section className="admin-panel" id="users"><div className="admin-panel-head"><div><p className="admin-section-number">01 / COMPTES</p><h2>Utilisateurs récents</h2></div><span>{recentUsers.data?.length ?? 0} affichés</span></div>{recentUsers.isLoading ? <p className="admin-empty">Chargement des utilisateurs…</p> : recentUsers.data?.length ? <div className="admin-users">{recentUsers.data.map((item) => <div className="admin-user-row" key={item.openId || item.email}><span className="admin-user-avatar">{(item.name || item.email || "?").slice(0, 1).toUpperCase()}</span><div><strong>{item.name || "Profil incomplet"}</strong><small>{item.email || item.openId}</small></div><span className={`admin-role ${item.role === "admin" ? "is-admin" : ""}`}>{item.role === "admin" ? "Admin" : item.profile || "Professionnel"}</span></div>)}</div> : <p className="admin-empty">Aucun utilisateur enregistré.</p>}</section>
      <section className="admin-panel" id="properties"><div className="admin-panel-head"><div><p className="admin-section-number">02 / ACTIVITÉ</p><h2>Biens publiés</h2></div><Link href="/selection">Voir la sélection <ArrowLeft size={14} /></Link></div><p className="admin-description">La sélection publique est alimentée par les biens validés et publiés par les professionnels Kaba.</p></section>
    </section>
  </main>;
}
