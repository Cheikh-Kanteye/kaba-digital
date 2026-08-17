// Direction artistique Kaba : maison d’édition africaine, sélection éditoriale et détails média premium.
// Cette page transforme le catalogue en parcours de découverte, avec filtres simples et fiches de biens.

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, X } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

type CatalogProperty = {
  id: string;
  number: string;
  type: string;
  mode: string;
  title: string;
  location: string;
  price: string;
  image: string;
  images: string[];
  video: string;
  description: string;
};

const filters = ["Tous les biens", "Maisons & Villas", "Appartements", "Terrains"];

export default function Selection() {
  const [mode, setMode] = useState("Tous");
  const publishedQuery = trpc.kaba.publishedProperties.useQuery({});
  const catalogue: CatalogProperty[] = (publishedQuery.data ?? []).map((property, index) => ({
    id: property.id,
    number: String(index + 1).padStart(2, "0"),
    type: property.type,
    mode: property.mode,
    title: property.title,
    location: property.location,
    price: property.priceLabel,
    image: property.media.find((item) => item.kind === "image")?.url || property.media[0]?.url || "",
    images: property.media.filter((item) => item.kind === "image").map((item) => item.url),
    video: property.media.find((item) => item.kind === "video")?.url || "",
    description: "Une adresse publiée par un professionnel Kaba.",
  }));
  const [type, setType] = useState("Tous les biens");
  const [selected, setSelected] = useState<CatalogProperty | null>(null);
  const [media, setMedia] = useState<Record<string, number>>({});
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const createInquiry = trpc.kaba.createInquiry.useMutation();
  const submitInquiry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;
    createInquiry.mutate({ propertyId: selected.id, senderName: inquiryName, senderEmail: inquiryEmail || undefined, message: inquiryMessage || undefined }, {
      onSuccess: () => { setInquiryName(""); setInquiryEmail(""); setInquiryMessage(""); },
    });
  };

  const visibleProperties = useMemo(() => catalogue.filter((property) => {
    const modeMatch = mode === "Tous" || property.mode === mode;
    const typeMatch = type === "Tous les biens" || (type === "Maisons & Villas" && ["Maison", "Villa"].includes(property.type)) || property.type === type.replace("s", "");
    return modeMatch && typeMatch;
  }), [catalogue, mode, type]);

  return <main className="selection-page">
    <header className="selection-hero"><div className="selection-hero-top"><Link href="/" className="back-link">← Kaba</Link><span>DAKAR / SÉNÉGAL</span></div><div className="selection-hero-copy"><p className="eyebrow"><span>07</span> La sélection</p><h1>Des lieux à<br /><em>regarder.</em></h1><p>Une collection mouvante de maisons, d’appartements et de terrains choisis pour leur adresse, leur lumière et leur potentiel.</p></div></header>
    <div className="senegal-transition" aria-hidden="true"><span className="senegal-green" /><span className="senegal-yellow"><i /></span><span className="senegal-red" /></div>
    <section className="selection-catalogue"><div className="catalogue-top"><div><p className="eyebrow"><span>08</span> Le catalogue</p><h2>Choisir<br /><em>son rythme.</em></h2></div><p className="catalogue-note">Chaque propriété est présentée avec ses images, son film et les repères essentiels pour décider avec calme.</p></div>
      <div className="catalogue-filters"><div className="filter-tabs">{["Tous", "Vente", "Location"].map((item) => <button className={mode === item ? "is-active" : ""} onClick={() => setMode(item)} key={item}>{item}</button>)}</div><label><span>Type de bien</span><select value={type} onChange={(event) => setType(event.target.value)}>{filters.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={15} /></label></div>
      {publishedQuery.isLoading && <div className="catalogue-empty">La sélection se charge…</div>}
      {publishedQuery.isError && <div className="catalogue-empty">La sélection est momentanément indisponible. Réessayez dans quelques instants.</div>}
      {!publishedQuery.isLoading && !publishedQuery.isError && <div className="catalogue-count">{visibleProperties.length} adresses dans la sélection <span>·</span> images & films disponibles</div>}
      <div className="catalogue-grid">{visibleProperties.map((property) => { const index = media[property.id] ?? 0; const video = index === property.images.length; return <article className="catalogue-card" key={property.id}><div className={`catalogue-media ${video ? "is-video" : ""}`}>{video ? <video src={property.video} poster={property.image} controls playsInline /> : <img src={property.images[index]} alt={`${property.title} — visuel ${index + 1}`} />}<span className="catalogue-number">{property.number}</span><span className="catalogue-media-count">{video ? "FILM DE LIEU" : `${String(index + 1).padStart(2, "0")} / 03`}</span><div className="catalogue-controls"><button aria-label="Visuel précédent" onClick={() => setMedia((current) => ({ ...current, [property.id]: index === 0 ? property.images.length : index - 1 }))}><ArrowLeft size={15} /></button><button aria-label="Visuel suivant" onClick={() => setMedia((current) => ({ ...current, [property.id]: index === property.images.length ? 0 : index + 1 }))}>{index === property.images.length ? <ArrowRight size={15} /> : <ArrowRight size={15} />}</button></div></div><div className="catalogue-details"><div className="catalogue-meta"><span>{property.type} · {property.mode}</span><span>K / SÉLECTION</span></div><h3>{property.title}</h3><p>{property.location}</p><strong>{property.price}</strong><button className="detail-link" onClick={() => setSelected(property)}>Voir la fiche <ArrowUpRight size={15} /></button></div></article>; })}</div>
      {!publishedQuery.isLoading && !publishedQuery.isError && visibleProperties.length === 0 && <div className="catalogue-empty">Aucune adresse ne correspond encore à ces critères. Essayez une autre combinaison.</div>}
    </section>
    <footer className="selection-footer"><Link href="/">Retour à l’accueil <ArrowUpRight size={15} /></Link><span>Kaba / Immobilier regardé autrement</span></footer>
    {selected && <div className="detail-overlay" role="dialog" aria-modal="true"><div className="detail-panel"><button className="detail-close" onClick={() => setSelected(null)} aria-label="Fermer"><X size={19} /></button><img src={selected.image} alt={selected.title} /><div className="detail-panel-copy"><p className="eyebrow"><span>{selected.number}</span> Fiche de lieu</p><h2>{selected.title}</h2><p className="detail-location">{selected.location}</p><p className="detail-description">{selected.description}</p><strong>{selected.price}</strong><form className="inquiry-form" onSubmit={submitInquiry}><label>Votre nom<input value={inquiryName} onChange={(event) => setInquiryName(event.target.value)} required placeholder="Nom et prénom" /></label><label>Email ou téléphone<input value={inquiryEmail} onChange={(event) => setInquiryEmail(event.target.value)} placeholder="Pour vous recontacter" /></label><label>Votre message<textarea value={inquiryMessage} onChange={(event) => setInquiryMessage(event.target.value)} placeholder="Je souhaite en savoir plus…" /></label><button className="contact-button" type="submit" disabled={createInquiry.isPending}>{createInquiry.isPending ? "Envoi…" : "Parler de cette adresse"} <ArrowUpRight size={16} /></button>{createInquiry.isSuccess && <p className="form-success">Votre demande a bien été envoyée.</p>}{createInquiry.error && <p className="form-error">Impossible d’envoyer la demande pour le moment.</p>}</form></div></div></div>}
  </main>;
}
