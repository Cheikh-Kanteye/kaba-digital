import { describe, expect, it } from "vitest";
import { matchesHomeFilters, type HomeFilterProperty } from "@/lib/homeFilters";

const villa: HomeFilterProperty = {
  type: "Villa",
  mode: "Vente",
  title: "Villa des Almadies",
  location: "Almadies · Dakar",
  price: "180 000 000 FCFA",
};

const apartment: HomeFilterProperty = {
  type: "Appartement",
  mode: "Location",
  title: "Appartement Horizon Dakar",
  location: "Ngor · Dakar",
  price: "250 000 FCFA / mois",
};

const terrain: HomeFilterProperty = {
  type: "Terrain",
  mode: "Vente",
  title: "Terrain Lac Rose",
  location: "Lac Rose · Sénégal",
  price: "70 000 000 FCFA",
};

const base = {
  query: "",
  propertyType: "Tous les biens",
  priceRange: "Tous les budgets",
  mode: "Tous les modes",
  activeTab: "Biens" as const,
};

describe("matchesHomeFilters", () => {
  it("matches a property by location and type", () => {
    expect(
      matchesHomeFilters(villa, {
        ...base,
        query: "almadies",
        propertyType: "Une maison",
      })
    ).toBe(true);
    expect(
      matchesHomeFilters(villa, {
        ...base,
        query: "ngor",
        propertyType: "Une maison",
      })
    ).toBe(false);
  });

  it("matches the budget brackets without treating a rental monthly price as a sale amount", () => {
    expect(
      matchesHomeFilters(villa, { ...base, priceRange: "100 à 200 millions" })
    ).toBe(true);
    expect(
      matchesHomeFilters(apartment, {
        ...base,
        priceRange: "Plus de 200 millions",
      })
    ).toBe(false);
  });

  it("matches the explicit sale or rental mode", () => {
    expect(matchesHomeFilters(apartment, { ...base, mode: "Location" })).toBe(
      true
    );
    expect(matchesHomeFilters(apartment, { ...base, mode: "Vente" })).toBe(
      false
    );
  });

  it("keeps terrain cards in the Terrains tab and out of the Biens tab", () => {
    expect(
      matchesHomeFilters(terrain, { ...base, activeTab: "Terrains" })
    ).toBe(true);
    expect(matchesHomeFilters(terrain, { ...base, activeTab: "Biens" })).toBe(
      false
    );
  });
});
