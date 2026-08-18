// Direction artistique Kaba : maison d’édition africaine, formulaires calmes, lisibles et premium.
// Les parcours d’accès reprennent la confiance éditoriale de la marque sans simuler de connexion réelle.

import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, Eye, EyeOff, Volume2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Auth({ mode = "register" }: { mode?: "register" | "login" }) {
  const [, navigate] = useLocation();
  const [profile, setProfile] = useState("Agent immobilier");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const isRegister = mode === "register";
  const localLogin = trpc.auth.localLogin.useMutation({ onSuccess: (result) => navigate(result.role === "admin" ? "/admin" : "/dashboard") });
  const localRegister = trpc.auth.localRegister.useMutation({ onSuccess: () => navigate("/dashboard") });

  function readInstructions() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(isRegister ? "Pour créer votre compte, remplissez votre nom, votre téléphone et votre mot de passe. Choisissez ensuite votre métier : agent immobilier ou courtier." : "Pour vous connecter, écrivez votre adresse email et votre mot de passe, puis appuyez sur le bouton se connecter."));
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    const form = new FormData(event.currentTarget);
    if (isRegister) {
      localRegister.mutate({
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        password: String(form.get("password") || ""),
        phone: String(form.get("phone") || "") || undefined,
        city: String(form.get("city") || "") || undefined,
        rcNumber: String(form.get("rcNumber") || "") || undefined,
        ninea: String(form.get("ninea") || "") || undefined,
        agencyAddress: String(form.get("agencyAddress") || "") || undefined,
        profile: profile as "Agent immobilier" | "Courtier",
      }, { onError: (error) => setLoginError(error.message) });
      return;
    }
    localLogin.mutate({ email: loginEmail, password: loginPassword }, { onError: (error) => setLoginError(error.message) });
  }

  return <main className="auth-page"><div className="auth-image"><div className="auth-image-shade" /><Link href="/" className="auth-brand"><img className="h-16 w-16 rounded-lg object-contain" src="/manus-storage/icon-kaba_4ca3b0a4.png" alt="Kaba" /></Link><div className="auth-image-caption"><span>DAKAR / SÉNÉGAL</span><p>Des lieux choisis<br /><em>avec attention.</em></p></div></div><section className="auth-panel"><Link href="/" className="auth-back"><ArrowLeft size={15} /> Retour à l’accueil</Link><div className="auth-content">{submitted ? <div className="auth-success"><span className="success-mark"><Check size={22} /></span><p className="eyebrow"><span>01</span> Demande reçue</p><h1>{isRegister ? "Votre profil est" : "Votre demande est"}<br /><em>en préparation.</em></h1><p>Merci. Notre équipe Kaba reviendra vers vous afin de finaliser votre accès et vérifier les informations transmises.</p><button className="auth-button" onClick={() => navigate("/")}>Retourner à l’accueil <ArrowUpRight size={16} /></button></div> : <><p className="eyebrow"><span>01</span> Espace professionnel</p><h1>{isRegister ? "Créer un compte" : "Se connecter"}</h1><p className="auth-intro">{isRegister ? "Remplissez les cases. Nous vous guiderons." : "Écrivez votre email et votre mot de passe."}</p><button type="button" className="read-help" onClick={readInstructions}><Volume2 size={16} /> Écouter les consignes</button>{!isRegister && <div className="demo-credentials"><span>ACCÈS SÉCURISÉ</span><strong>Connexion locale Kaba</strong><small>Utilisez votre email et votre mot de passe.</small></div>}<form className="auth-form" onSubmit={handleSubmit}>{isRegister && <><label>Nom complet<input name="name" required placeholder="Votre nom et prénom" /></label><label>Email professionnel<input name="email" required type="email" placeholder="vous@agence.com" /></label><label>Téléphone<input name="phone" required type="tel" placeholder="+221 77 000 00 00" /></label><label>Ville / quartier<input name="city" required placeholder="Ex. Almadies, Dakar" /></label></>} {!isRegister && <label>Email<input required type="email" value={loginEmail} onChange={(event) => { setLoginEmail(event.target.value); setLoginError(""); }} placeholder="cheikhkanteye.contact@gmail.com" /></label>}<label>Mot de passe<div className="password-field"><input name="password" required type={showPassword ? "text" : "password"} value={isRegister ? undefined : loginPassword} onChange={isRegister ? undefined : (event) => { setLoginPassword(event.target.value); setLoginError(""); }} placeholder="Votre mot de passe" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Afficher ou masquer le mot de passe">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>{loginError && <p className="auth-error" role="alert">{loginError}</p>}{(localLogin.error || localRegister.error) && !loginError && <p className="auth-error" role="alert">{localLogin.error?.message || localRegister.error?.message}</p>}{isRegister && <><div className="profile-choice"><span>Je suis</span><div>{["Agent immobilier", "Courtier"].map((item) => <button type="button" className={profile === item ? "is-selected" : ""} onClick={() => setProfile(item)} key={item}>{item}{profile === item && <Check size={13} />}</button>)}</div></div>{profile === "Agent immobilier" && <div className="verification-fields"><p>Informations légales <span>(Agent uniquement)</span></p><label>Numéro Registre de Commerce<input name="rcNumber" placeholder="Votre numéro RC" /></label><label>NINEA <input name="ninea" placeholder="Votre numéro fiscal" /></label><label>Adresse physique de l’agence<input name="agencyAddress" placeholder="Adresse de votre agence" /></label></div>}</>}<button className="auth-button" type="submit" disabled={localLogin.isPending || localRegister.isPending}>{localLogin.isPending || localRegister.isPending ? "Connexion…" : isRegister ? "S’inscrire" : "Se connecter"} <ArrowUpRight size={16} /></button></form><p className="auth-switch">{isRegister ? "Déjà un compte ?" : "Vous n’avez pas encore de compte ?"} <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "Se connecter" : "Créer un compte"}</Link></p></>}</div></section></main>;
}
