import { Filters } from "@/hooks/use-filters";
import { ValidClass, ValidSeason } from "@/lib/universal/cosmo/common";
import {
  getSeasonCollectionNo,
  OwnedObjekt,
  ValidObjekt,
} from "./universal/objekts";
import { groupBy } from "es-toolkit";

const shortformMembers: Record<string, string> = {
  naky: "NaKyoung",
  tone: "Kotone",
  sulin: "Sullin",
  choery: "Choerry",
  sy: "SeoYeon",
  yy: "YooYeon",
  jb: "JooBin",
  dh: "DaHyun",
  kd: "Kaede",
  hr: "HyeRin",
  jw: "JiWoo",
  cy: "ChaeYeon",
  sm: "SooMin",
  nk: "NaKyoung",
  yb: "YuBin",
  k: "Kaede",
  yj: "YeonJi",
  n: "Nien",
  sh: "SoHyun",
  x: "Xinyu",
  m: "Mayu",
  l: "Lynn",
  hy: "HaYeon",
  so: "ShiOn",
  cw: "ChaeWon",
  s: "Sullin",
  sa: "SeoAh",
  jy: "JiYeon",
  hj: "HeeJin",
  hs: "HaSeul",
  kl: "KimLip",
  js: "JinSoul",
  c: "Choerry",
};

function getMemberShortKeys(value: string) {
  return Object.keys(shortformMembers).filter(
    (key) => shortformMembers[key] === value
  );
}

const searchFilter = (search: string, objekt: ValidObjekt) => {
  // todo: improve this
  const searchLower = search.toLowerCase();
  const keys = [...getMemberShortKeys(objekt.member), objekt.member];
  return (
    keys.some((key) =>
      `${key} ${objekt.collectionNo}`.toLowerCase().includes(searchLower)
    ) ||
    keys.some((key) =>
      `${key} ${getSeasonCollectionNo(objekt)}`
        .toLowerCase()
        .includes(searchLower)
    )
  );
};

export function filterObjekts<T extends ValidObjekt>(
  filters: Filters,
  objekts: T[]
) {
  if (filters.member) {
    objekts = objekts.filter((a) => filters.member?.includes(a.member));
  }
  if (filters.artist) {
    objekts = objekts.filter((a) => a.artist === filters.artist);
  }
  if (filters.class) {
    objekts = objekts.filter((a) =>
      filters.class?.includes(a.class as ValidClass)
    );
  }
  if (filters.season) {
    objekts = objekts.filter((a) =>
      filters.season?.includes(a.season as ValidSeason)
    );
  }
  if (filters.on_offline) {
    objekts = objekts.filter((a) => filters.on_offline?.includes(a.onOffline));
  }
  if (filters.transferable) {
    objekts = objekts.filter((a) => (a as OwnedObjekt).transferable);
  }

  if (filters.search) {
    // support multiple query split by commas
    const searches = filters.search
      .split(",")
      .filter(Boolean)
      .map((a) => a.trim());
    objekts = objekts.filter((objekt) =>
      searches.some((s) => searchFilter(s, objekt))
    );
  }

  // sort by noDescending first
  objekts = objekts.toSorted((a, b) =>
    b.collectionNo.localeCompare(a.collectionNo)
  );

  const sort = filters.sort ?? "newest";

  const getSortDate = (obj: T) =>
    "receivedAt" in obj
      ? new Date((obj as OwnedObjekt).receivedAt).getTime()
      : new Date(obj.createdAt).getTime();

  if (sort === "newest") {
    objekts = objekts.toSorted((a, b) => getSortDate(b) - getSortDate(a));
  } else if (sort === "oldest") {
    objekts = objekts.toSorted((a, b) => getSortDate(a) - getSortDate(b));
  } else if (sort === "noDescending") {
    objekts = objekts.toSorted((a, b) =>
      b.collectionNo.localeCompare(a.collectionNo)
    );
  } else if (sort === "noAscending") {
    objekts = objekts.toSorted((a, b) =>
      a.collectionNo.localeCompare(b.collectionNo)
    );
  } else if (sort === "newestSeason") {
    objekts = objekts
      .toSorted((a, b) => b.collectionNo.localeCompare(a.collectionNo))
      .toSorted((a, b) => b.season.localeCompare(a.season));
  } else if (sort === "oldestSeason") {
    objekts = objekts
      .toSorted((a, b) => a.collectionNo.localeCompare(b.collectionNo))
      .toSorted((a, b) => a.season.localeCompare(b.season));
  } else if (sort === "serialDesc") {
    objekts = objekts.toSorted(
      (a, b) => (b as OwnedObjekt).serial - (a as OwnedObjekt).serial
    );
  } else if (sort === "serialAsc") {
    objekts = objekts.toSorted(
      (a, b) => (a as OwnedObjekt).serial - (b as OwnedObjekt).serial
    );
  }

  return objekts;
}

function sortDuplicate<T extends ValidObjekt>(
  filters: Filters,
  objekts: T[][]
) {
  const sort = filters.sort ?? "newest";
  if (sort === "duplicateDesc") {
    objekts = objekts.toSorted((a, b) => b.length - a.length);
  } else if (sort === "duplicateAsc") {
    objekts = objekts.toSorted((a, b) => a.length - b.length);
  }
  return objekts;
}

export function filterAndGroupObjekts<T extends ValidObjekt>(
  filters: Filters,
  objekts: T[]
) {
  objekts = filterObjekts(filters, objekts);
  let groupedObjekts: T[][];
  if (filters.grouped) {
    groupedObjekts = Object.values(groupBy(objekts, (a) => a.collectionId));
  } else {
    groupedObjekts = objekts.map((objekt) => [objekt]);
  }
  return sortDuplicate(filters, groupedObjekts);
}

// todo: grouping feature
export function groupGroupedObjekts<T extends ValidObjekt>(
  groupedObjekts: T[][]
) {
  
}
