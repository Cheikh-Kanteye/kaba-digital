import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  HeartHandshake,
  MapPin,
  Mail,
  Paperclip,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Link } from "wouter";

type Job = {
  id: string;
  department: string;
  title: string;
  location: string;
  contract: string;
  experience: string;
  summary: string;
  description: string;
  responsibilities: string[];
  profile: string[];
  featured?: boolean;
};

const jobs: Job[] = [
  {
    id: "architecte-interieur",
    department: "Immobilier",
    title: "Architecte d'intérieur",
    location: "Dakar · Sénégal",
    contract: "CDD",
    experience: "1 an d'expérience",
    summary: "Imaginez des intérieurs qui donnent envie de rester.",
    description:
      "SIDERA recrute un(e) Architecte d'intérieur pour concevoir des espaces qui conjuguent esthétique, confort et exigence technique. Vous rejoindrez une équipe qui imagine les lieux de demain avec précision et créativité.",
    responsibilities: [
      "Concevoir des concepts d'aménagement et des planches d'ambiance.",
      "Produire des plans 2D/3D, des moodboards et des dossiers techniques.",
      "Suivre les projets de la conception à la livraison avec les équipes partenaires.",
    ],
    profile: [
      "Formation en architecture intérieure ou design d'espace.",
      "Maîtrise d'AutoCAD, SketchUp ou logiciels équivalents.",
      "Œil créatif, sens du détail et aisance à présenter vos idées.",
    ],
    featured: true,
  },
  {
    id: "conseiller-immobilier",
    department: "Commercial",
    title: "Conseiller immobilier",
    location: "Dakar · Sénégal",
    contract: "CDI",
    experience: "2 ans d'expérience",
    summary: "Racontez les bonnes adresses aux bonnes personnes.",
    description:
      "Nous cherchons une personnalité engagée pour accompagner nos clients dans leurs projets de vie et faire découvrir une sélection de biens singuliers à Dakar.",
    responsibilities: [
      "Qualifier les besoins et accompagner les clients pendant leur recherche.",
      "Organiser les visites et assurer un suivi attentif des dossiers.",
      "Développer une relation durable avec les propriétaires et partenaires.",
    ],
    profile: [
      "Expérience commerciale ou immobilière réussie.",
      "Très bonne connaissance de Dakar et de ses quartiers.",
      "Écoute, autonomie et goût pour un service haut de gamme.",
    ],
  },
  {
    id: "charge-contenu",
    department: "Marque & contenu",
    title: "Chargé(e) de contenu",
    location: "Dakar · Sénégal",
    contract: "Stage / CDD",
    experience: "Première expérience appréciée",
    summary: "Donnez une voix aux lieux qui nous inspirent.",
    description:
      "Kaba recherche un profil curieux et sensible aux images pour faire vivre nos biens, nos quartiers et notre regard sur l'immobilier au Sénégal.",
    responsibilities: [
      "Écrire des récits de biens et des contenus pour nos différents canaux.",
      "Coordonner les prises de vue, vidéos et publications.",
      "Suivre les performances et proposer de nouvelles idées éditoriales.",
    ],
    profile: [
      "Très bonne plume en français et sensibilité visuelle.",
      "Curiosité, organisation et envie d'apprendre vite.",
      "Une première expérience en communication est un plus.",
    ],
  },
];

const benefits = [
  {
    icon: HeartHandshake,
    title: "Un métier qui a du sens",
    text: "Nous rapprochons des lieux singuliers et des projets de vie qui leur ressemblent.",
  },
  {
    icon: Sparkles,
    title: "Un regard différent",
    text: "Chaque rôle participe à une marque exigeante, locale et profondément humaine.",
  },
  {
    icon: Users,
    title: "Une équipe qui grandit",
    text: "Vous aurez de la place pour proposer, apprendre et laisser votre empreinte.",
  },
];

function JobMeta({ job }: { job: Job }) {
  return (
    <div className="jobs-card-meta">
      <span>
        <BriefcaseBusiness size={14} /> {job.contract}
      </span>
      <span>
        <MapPin size={14} /> {job.location}
      </span>
      <span>
        <Clock3 size={14} /> {job.experience}
      </span>
    </div>
  );
}

