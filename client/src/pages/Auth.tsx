// Direction artistique Kaba : maison d’édition africaine, formulaires calmes, lisibles et premium.
// Les parcours d’accès reprennent la confiance éditoriale de la marque sans simuler de connexion réelle.

import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, Eye, EyeOff, Volume2 } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Auth({ mode = "register" }: { mode?: "register" | "login" }) {
  const [, navigate] = useLocation();
  const [profile, setProfile] = useState("Agent immobilier");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const isRegister = mode === "register";

  function readInstructions() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(isRegister ? "Pour créer votre compte, remplissez votre nom, votre téléphone et votre mot de passe. Choisissez ensuite votre métier : agent immobilier ou courtier." : "Pour vous connecter, écrivez votre adresse email et votre mot de passe, puis appuyez sur le bouton se connecter."));
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isRegister) {
      if (loginEmail.trim().toLowerCase() === "agent@kaba.digital" && loginPassword === "Kaba2026!") {
        navigate("/dashboard");
        return;
      }
      setLoginError("Identifiants incorrects. Utilisez les identifiants de démonstration indiqués ci-dessus.");
      return;
    }
    setSubmitted(true);
  }

  return <main className="auth-page"><div className="auth-image"><div className="auth-image-shade" /><Link href="/" className="auth-brand"><img src="/manus-storage/header-kaba_21c09ba5.png" alt="Kaba" /></Link><div className="auth-image-caption"><span>DAKAR / SÉNÉGAL</span><p>Des lieux choisis<br /><em>avec attention.</em></p></div></div><section className="auth-panel"><Link href="/" className="auth-back"><ArrowLeft size={15} /> Retour à l’accueil</Link><div className="auth-content">{submitted ? <div className="auth-success"><span className="success-mark"><Check size={22} /></span><p className="eyebrow"><span>01</span> Demande reçue</p><h1>{isRegister ? "Votre profil est" : "Votre demande est"}<br /><em>en préparation.</em></h1><p>Merci. Notre équipe Kaba reviendra vers vous afin de finaliser votre accès et vérifier les informations transmises.</p><button className="auth-button" onClick={() => navigate("/")}>Retourner à l’accueil <ArrowUpRight size={16} /></button></div> : <><p className="eyebrow"><span>01</span> Espace professionnel</p><h1>{isRegister ? "Créer un compte" : "Se connecter"}</h1><p className="auth-intro">{isRegister ? "Remplissez les cases. Nous vous guiderons." : "Écrivez votre email et votre mot de passe."}</p><button type="button" className="read-help" onClick={readInstructions}><Volume2 size={16} /> Écouter les consignes</button>{!isRegister && <div className="demo-credentials"><span>ACCÈS DE DÉMONSTRATION</span><strong>agent@kaba.digital</strong><strong>Kaba2026!</strong></div>}<form className="auth-form" onSubmit={handleSubmit}>{isRegister && <><label>Nom complet<input required placeholder="Votre nom et prénom" /></label><label>Email professionnel<input required type="email" placeholder="vous@agence.com" /></label><label>Téléphone<input required type="tel" placeholder="+221 77 000 00 00" /></label><label>Ville / quartier<input required placeholder="Ex. Almadies, Dakar" /></label></>} {!isRegister && <label>Email<input required type="email" value={loginEmail} onChange={(event) => { setLoginEmail(event.target.value); setLoginError(""); }} placeholder="agent@kaba.digital" /></label>}<label>Mot de passe<div className="password-field"><input required type={showPassword ? "text" : "password"} value={isRegister ? undefined : loginPassword} onChange={isRegister ? undefined : (event) => { setLoginPassword(event.target.value); setLoginError(""); }} placeholder={isRegister ? "Votre mot de passe" : "Kaba2026!"} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Afficher ou masquer le mot de passe">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>{loginError && <p className="auth-error" role="alert">{loginError}</p>}{isRegister && <><div className="profile-choice"><span>Je suis</span><div>{["Agent immobilier", "Courtier"].map((item) => <button type="button" className={profile === item ? "is-selected" : ""} onClick={() => setProfile(item)} key={item}>{item}{profile === item && <Check size={13} />}</button>)}</div></div>{profile === "Agent immobilier" && <div className="verification-fields"><p>Informations légales <span>(Agent uniquement)</span></p><label>Numéro Registre de Commerce<input placeholder="Votre numéro RC" /></label><label>NINEA <input placeholder="Votre numéro fiscal" /></label><label>Adresse physique de l’agence<input placeholder="Adresse de votre agence" /></label><label>Document de vérification (PDF)<input type="file" accept="application/pdf" /></label></div>}</>}<button className="auth-button" type="submit">{isRegister ? "S’inscrire" : "Se connecter"} <ArrowUpRight size={16} /></button></form><p className="auth-switch">{isRegister ? "Déjà un compte ?" : "Vous n’avez pas encore de compte ?"} <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "Se connecter" : "Créer un compte"}</Link></p></>}</div></section></main>;
}
