// Direction artistique Kaba : maison d’édition africaine, sélection éditoriale et détails média premium.
// Cette page transforme le catalogue en parcours de découverte, avec filtres simples et fiches de biens.

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, X } from "lucide-react";
import { Link } from "wouter";

const properties = [
  { id: "01", type: "Maison", mode: "Vente", title: "Une adresse ouverte sur le calme", location: "Sicap Amitié 3 · Dakar", price: "110 000 000 FCFA", image: "/manus-storage/kaba-property-ngor_3d2ef10e.jpg", images: ["/manus-storage/kaba-property-ngor_3d2ef10e.jpg", "/manus-storage/kaba-hero-dakar_28cefd79.jpg", "/manus-storage/kaba-land-dakar_98970f8e.jpg"], video: "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4", description: "Une maison pensée autour de la lumière, des seuils ombragés et d’une vie ouverte sur le jardin." },
  { id: "02", type: "Appartement", mode: "Location", title: "Lumière douce, volumes justes", location: "Almadies · Dakar", price: "250 000 FCFA / mois", image: "/manus-storage/kaba-property-almadies_64bab9ed.jpg", images: ["/manus-storage/kaba-property-almadies_64bab9ed.jpg", "/manus-storage/kaba-property-ngor_3d2ef10e.jpg", "/manus-storage/kaba-hero-dakar_28cefd79.jpg"], video: "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4", description: "Un appartement calme et lumineux, choisi pour ses proportions et sa proximité avec la mer." },
  { id: "03", type: "Terrain", mode: "Vente", title: "Un horizon à construire", location: "Lac Rose · Sénégal", price: "Sur demande", image: "/manus-storage/kaba-land-dakar_98970f8e.jpg", images: ["/manus-storage/kaba-land-dakar_98970f8e.jpg", "/manus-storage/kaba-hero-dakar_28cefd79.jpg", "/manus-storage/kaba-property-ngor_3d2ef10e.jpg"], video: "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4", description: "Un terrain ouvert sur le paysage, pour un projet résidentiel ou une adresse d’exception." },
  { id: "04", type: "Villa", mode: "Location", title: "Le patio comme pièce centrale", location: "Ngor · Dakar", price: "1 200 000 FCFA / mois", image: "/manus-storage/kaba-hero-dakar_28cefd79.jpg", images: ["/manus-storage/kaba-hero-dakar_28cefd79.jpg", "/manus-storage/kaba-property-almadies_64bab9ed.jpg", "/manus-storage/kaba-land-dakar_98970f8e.jpg"], video: "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4", description: "Une villa généreuse, organisée autour d’un patio planté et de pièces qui respirent." },
];

const filters = ["Tous les biens", "Maisons & Villas", "Appartements", "Terrains"];

export default function Selection() {
  const [mode, setMode] = useState("Tous");
  const [type, setType] = useState("Tous les biens");
  const [selected, setSelected] = useState<(typeof properties)[number] | null>(null);
  const [media, setMedia] = useState<Record<string, number>>({});

  const visibleProperties = useMemo(() => properties.filter((property) => {
    const modeMatch = mode === "Tous" || property.mode === mode;
    const typeMatch = type === "Tous les biens" || (type === "Maisons & Villas" && ["Maison", "Villa"].includes(property.type)) || property.type === type.replace("s", "");
    return modeMatch && typeMatch;
  }), [mode, type]);

  return <main className="selection-page">
    <header className="selection-hero"><div className="selection-hero-top"><Link href="/" className="back-link">← Kaba</Link><span>DAKAR / SÉNÉGAL</span></div><div className="selection-hero-copy"><p className="eyebrow"><span>07</span> La sélection</p><h1>Des lieux à<br /><em>regarder.</em></h1><p>Une collection mouvante de maisons, d’appartements et de terrains choisis pour leur adresse, leur lumière et leur potentiel.</p></div></header>
    <div className="senegal-transition" aria-hidden="true"><span className="senegal-green" /><span className="senegal-yellow"><i /></span><span className="senegal-red" /></div>
    <section className="selection-catalogue"><div className="catalogue-top"><div><p className="eyebrow"><span>08</span> Le catalogue</p><h2>Choisir<br /><em>son rythme.</em></h2></div><p className="catalogue-note">Chaque propriété est présentée avec ses images, son film et les repères essentiels pour décider avec calme.</p></div>
      <div className="catalogue-filters"><div className="filter-tabs">{["Tous", "Vente", "Location"].map((item) => <button className={mode === item ? "is-active" : ""} onClick={() => setMode(item)} key={item}>{item}</button>)}</div><label><span>Type de bien</span><select value={type} onChange={(event) => setType(event.target.value)}>{filters.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={15} /></label></div>
      <div className="catalogue-count">{visibleProperties.length} adresses dans la sélection <span>·</span> images & films disponibles</div>
      <div className="catalogue-grid">{visibleProperties.map((property) => { const index = media[property.id] ?? 0; const video = index === property.images.length; return <article className="catalogue-card" key={property.id}><div className={`catalogue-media ${video ? "is-video" : ""}`}>{video ? <video src={property.video} poster={property.image} controls playsInline /> : <img src={property.images[index]} alt={`${property.title} — visuel ${index + 1}`} />}<span className="catalogue-number">{property.id}</span><span className="catalogue-media-count">{video ? "FILM DE LIEU" : `${String(index + 1).padStart(2, "0")} / 03`}</span><div className="catalogue-controls"><button aria-label="Visuel précédent" onClick={() => setMedia((current) => ({ ...current, [property.id]: index === 0 ? property.images.length : index - 1 }))}><ArrowLeft size={15} /></button><button aria-label="Visuel suivant" onClick={() => setMedia((current) => ({ ...current, [property.id]: index === property.images.length ? 0 : index + 1 }))}>{index === property.images.length ? <ArrowRight size={15} /> : <ArrowRight size={15} />}</button></div></div><div className="catalogue-details"><div className="catalogue-meta"><span>{property.type} · {property.mode}</span><span>K / SÉLECTION</span></div><h3>{property.title}</h3><p>{property.location}</p><strong>{property.price}</strong><button className="detail-link" onClick={() => setSelected(property)}>Voir la fiche <ArrowUpRight size={15} /></button></div></article>; })}</div>
      {visibleProperties.length === 0 && <div className="catalogue-empty">Aucune adresse ne correspond encore à ces critères. Essayez une autre combinaison.</div>}
    </section>
    <footer className="selection-footer"><Link href="/">Retour à l’accueil <ArrowUpRight size={15} /></Link><span>Kaba / Immobilier regardé autrement</span></footer>
    {selected && <div className="detail-overlay" role="dialog" aria-modal="true"><div className="detail-panel"><button className="detail-close" onClick={() => setSelected(null)} aria-label="Fermer"><X size={19} /></button><img src={selected.image} alt={selected.title} /><div className="detail-panel-copy"><p className="eyebrow"><span>{selected.id}</span> Fiche de lieu</p><h2>{selected.title}</h2><p className="detail-location">{selected.location}</p><p className="detail-description">{selected.description}</p><strong>{selected.price}</strong><a href="mailto:kaba@gmail.com" className="contact-button">Parler de cette adresse <ArrowUpRight size={16} /></a></div></div></div>}
  </main>;
}