export default function Jobs() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [query, setQuery] = useState("");
  const [applicationSent, setApplicationSent] = useState(false);

  const visibleJobs = jobs.filter(job => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return [job.title, job.department, job.location, job.contract]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });

  useEffect(() => {
    if (!selectedJob) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedJob(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedJob]);

  function openJob(job: Job) {
    setApplicationSent(false);
    setSelectedJob(job);
  }

  function handleApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApplicationSent(true);
  }

  return (
    <main className="jobs-page">
      <header className="jobs-header">
        <Link href="/" className="jobs-back-link">
          <ArrowLeft size={15} /> Kaba
        </Link>
        <div className="jobs-header-center">
          <span>DAKAR</span>
          <i />
          <span>SÉNÉGAL</span>
        </div>
        <Link href="/" className="jobs-header-brand" aria-label="Kaba, accueil">
          <img src="/assets/kaba/header-kaba-transparent.webp" alt="Kaba" />
        </Link>
      </header>

      <section className="jobs-hero" aria-labelledby="jobs-title">
        <div className="jobs-hero-copy">
          <p className="eyebrow light">
            <span>01</span> Rejoindre Kaba
          </p>
          <h1 id="jobs-title">
            Faites partie
            <br />
            <em>de l'histoire.</em>
          </h1>
          <p className="jobs-hero-intro">
            Nous construisons une nouvelle manière de regarder l'immobilier au
            Sénégal. La prochaine belle rencontre pourrait être la vôtre.
          </p>
          <a href="#open-roles" className="jobs-hero-cta">
            Voir les opportunités <ArrowUpRight size={17} />
          </a>
        </div>
        <div className="jobs-hero-aside">
          <span className="jobs-hero-mark">K / 08</span>
          <p>
            Des métiers pour celles et ceux qui aiment les lieux, les gens et le
            travail bien fait.
          </p>
        </div>
        <div className="jobs-hero-foot">
          <span>EMPLOIS / KABA</span>
          <span>DAKAR · 2026</span>
        </div>
      </section>

      <section className="jobs-welcome" aria-labelledby="welcome-title">
        <div className="jobs-section-label">
          <span>02</span>
          <span>Pourquoi Kaba</span>
        </div>
        <div className="jobs-welcome-copy">
          <h2 id="welcome-title">
            Les lieux changent.
            <br />
            <em>Les bonnes équipes aussi.</em>
          </h2>
          <p>
            Chez Kaba, nous ne cherchons pas uniquement des CV. Nous cherchons
            des regards, des attentions et des personnalités capables de rendre
            chaque rencontre plus juste. Rejoignez une équipe à taille humaine,
            ambitieuse et fière de construire depuis Dakar.
          </p>
        </div>
        <div className="jobs-stat-strip" aria-label="Quelques repères Kaba">
          <div>
            <strong>01</strong>
            <span>
              Une équipe
              <br />
              en mouvement
            </span>
          </div>
          <div>
            <strong>04</strong>
            <span>
              Univers métiers
              <br />à explorer
            </span>
          </div>
          <div>
            <strong>∞</strong>
            <span>
              Place pour
              <br />
              vos idées
            </span>
          </div>
        </div>
      </section>

      <section className="jobs-benefits" aria-label="Ce que Kaba propose">
        {benefits.map(({ icon: Icon, title, text }) => (
          <article key={title} className="jobs-benefit-card">
            <div className="jobs-benefit-icon">
              <Icon size={19} />
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section
        className="jobs-openings"
        id="open-roles"
        aria-labelledby="openings-title"
      >
        <div className="jobs-openings-head">
          <div>
            <div className="jobs-section-label">
              <span>03</span>
              <span>Les opportunités</span>
            </div>
            <h2 id="openings-title">
              Trouvez votre
              <br />
              <em>prochaine place.</em>
            </h2>
          </div>
          <div className="jobs-search-wrap">
            <Search size={16} />
            <label htmlFor="jobs-search">Rechercher une offre</label>
            <input
              id="jobs-search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Métier, équipe, contrat…"
            />
          </div>
        </div>

        <div className="jobs-list" aria-live="polite">
          {visibleJobs.map((job, index) => (
            <article
              className={`jobs-card ${job.featured ? "is-featured" : ""}`}
              key={job.id}
            >
              <div className="jobs-card-index">0{index + 1}</div>
              <div className="jobs-card-main">
                <p className="jobs-card-department">{job.department}</p>
                <h3>{job.title}</h3>
                <p className="jobs-card-summary">{job.summary}</p>
                <JobMeta job={job} />
              </div>
              <button
                type="button"
                className="jobs-card-action"
                onClick={() => openJob(job)}
              >
                <span>Voir l'offre</span>
                <ChevronRight size={19} />
              </button>
            </article>
          ))}
          {visibleJobs.length === 0 && (
            <div className="jobs-empty">
              <p>Aucune offre ne correspond à votre recherche.</p>
              <button type="button" onClick={() => setQuery("")}>
                Voir toutes les offres
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="jobs-spontaneous" aria-labelledby="spontaneous-title">
        <div>
          <p className="eyebrow light">
            <span>04</span> Candidature spontanée
          </p>
          <h2 id="spontaneous-title">
            Pas encore la bonne offre ?<br />
            <em>Parlons quand même.</em>
          </h2>
        </div>
        <a
          className="jobs-spontaneous-link"
          href="mailto:jobs@kaba.digital?subject=Candidature spontanée"
        >
          Écrire à l'équipe <Mail size={17} />
        </a>
      </section>

      <footer className="jobs-footer">
        <div className="jobs-footer-brand">
          <img src="/assets/kaba/monogram.webp" alt="" />
          <div>
            <strong>Kaba</strong>
            <span>L'immobilier, regardé autrement.</span>
          </div>
        </div>
        <div className="jobs-footer-links">
          <Link href="/">Accueil</Link>
          <Link href="/selection">La sélection</Link>
          <a href="mailto:kaba@gmail.com">Nous contacter</a>
        </div>
        <p>© 2026 Kaba, Inc. · Dakar, Sénégal</p>
      </footer>

      {selectedJob && (
        <div
          className="job-detail-overlay"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setSelectedJob(null);
          }}
        >
          <section
            className="job-detail-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-detail-title"
          >
            <div className="job-detail-topbar">
              <span>OFFRE / {selectedJob.department.toUpperCase()}</span>
              <button
                type="button"
                className="job-detail-close"
                onClick={() => setSelectedJob(null)}
                aria-label="Fermer l'offre"
              >
                <X size={20} />
              </button>
            </div>
            <div className="job-detail-scroll">
              <div className="job-detail-heading">
                <p className="jobs-card-department">{selectedJob.department}</p>
                <h2 id="job-detail-title">{selectedJob.title}</h2>
                <p className="job-detail-location">
                  <MapPin size={15} /> {selectedJob.location}
                </p>
                <div className="job-detail-pills">
                  <span>{selectedJob.contract}</span>
                  <span>{selectedJob.experience}</span>
                </div>
              </div>

              <div className="job-detail-content">
                <div className="job-detail-copy">
                  <p className="job-detail-lead">{selectedJob.summary}</p>
                  <p>{selectedJob.description}</p>
                  <div className="job-detail-columns">
                    <div>
                      <h3>Vos missions</h3>
                      <ul>
                        {selectedJob.responsibilities.map(item => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>Votre profil</h3>
                      <ul>
                        {selectedJob.profile.map(item => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <form className="job-application" onSubmit={handleApplication}>
                  <div className="job-application-heading">
                    <p className="jobs-card-department">POSTULER</p>
                    <h3>
                      Une place pour
                      <br />
                      <em>votre regard.</em>
                    </h3>
                    <p>
                      Quelques lignes et votre CV suffisent pour commencer la
                      conversation.
                    </p>
                  </div>
                  <div className="job-form-grid">
                    <label>
                      <span>
                        Nom complet <b>*</b>
                      </span>
                      <input name="name" required placeholder="Votre nom" />
                    </label>
                    <label>
                      <span>
                        Adresse email <b>*</b>
                      </span>
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="vous@email.com"
                      />
                    </label>
                  </div>
                  <label>
                    <span>Téléphone</span>
                    <input
                      name="phone"
                      type="tel"
                      placeholder="+221 77 123 45 67"
                    />
                  </label>
                  <label>
                    <span>
                      Votre message <b>*</b>
                    </span>
                    <textarea
                      name="message"
                      required
                      rows={4}
                      placeholder="Parlez-nous de vous et de ce qui vous attire chez Kaba…"
                    />
                  </label>
                  <label className="job-file-field">
                    <span>
                      CV <b>*</b>
                    </span>
                    <span className="job-file-control">
                      <Paperclip size={16} /> Joindre mon CV{" "}
                      <input
                        name="cv"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        required
                      />
                    </span>
                    <small>PDF ou Word · 5 Mo maximum</small>
                  </label>
                  <label className="job-consent">
                    <input type="checkbox" required />
                    <span>
                      J'accepte que Kaba utilise ces informations pour traiter
                      ma candidature.
                    </span>
                  </label>
                  {applicationSent && (
                    <div className="job-application-success" role="status">
                      <Check size={17} /> Merci. Votre candidature est prête à
                      être étudiée par l'équipe Kaba.
                    </div>
                  )}
                  <button className="job-submit" type="submit">
                    {applicationSent
                      ? "Candidature envoyée"
                      : "Envoyer ma candidature"}
                    <ArrowUpRight size={17} />
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
