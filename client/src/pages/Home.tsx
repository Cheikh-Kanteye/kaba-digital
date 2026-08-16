// Direction artistique Kaba : maison d’édition africaine, éditoriale, chaleureuse et précise.
// Ce fichier privilégie les grandes respirations, les repères typographiques et des interactions discrètes.

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, Menu, Pause, Play, Search, SlidersHorizontal, X } from "lucide-react";

const heroImage = "/manus-storage/kaba-hero-dakar_28cefd79.jpg";
const monogram = "/manus-storage/kaba-monogram_e6015d22.png";

const properties = [
  {
    number: "01",
    type: "Maison",
    title: "Une adresse ouverte sur le calme",
    location: "Sicap Amitié 3 · Dakar",
    price: "110 000 000 FCFA",
    image: "/manus-storage/kaba-property-ngor_3d2ef10e.jpg",
    tag: "Sélection Kaba",
    media: ["/manus-storage/kaba-property-ngor_3d2ef10e.jpg", heroImage, "/manus-storage/kaba-land-dakar_98970f8e.jpg"],
    video: "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4",
  },
  {
    number: "02",
    type: "Appartement",
    title: "Lumière douce, volumes justes",
    location: "Almadies · Dakar",
    price: "250 000 FCFA / mois",
    image: "/manus-storage/kaba-property-almadies_64bab9ed.jpg",
    tag: "À découvrir",
    media: ["/manus-storage/kaba-property-almadies_64bab9ed.jpg", "/manus-storage/kaba-property-ngor_3d2ef10e.jpg", heroImage],
    video: "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4",
  },
  {
    number: "03",
    type: "Terrain",
    title: "Un horizon à construire",
    location: "Lac Rose · Sénégal",
    price: "Sur demande",
    image: "/manus-storage/kaba-land-dakar_98970f8e.jpg",
    tag: "Projet & investissement",
    media: ["/manus-storage/kaba-land-dakar_98970f8e.jpg", heroImage, "/manus-storage/kaba-property-ngor_3d2ef10e.jpg"],
    video: "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4",
  },
];

