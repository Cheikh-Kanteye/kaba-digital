export type HomeFilterProperty = {
  type: string;
  mode: string;
  title: string;
  location: string;
  price: string;
};

export type HomeFilterOptions = {
  query: string;
  propertyType: string;
  priceRange: string;
  mode: string;
  activeTab: "Biens" | "Terrains";
};

function parsePriceLabel(value: string) {
  const normalized = value.replace(/\s/g, "").replace(/[^0-9]/g, "");
  return normalized ? Number(normalized) : null;
}

export function matchesHomeFilters(
  property: HomeFilterProperty,
  options: HomeFilterOptions
) {
  const normalizedQuery = options.query.trim().toLowerCase();
  const locationMatch =
    !normalizedQuery ||
    `${property.location} ${property.title}`
      .toLowerCase()
      .includes(normalizedQuery);
  const typeMatch =
    options.propertyType === "Tous les biens" ||
    (options.propertyType === "Une maison" &&
      ["Maison", "Villa"].includes(property.type)) ||
    (options.propertyType === "Un appartement" &&
      property.type === "Appartement") ||
    (options.propertyType === "Un terrain" && property.type === "Terrain");
  const price = parsePriceLabel(property.price);
  const priceMatch =
    options.priceRange === "Tous les budgets" ||
    (options.priceRange === "Moins de 100 millions" &&
      price !== null &&
      price < 100_000_000) ||
    (options.priceRange === "100 à 200 millions" &&
      price !== null &&
      price >= 100_000_000 &&
      price <= 200_000_000) ||
    (options.priceRange === "Plus de 200 millions" &&
      price !== null &&
      price > 200_000_000);
  const modeMatch =
    options.mode === "Tous les modes" || property.mode === options.mode;
  const tabMatch =
    options.activeTab === "Terrains"
      ? property.type === "Terrain"
      : property.type !== "Terrain";
  return locationMatch && typeMatch && priceMatch && modeMatch && tabMatch;
}
