// Accueil Kaba : structure éditoriale transposée depuis la maquette statique.
// Les cartes restent alimentées par MongoDB via tRPC ; aucun contenu utilisateur n’est simulé.

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bath,
  BedDouble,
  ChevronDown,
  Eye,
  Menu,
  Ruler,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { matchesHomeFilters } from "@/lib/homeFilters";
import { formatPropertyAge, phoneDigits } from "@/lib/propertyPresentation";

const heroImage = "/manus-storage/villa-hero-poster_5d277896.jpg";
const heroVideo = "/manus-storage/villa-background_26114bab.mp4";
const monogram = "/assets/kaba/icon-kaba.webp";
const headerLogo = "/assets/kaba/header-kaba-transparent.webp";

type HomeProperty = {
  id: string;
  number: string;
  type: string;
  mode: string;
  title: string;
  description?: string;
  location: string;
  price: string;
  image: string;
  images: string[];
  video: string;
  isNew?: boolean;
  views?: number;
  bedrooms?: number;
  bathrooms?: number;
  kitchens?: number;
  surface?: string;
  listedAt?: Date;
  createdAt?: Date;
  owner?: {
    name?: string;
    profile?: string;
    phone?: string;
    whatsapp?: string;
    avatarUrl?: string;
  };
};

const services = [
  {
    index: "01",
    title: "Trouver",
    text: "Des biens sélectionnés pour leur emplacement, leur caractère et leur potentiel.",
  },
  {
    index: "02",
    title: "Comprendre",
    text: "Une lecture claire du marché, des quartiers et des décisions qui comptent.",
  },
  {
    index: "03",
    title: "Construire",
    text: "Un accompagnement humain pour avancer de la première visite à la dernière signature.",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [propertyType, setPropertyType] = useState("Tous les biens");
  const [priceRange, setPriceRange] = useState("Tous les budgets");
  const [mode, setMode] = useState("Tous les modes");
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<"Biens" | "Terrains">("Biens");
  const [showMore, setShowMore] = useState(false);
  const [activeMedia, setActiveMedia] = useState<Record<string, number>>({});
  const publishedQuery = trpc.kaba.publishedProperties.useQuery({});

  const catalogue = useMemo<HomeProperty[]>(
    () =>
      (publishedQuery.data ?? []).map((property, index) => {
        const images = property.media
          .filter(item => item.kind === "image")
          .map(item => item.url);
        const image = images[0] || heroImage;
        return {
          id: property.id,
          number: String(index + 1).padStart(2, "0"),
          type: property.type,
          mode: property.mode,
          title: property.title,
          description: property.description,
          location: property.location,
          price: property.priceLabel,
          image,
          images: images.length ? images : [image],
          video: property.media.find(item => item.kind === "video")?.url || "",
          isNew: property.isNew,
          views: property.views,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          kitchens: property.kitchens,
          surface: property.surface,
          listedAt: property.listedAt,
          createdAt: property.createdAt,
          owner: property.ownerSnapshot,
        };
      }),
    [publishedQuery.data]
  );

  const filteredProperties = useMemo(
    () =>
      catalogue.filter(property =>
        matchesHomeFilters(property, {
          activeTab,
          mode,
          priceRange,
          propertyType,
          query,
        })
      ),
    [activeTab, catalogue, mode, priceRange, propertyType, query]
  );

  const featuredProperties = showMore
    ? filteredProperties
    : filteredProperties.slice(0, 6);
  const resultLabel = useMemo(() => {
    if (!submitted) return "Explorer la sélection";
    const filters = [
      query && `Résultats pour ${query}`,
      propertyType !== "Tous les biens" && propertyType,
      priceRange !== "Tous les budgets" && priceRange,
      mode !== "Tous les modes" && mode,
    ].filter(Boolean);
    return filters.length ? filters.join(" · ") : "Sélection mise à jour";
  }, [mode, priceRange, propertyType, query, submitted]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    document
      .getElementById("selection")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  function changeMedia(property: HomeProperty, direction: "previous" | "next") {
    const mediaCount = property.images.length + (property.video ? 1 : 0);
    const current = activeMedia[property.id] ?? 0;
    const next = direction === "next" ? current + 1 : current - 1;
    setActiveMedia(state => ({
      ...state,
      [property.id]: next < 0 ? mediaCount - 1 : next >= mediaCount ? 0 : next,
    }));
  }

  return (
    <main className="kaba-site">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Kaba, retour à l'accueil">
          <img className="brand-logo" src={headerLogo} alt="Kaba" />
        </a>
        <div className="header-place">
          DAKAR <span>/</span> SÉNÉGAL
        </div>
        <nav
          className={menuOpen ? "main-nav is-open" : "main-nav"}
          aria-label="Navigation principale"
        >
          <a href="#selection" onClick={() => setMenuOpen(false)}>
            La sélection
          </a>
          <a href="#approche" onClick={() => setMenuOpen(false)}>
            Notre approche
          </a>
          <a href="#services" onClick={() => setMenuOpen(false)}>
            Services
          </a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>
            Parlons-nous
          </a>
        </nav>
        <div className="header-actions">
          <a className="text-link" href="/login">
            Connexion <ArrowUpRight size={15} />
          </a>
          <a className="text-link" href="/register">
            Inscription <ArrowUpRight size={15} />
          </a>
          <button
            className="menu-toggle"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setMenuOpen(open => !open)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div
          className="hero-image"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <video
            src={heroVideo}
            poster={heroImage}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Vidéo d’une adresse Kaba"
          />
        </div>
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="eyebrow light">
            <span>01</span> La sélection Kaba
          </p>
          <h1 id="hero-title">
            Des adresses
            <br />
            <em>qui restent.</em>
          </h1>
          <p className="hero-intro">
            Une nouvelle manière de regarder l’immobilier au Sénégal. Des lieux
            choisis avec attention, pour les vies qui s’y inventent.
          </p>
          <a className="hero-link" href="#selection">
            Explorer la sélection <ArrowUpRight size={17} />
          </a>
        </div>
        <div className="hero-meta" aria-hidden="true">
          <span>© 2026 KABA</span>
          <span>
            SCROLL TO DISCOVER <span className="scroll-line" />
          </span>
        </div>
      </section>

      <div className="senegal-transition" aria-hidden="true">
        <span className="senegal-green" />
        <span className="senegal-yellow">
          <i />
        </span>
        <span className="senegal-red" />
      </div>

      <section
        className="search-band"
        id="recherche"
        aria-labelledby="search-title"
      >
        <div className="section-kicker">
          <span>02</span>
          <span>Votre recherche</span>
        </div>
        <div className="search-copy">
          <h2 id="search-title">
            Commencer
            <br />
            <em>par un lieu.</em>
          </h2>
          <p>
            Quelques repères suffisent. Nous vous aiderons à trouver le reste.
          </p>
        </div>
        <form className="search-form" onSubmit={handleSearch} role="search">
          <label>
            <span>Où souhaitez-vous vivre ?</span>
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Quartier, ville ou région"
              autoComplete="off"
            />
          </label>
          <label>
            <span>Je cherche</span>
            <select
              value={propertyType}
              onChange={event => setPropertyType(event.target.value)}
            >
              <option>Tous les biens</option>
              <option>Une maison</option>
              <option>Un appartement</option>
              <option>Un terrain</option>
            </select>
            <ChevronDown size={17} />
          </label>
          <label>
            <span>Budget</span>
            <select
              value={priceRange}
              onChange={event => setPriceRange(event.target.value)}
            >
              <option>Tous les budgets</option>
              <option>Moins de 100 millions</option>
              <option>100 à 200 millions</option>
              <option>Plus de 200 millions</option>
            </select>
            <ChevronDown size={17} />
          </label>
          <label>
            <span>Mode</span>
            <select
              value={mode}
              onChange={event => setMode(event.target.value)}
            >
              <option>Tous les modes</option>
              <option>Vente</option>
              <option>Location</option>
            </select>
            <ChevronDown size={17} />
          </label>
          <button type="submit" className="search-button">
            <Search size={18} /> <span>Rechercher</span>
          </button>
          {submitted && (
            <span className="search-result" aria-live="polite">
              {resultLabel}
            </span>
          )}
        </form>
      </section>

      <section
        className="selection-section"
        id="selection"
        aria-labelledby="selection-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              <span>03</span> Le choix du moment
            </p>
            <h2 id="selection-title">
              La sélection
              <br />
              <em>Kaba.</em>
            </h2>
          </div>
          <p className="section-note">
            Des biens singuliers, regardés au-delà de leur surface. Pour leur
            lumière, leur adresse et ce qu’ils rendent possible.
          </p>
        </div>
        <div className="home-catalogue-tools">
          <div className="tabs" role="tablist" aria-label="Type de biens">
            <button
              className={activeTab === "Biens" ? "tab active" : "tab"}
              type="button"
              onClick={() => {
                setActiveTab("Biens");
                setShowMore(false);
              }}
            >
              Biens
            </button>
            <button
              className={activeTab === "Terrains" ? "tab active" : "tab"}
              type="button"
              onClick={() => {
                setActiveTab("Terrains");
                setShowMore(false);
              }}
            >
              Terrains
            </button>
          </div>
          <div className="catalogue-intro">
            <div className="section-kicker">
              <span>04</span>
              <span>Les adresses remarquées</span>
            </div>
            <h2>Biens populaires</h2>
          </div>
        </div>
        {publishedQuery.isLoading && (
          <div className="dashboard-empty">La sélection se charge…</div>
        )}
        {publishedQuery.isError && (
          <div className="dashboard-empty">
            La sélection est momentanément indisponible. Réessayez dans quelques
            instants.
          </div>
        )}
        {!publishedQuery.isLoading &&
          !publishedQuery.isError &&
          filteredProperties.length === 0 && (
            <div className="dashboard-empty">
              Aucune adresse ne correspond encore à ces critères.
            </div>
          )}
        <div className="property-grid" aria-live="polite">
          {featuredProperties.map(property => {
            const mediaIndex = activeMedia[property.id] ?? 0;
            const isVideo =
              Boolean(property.video) && mediaIndex === property.images.length;
            const currentImage = property.images[mediaIndex] ?? property.image;
            const mediaTotal =
              property.images.length + (property.video ? 1 : 0);
            return (
              <article className="property-card" key={property.id}>
                <div
                  className={`property-image-wrap ${isVideo ? "is-video" : ""}`}
                >
                  {isVideo ? (
                    <video
                      src={property.video}
                      poster={property.image}
                      controls
                      playsInline
                      muted
                      loop
                      preload="metadata"
                      aria-label={`Film de ${property.title}`}
                    />
                  ) : (
                    <img
                      src={currentImage}
                      alt={`${property.title} — visuel ${mediaIndex + 1}`}
                    />
                  )}
                  <span className="property-tag">Sélection Kaba</span>
                  <span className="property-number">{property.number}</span>
                  <span className="media-counter">
                    {isVideo
                      ? "FILM DE LIEU"
                      : `${String(mediaIndex + 1).padStart(2, "0")} / ${String(mediaTotal).padStart(2, "0")}`}
                  </span>
                  <div className="media-controls">
                    <button
                      type="button"
                      aria-label="Visuel précédent"
                      onClick={() => changeMedia(property, "previous")}
                    >
                      <ArrowLeft size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label="Visuel suivant"
                      onClick={() => changeMedia(property, "next")}
                    >
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
                <div className="property-details">
                  <div className="property-caption">
                    <span className="property-type">
                      {property.type} <span>·</span> {property.mode}
                    </span>
                    <span className="property-seal">K / SÉLECTION</span>
                  </div>
                  <div className="legacy-badges">
                    {property.isNew && (
                      <span className="legacy-badge is-new">Nouveau</span>
                    )}
                    <span className="legacy-badge">{property.type}</span>
                  </div>
                  <h3>{property.title}</h3>
                  <p className="property-location">{property.location}</p>
                  {property.description && (
                    <p className="property-description">
                      {property.description}
                    </p>
                  )}
                  <strong className="property-price">{property.price}</strong>
                  <div className="legacy-property-stats">
                    {property.bedrooms !== undefined && (
                      <span>
                        <BedDouble size={14} aria-hidden="true" />{" "}
                        {property.bedrooms} ch.
                      </span>
                    )}
                    {property.bathrooms !== undefined && (
                      <span>
                        <Bath size={14} aria-hidden="true" />{" "}
                        {property.bathrooms} sdb.
                      </span>
                    )}
                    {property.kitchens !== undefined && (
                      <span>Cuisine {property.kitchens}</span>
                    )}
                    {property.surface && (
                      <span>
                        <Ruler size={14} aria-hidden="true" />{" "}
                        {property.surface}
                      </span>
                    )}
                    <span>
                      <Eye size={14} aria-hidden="true" /> {property.views ?? 0}{" "}
                      vues
                    </span>
                    <span className="property-age">
                      {formatPropertyAge(
                        property.listedAt ?? property.createdAt
                      )}
                    </span>
                  </div>
                  <div className="legacy-owner">
                    <div className="legacy-owner-identity">
                      {property.owner?.avatarUrl ? (
                        <img
                          src={property.owner.avatarUrl}
                          alt=""
                          className="legacy-owner-avatar"
                        />
                      ) : (
                        <span
                          className="legacy-owner-avatar"
                          aria-hidden="true"
                        >
                          {(property.owner?.name || "K")
                            .slice(0, 1)
                            .toUpperCase()}
                        </span>
                      )}
                      <span className="legacy-owner-copy">
                        <strong>{property.owner?.name || "Équipe Kaba"}</strong>
                        <span>
                          {property.owner?.profile || "Professionnel Kaba"}
                        </span>
                        {property.owner?.phone && (
                          <small>{property.owner.phone}</small>
                        )}
                      </span>
                    </div>
                    <div className="legacy-owner-actions">
                      <a
                        className="card-contact"
                        href={`/selection#property-${encodeURIComponent(property.id)}`}
                      >
                        Voir la fiche <ArrowUpRight size={14} />
                      </a>
                      {(property.owner?.whatsapp || property.owner?.phone) && (
                        <a
                          className="card-contact card-contact-icon"
                          href={`https://wa.me/${phoneDigits(property.owner?.whatsapp || property.owner?.phone)}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Contacter ${property.owner.name || "le professionnel"} sur WhatsApp`}
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {filteredProperties.length > 6 && (
          <div className="see-more-container">
            <button
              className="see-more-btn"
              type="button"
              onClick={() => setShowMore(value => !value)}
            >
              {showMore ? "Réduire la sélection" : "Voir plus d’adresses"}
            </button>
          </div>
        )}
        <a className="outline-button" href="/selection">
          Voir la sélection complète <ArrowUpRight size={17} />
        </a>
      </section>

      <section
        className="approach-section"
        id="approche"
        aria-labelledby="approach-title"
      >
        <div className="approach-marker">
          <span>05</span>
          <span>Notre approche</span>
        </div>
        <div className="approach-content">
          <span className="provenance-seal">KABA / DAKAR — SÉNÉGAL</span>
          <p className="eyebrow light">Pas seulement des mètres carrés.</p>
          <h2 id="approach-title">
            Un lieu n’est jamais
            <br />
            <em>juste un lieu.</em>
          </h2>
          <p>
            Chez Kaba, nous croyons qu’une adresse se choisit avec les yeux,
            mais aussi avec le temps. Nous rapprochons les bons lieux des bonnes
            histoires — avec exigence, discrétion et une connaissance intime de
            Dakar.
          </p>
          <a className="light-link" href="#contact">
            Découvrir Kaba <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="approach-stamp">
          K<br />
          <span>
            HOMES
            <br />
            PRESTIGE
          </span>
        </div>
      </section>

      <section
        className="services-section"
        id="services"
        aria-labelledby="services-title"
      >
        <div className="services-intro">
          <p className="eyebrow">
            <span>06</span> Plus qu’une plateforme
          </p>
          <h2 id="services-title">
            Du premier regard
            <br />
            <em>à la bonne décision.</em>
          </h2>
        </div>
        <div className="services-list">
          {services.map(service => (
            <a
              className="service-row"
              href={
                service.index === "01"
                  ? "/selection"
                  : service.index === "02"
                    ? "/register"
                    : "#contact"
              }
              key={service.index}
            >
              <span className="service-index">{service.index}</span>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <ArrowUpRight size={18} />
            </a>
          ))}
        </div>
      </section>

      <section
        className="contact-section"
        id="contact"
        aria-labelledby="contact-title"
      >
        <div>
          <p className="eyebrow light">
            <span>07</span> Parlons de votre prochain lieu
          </p>
          <h2 id="contact-title">
            Une adresse en tête ?<br />
            <em>Commençons ici.</em>
          </h2>
        </div>
        <a className="contact-button" href="mailto:kaba@gmail.com">
          Prendre contact <ArrowUpRight size={18} />
        </a>
      </section>

      <footer className="site-footer">
        <div className="footer-brand">
          <img src={monogram} alt="" />
          <span>Kaba</span>
          <p>
            L’immobilier, regardé autrement.
            <br />
            Dakar · Sénégal
          </p>
        </div>
        <div className="footer-column">
          <p className="footer-label">Explorer</p>
          <a href="#selection">La sélection</a>
          <a href="#approche">Notre approche</a>
          <a href="#services">Services</a>
        </div>
        <div className="footer-column">
          <p className="footer-label">Contact</p>
          <a href="mailto:kaba@gmail.com">kaba@gmail.com</a>
          <a href="tel:+221766418810">+221 76 641 88 10</a>
          <span className="footer-link-muted">
            Instagram — bientôt disponible
          </span>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Kaba, Inc.</span>
          <span>Cité Fadia, Dakar</span>
          <span>Mentions légales</span>
          <span>Données personnelles</span>
        </div>
      </footer>
      <a
        className="floating-filter"
        href="/selection"
        aria-label="Ouvrir la sélection et ses filtres"
      >
        <SlidersHorizontal size={16} /> Filtrer les biens
      </a>
    </main>
  );
}