const services = [
  { index: "01", title: "Trouver", text: "Des biens sélectionnés pour leur emplacement, leur caractère et leur potentiel." },
  { index: "02", title: "Comprendre", text: "Une lecture claire du marché, des quartiers et des décisions qui comptent." },
  { index: "03", title: "Construire", text: "Un accompagnement humain pour avancer de la première visite à la dernière signature." },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [propertyType, setPropertyType] = useState("Tous les biens");
  const [showMore, setShowMore] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeMedia, setActiveMedia] = useState<Record<string, number>>({});
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const resultLabel = useMemo(() => {
    if (!submitted) return "Explorer la sélection";
    return query ? `Résultats pour ${query}` : "Sélection mise à jour";
  }, [query, submitted]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    document.getElementById("selection")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main className="kaba-site">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Kaba, retour à l'accueil">
          <img src={monogram} alt="" />
          <span>Kaba</span>
        </a>
        <div className="header-place">DAKAR <span>/</span> SÉNÉGAL</div>
        <nav className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="Navigation principale">
          <a href="/selection" onClick={() => setMenuOpen(false)}>La sélection</a>
          <a href="#approche" onClick={() => setMenuOpen(false)}>Notre approche</a>
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Parlons-nous</a>
        </nav>
        <div className="header-actions">
          <a className="text-link" href="/login">Accès membre <ArrowUpRight size={15} /></a><a className="text-link" href="/selection">Déposer un bien <ArrowUpRight size={15} /></a>
          <button className="menu-toggle" aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-image" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="eyebrow light"><span>01</span> La sélection Kaba</p>
          <h1>Des adresses<br /><em>qui restent.</em></h1>
          <p className="hero-intro">Une nouvelle manière de regarder l’immobilier au Sénégal. Des lieux choisis avec attention, pour les vies qui s’y inventent.</p>
          <a className="hero-link" href="/selection">Explorer la sélection <ArrowUpRight size={17} /></a>
        </div>
        <div className="hero-meta"><span>© 2026 KABA</span><span>SCROLL TO DISCOVER <span className="scroll-line" /></span></div>
      </section>

      <div className="senegal-transition" aria-hidden="true"><span className="senegal-green" /><span className="senegal-yellow"><i /></span><span className="senegal-red" /></div>

      <section className="search-band" aria-label="Rechercher un bien">
        <div className="section-kicker"><span>02</span><span>Votre recherche</span></div>
        <div className="search-copy"><h2>Commencer<br /><em>par un lieu.</em></h2><p>Quelques repères suffisent. Nous vous aiderons à trouver le reste.</p></div>
        <form className="search-form" onSubmit={handleSearch}>
          <label><span>Où souhaitez-vous vivre ?</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Quartier, ville ou région" /></label>
          <label><span>Je cherche</span><select value={propertyType} onChange={(event) => setPropertyType(event.target.value)}><option>Tous les biens</option><option>Une maison</option><option>Un appartement</option><option>Un terrain</option></select><ChevronDown size={17} /></label>
          <button type="submit" className="search-button"><Search size={18} /> <span>Rechercher</span></button>
        </form>
      </section>

      <section className="selection-section" id="selection">
        <div className="section-heading"><div><p className="eyebrow"><span>03</span> Le choix du moment</p><h2>La sélection<br /><em>Kaba.</em></h2></div><p className="section-note">Des biens singuliers, regardés au-delà de leur surface. Pour leur lumière, leur adresse et ce qu’ils rendent possible.</p></div>
        <div className="property-grid">
          {properties.map((property) => (
            <article className="property-card" key={property.number}>
              {(() => {
                const mediaIndex = activeMedia[property.number] ?? 0;
                const isVideo = mediaIndex === property.media.length;
                const currentImage = property.media[mediaIndex] ?? property.media[0];
                return <>
                  <div className={`property-image-wrap ${isVideo ? "is-video" : ""}`}>
                    {isVideo ? <video key={`${property.number}-video`} src={property.video} poster={property.image} controls playsInline muted autoPlay={playingVideo === property.number} onPlay={() => setPlayingVideo(property.number)} onPause={() => setPlayingVideo(null)} /> : <img src={currentImage} alt={`${property.title} — visuel ${mediaIndex + 1}`} />}
                    <span className="property-tag">{property.tag}</span><span className="property-number">{property.number}</span>
                    <span className="media-counter">{isVideo ? "FILM" : `${String(mediaIndex + 1).padStart(2, "0")} / ${String(property.media.length).padStart(2, "0")}`}</span>
                    <div className="media-controls"><button aria-label="Visuel précédent" onClick={() => setActiveMedia((current) => ({ ...current, [property.number]: mediaIndex === 0 ? property.media.length : mediaIndex - 1 }))}><ArrowLeft size={15} /></button><button aria-label="Visuel suivant" onClick={() => setActiveMedia((current) => ({ ...current, [property.number]: mediaIndex === property.media.length ? 0 : mediaIndex + 1 }))}>{isVideo && playingVideo !== property.number ? <Play size={14} /> : isVideo ? <Pause size={14} /> : <ArrowRight size={15} />}</button></div>
                  </div>
                  <div className="property-details"><div className="property-caption"><span className="property-type">{property.type} <span>·</span> {property.location}</span><span className="property-seal">K / SÉLECTION</span></div><h3>{property.title}</h3><p className="property-price">{property.price}</p><p className="property-media-note">{property.media.length} images · 1 film de lieu</p></div>
                </>;
              })()}
            </article>
          ))}
        </div>
        <button className="outline-button" onClick={() => setShowMore(!showMore)}>{showMore ? "Réduire la sélection" : resultLabel} <ArrowUpRight size={17} /></button>
        {showMore && <p className="selection-feedback">La sélection complète sera bientôt disponible. Pour une recherche précise, écrivez-nous directement.</p>}
      </section>

      <section className="approach-section" id="approche">
        <div className="approach-marker"><span>04</span><span>Notre approche</span></div>
        <div className="approach-content"><span className="provenance-seal">KABA / DAKAR — SÉNÉGAL</span><p className="eyebrow light">Pas seulement des mètres carrés.</p><h2>Un lieu n’est jamais<br /><em>juste un lieu.</em></h2><p>Chez Kaba, nous croyons qu’une adresse se choisit avec les yeux, mais aussi avec le temps. Nous rapprochons les bons lieux des bonnes histoires — avec exigence, discrétion et une connaissance intime de Dakar.</p><a className="light-link" href="#contact">Découvrir Kaba <ArrowUpRight size={16} /></a></div>
        <div className="approach-stamp">K<br /><span>HOMES<br />PRESTIGE</span></div>
      </section>

      <section className="services-section" id="services"><div className="services-intro"><p className="eyebrow"><span>05</span> Plus qu’une plateforme</p><h2>Du premier regard<br /><em>à la bonne décision.</em></h2></div><div className="services-list">{services.map((service) => <div className="service-row" key={service.index}><span className="service-index">{service.index}</span><h3>{service.title}</h3><p>{service.text}</p><ArrowUpRight size={18} /></div>)}</div></section>

      <section className="contact-section" id="contact"><div><p className="eyebrow light"><span>06</span> Parlons de votre prochain lieu</p><h2>Une adresse en tête ?<br /><em>Commençons ici.</em></h2></div><a className="contact-button" href="mailto:kaba@gmail.com">Prendre contact <ArrowUpRight size={18} /></a></section>

      <footer className="site-footer"><div className="footer-brand"><img src={monogram} alt="" /><span>Kaba</span><p>L’immobilier, regardé autrement.<br />Dakar · Sénégal</p></div><div className="footer-column"><p className="footer-label">Explorer</p><a href="/selection">La sélection</a><a href="#approche">Notre approche</a><a href="#services">Services</a></div><div className="footer-column"><p className="footer-label">Contact</p><a href="mailto:kaba@gmail.com">kaba@gmail.com</a><a href="tel:+221766418810">+221 76 641 88 10</a><a href="#contact">Instagram ↗</a></div><div className="footer-bottom"><span>© 2026 Kaba, Inc.</span><span>Cité Fadia, Dakar</span><span>Mentions légales</span><span>Données personnelles</span></div></footer>
      <button className="floating-filter" aria-label="Ouvrir les filtres"><SlidersHorizontal size={16} /> Filtres</button>
    </main>
  );
}
