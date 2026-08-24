export function formatPropertyAge(value?: Date | string) {
  if (!value) return "date non renseignée";
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "date non renseignée";

  const elapsedDays = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / 86_400_000)
  );
  if (elapsedDays === 0) return "aujourd’hui";
  if (elapsedDays === 1) return "il y a 1 jour";
  if (elapsedDays < 7) return `il y a ${elapsedDays} jours`;
  const elapsedWeeks = Math.floor(elapsedDays / 7);
  if (elapsedWeeks < 5)
    return `il y a ${elapsedWeeks} semaine${elapsedWeeks > 1 ? "s" : ""}`;
  const elapsedMonths = Math.floor(elapsedDays / 30);
  if (elapsedMonths < 12) return `il y a ${elapsedMonths} mois`;
  const elapsedYears = Math.floor(elapsedDays / 365);
  return `il y a ${elapsedYears} an${elapsedYears > 1 ? "s" : ""}`;
}

export function phoneDigits(value?: string) {
  return (value ?? "").replace(/[^0-9]/g, "");
}
