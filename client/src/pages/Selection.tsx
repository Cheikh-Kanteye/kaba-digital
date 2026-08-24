// Direction artistique Kaba : maison d’édition africaine, sélection éditoriale et détails média premium.
// Cette page transforme le catalogue en parcours de découverte, avec filtres simples et fiches de biens.

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bath,
  BedDouble,
  ChevronDown,
  Eye,
  Ruler,
  X,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { formatPropertyAge, phoneDigits } from "@/lib/propertyPresentation";

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

const filters = [
  "Tous les biens",
  "Maisons & Villas",
  "Appartements",
  "Terrains",
];

export default function Selection() {
  const [mode, setMode] = useState("Tous");
  const publishedQuery = trpc.kaba.publishedProperties.useQuery({});
  const catalogue: CatalogProperty[] = (publishedQuery.data ?? []).map(
    (property, index) => ({
      id: property.id,
      number: String(index + 1).padStart(2, "0"),
      type: property.type,
      mode: property.mode,
      title: property.title,
      location: property.location,
      price: property.priceLabel,
      image:
        property.media.find(item => item.kind === "image")?.url ||
        property.media[0]?.url ||
        "",
      images: property.media
        .filter(item => item.kind === "image")
        .map(item => item.url).length
        ? property.media
            .filter(item => item.kind === "image")
            .map(item => item.url)
        : [property.media[0]?.url || ""],
      video: property.media.find(item => item.kind === "video")?.url || "",
      description:
        property.description ||
        "Une adresse publiée par un professionnel Kaba.",
      isNew: property.isNew,
      views: property.views,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      kitchens: property.kitchens,
      surface: property.surface,
      listedAt: property.listedAt,
      createdAt: property.createdAt,
      owner: property.ownerSnapshot,
    })
  );
  const [type, setType] = useState("Tous les biens");
  const [selected, setSelected] = useState<CatalogProperty | null>(null);
  const [media, setMedia] = useState<Record<string, number>>({});

  useEffect(() => {
    const hash = window.location.hash.replace(/^#property-/, "");
    if (!hash) return;
    const property = catalogue.find(
      item => item.id === decodeURIComponent(hash)
    );
    if (property) setSelected(property);
  }, [catalogue]);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const createInquiry = trpc.kaba.createInquiry.useMutation();
  const submitInquiry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;
    createInquiry.mutate(
      {
        propertyId: selected.id,
        senderName: inquiryName,
        senderEmail: inquiryEmail || undefined,
        message: inquiryMessage || undefined,
      },
      {
        onSuccess: () => {
          setInquiryName("");
          setInquiryEmail("");
          setInquiryMessage("");
        },
      }
    );
  };

  const visibleProperties = useMemo(
    () =>
      catalogue.filter(property => {
        const modeMatch = mode === "Tous" || property.mode === mode;
        const typeMatch =
          type === "Tous les biens" ||
          (type === "Maisons & Villas" &&
            ["Maison", "Villa"].includes(property.type)) ||
          property.type === type.replace("s", "");
        return modeMatch && typeMatch;
      }),
    [catalogue, mode, type]
  );

  return (
    <main className="selection-page">
      <header className="selection-hero">
        <div className="selection-hero-top">
          <Link href="/" className="back-link">
            ← Kaba
          </Link>
          <span>DAKAR / SÉNÉGAL</span>
        </div>
        <div className="selection-hero-copy">
          <p className="eyebrow">
            <span>07</span> La sélection
          </p>
          <h1>
            Des lieux à<br />
            <em>regarder.</em>
          </h1>
          <p>
            Une collection mouvante de maisons, d’appartements et de terrains
            choisis pour leur adresse, leur lumière et leur potentiel.
          </p>
        </div>
      </header>
      <div className="senegal-transition" aria-hidden="true">
        <span className="senegal-green" />
        <span className="senegal-yellow">
          <i />
        </span>
        <span className="senegal-red" />
      </div>
      <section className="selection-catalogue">
        <div className="catalogue-top">
          <div>
            <p className="eyebrow">
              <span>08</span> Le catalogue
            </p>
            <h2>
              Choisir
              <br />
              <em>son rythme.</em>
            </h2>
          </div>
          <p className="catalogue-note">
            Chaque propriété est présentée avec ses images, son film et les
            repères essentiels pour décider avec calme.
          </p>
        </div>
        <div className="catalogue-filters">
          <div className="filter-tabs">
            {["Tous", "Vente", "Location"].map(item => (
              <button
                className={mode === item ? "is-active" : ""}
                onClick={() => setMode(item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
          <label>
            <span>Type de bien</span>
            <select
              value={type}
              onChange={event => setType(event.target.value)}
            >
              {filters.map(item => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <ChevronDown size={15} />
          </label>
        </div>
        {publishedQuery.isLoading && (
          <div className="catalogue-empty">La sélection se charge…</div>
        )}
        {publishedQuery.isError && (
          <div className="catalogue-empty">
            La sélection est momentanément indisponible. Réessayez dans quelques
            instants.
          </div>
        )}
        {!publishedQuery.isLoading && !publishedQuery.isError && (
          <div className="catalogue-count">
            {visibleProperties.length} adresses dans la sélection <span>·</span>{" "}
            images & films disponibles
          </div>
        )}
        <div className="catalogue-grid">
          {visibleProperties.map(property => {
            const index = media[property.id] ?? 0;
            const video = index === property.images.length;
            return (
              <article className="catalogue-card" key={property.id}>
                <div className={`catalogue-media ${video ? "is-video" : ""}`}>
                  {video ? (
                    <video
                      src={property.video}
                      poster={property.image}
                      controls
                      playsInline
                    />
                  ) : (
                    <img
                      src={property.images[index]}
                      alt={`${property.title} — visuel ${index + 1}`}
                    />
                  )}
                  <span className="property-tag">Sélection Kaba</span>
                  <span className="catalogue-number">{property.number}</span>
                  <span className="catalogue-media-count">
                    {video
                      ? "FILM DE LIEU"
                      : `${String(index + 1).padStart(2, "0")} / 03`}
                  </span>
                  <div className="catalogue-controls">
                    <button
                      aria-label="Visuel précédent"
                      onClick={() =>
                        setMedia(current => ({
                          ...current,
                          [property.id]:
                            index === 0 ? property.images.length : index - 1,
                        }))
                      }
                    >
                      <ArrowLeft size={15} />
                    </button>
                    <button
                      aria-label="Visuel suivant"
                      onClick={() =>
                        setMedia(current => ({
                          ...current,
                          [property.id]:
                            index === property.images.length ? 0 : index + 1,
                        }))
                      }
                    >
                      {index === property.images.length ? (
                        <ArrowRight size={15} />
                      ) : (
                        <ArrowRight size={15} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="catalogue-details">
                  <div className="catalogue-meta">
                    <span>
                      {property.type} · {property.mode}
                    </span>
                    <span>K / SÉLECTION</span>
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
                  <strong>{property.price}</strong>
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
                      <button
                        className="detail-link"
                        onClick={() => setSelected(property)}
                      >
                        Voir la fiche <ArrowUpRight size={15} />
                      </button>
                      {property.owner?.phone && (
                        <a
                          className="card-contact card-contact-icon"
                          href={`tel:${property.owner.phone}`}
                        >
                          Appeler
                        </a>
                      )}
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
        {!publishedQuery.isLoading &&
          !publishedQuery.isError &&
          visibleProperties.length === 0 && (
            <div className="catalogue-empty">
              Aucune adresse ne correspond encore à ces critères. Essayez une
              autre combinaison.
            </div>
          )}
      </section>
      <footer className="selection-footer">
        <Link href="/">
          Retour à l’accueil <ArrowUpRight size={15} />
        </Link>
        <span>Kaba / Immobilier regardé autrement</span>
      </footer>
      {selected && (
        <div className="detail-overlay" role="dialog" aria-modal="true">
          <div className="detail-panel">
            <button
              className="detail-close"
              onClick={() => setSelected(null)}
              aria-label="Fermer"
            >
              <X size={19} />
            </button>
            <img src={selected.image} alt={selected.title} />
            <div className="detail-panel-copy">
              <p className="eyebrow">
                <span>{selected.number}</span> Fiche de lieu
              </p>
              <h2>{selected.title}</h2>
              <p className="detail-location">{selected.location}</p>
              <p className="detail-description">{selected.description}</p>
              <strong>{selected.price}</strong>
              <div className="legacy-property-stats detail-stats">
                {selected.bedrooms !== undefined && (
                  <span>
                    <BedDouble size={14} aria-hidden="true" />{" "}
                    {selected.bedrooms} chambres
                  </span>
                )}
                {selected.bathrooms !== undefined && (
                  <span>
                    <Bath size={14} aria-hidden="true" /> {selected.bathrooms}{" "}
                    salles de bain
                  </span>
                )}
                {selected.kitchens !== undefined && (
                  <span>Cuisine {selected.kitchens}</span>
                )}
                {selected.surface && (
                  <span>
                    <Ruler size={14} aria-hidden="true" /> {selected.surface}
                  </span>
                )}
                {selected.views !== undefined && (
                  <span>
                    <Eye size={14} aria-hidden="true" /> {selected.views} vues
                  </span>
                )}
              </div>
              {selected.owner?.name && (
                <div className="legacy-owner detail-owner">
                  <strong>{selected.owner.name}</strong>
                  {selected.owner.profile && (
                    <span>{selected.owner.profile}</span>
                  )}
                  {selected.owner.phone && (
                    <small>{selected.owner.phone}</small>
                  )}
                </div>
              )}
              <form className="inquiry-form" onSubmit={submitInquiry}>
                <label>
                  Votre nom
                  <input
                    value={inquiryName}
                    onChange={event => setInquiryName(event.target.value)}
                    required
                    placeholder="Nom et prénom"
                  />
                </label>
                <label>
                  Email ou téléphone
                  <input
                    value={inquiryEmail}
                    onChange={event => setInquiryEmail(event.target.value)}
                    placeholder="Pour vous recontacter"
                  />
                </label>
                <label>
                  Votre message
                  <textarea
                    value={inquiryMessage}
                    onChange={event => setInquiryMessage(event.target.value)}
                    placeholder="Je souhaite en savoir plus…"
                  />
                </label>
                <button
                  className="contact-button"
                  type="submit"
                  disabled={createInquiry.isPending}
                >
                  {createInquiry.isPending
                    ? "Envoi…"
                    : "Parler de cette adresse"}{" "}
                  <ArrowUpRight size={16} />
                </button>
                {createInquiry.isSuccess && (
                  <p className="form-success">
                    Votre demande a bien été envoyée.
                  </p>
                )}
                {createInquiry.error && (
                  <p className="form-error">
                    Impossible d’envoyer la demande pour le moment.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
