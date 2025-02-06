import { Filters } from "@/hooks/use-filters";
import {
  ValidClass,
  ValidGroupBy,
  ValidSeason,
} from "@/lib/universal/cosmo/common";
import {
  getSeasonCollectionNo,
  OwnedObjekt,
  ValidObjekt,
} from "./universal/objekts";
import { groupBy } from "es-toolkit";
import { CosmoArtistWithMembersBFF } from "./universal/cosmo/artists";

const shortformMembers: Record<string, string> = {
  naky: "NaKyoung",
  n: "Nien",
  nk: "NaKyoung",
  tone: "Kotone",
  sulin: "Sullin",
  sh: "SoHyun",
  c: "Choerry",
  choery: "Choerry",
  cw: "ChaeWon",
  cy: "ChaeYeon",
  sy: "SeoYeon",
  sm: "SooMin",
  so: "ShiOn",
  sa: "SeoAh",
  sl: "Sullin",
  jw: "JiWoo",
  jb: "JooBin",
  jy: "JiYeon",
  js: "JinSoul",
  dh: "DaHyun",
  kd: "Kaede",
  kl: "KimLip",
  k: "Kaede",
  hr: "HyeRin",
  hy: "HaYeon",
  hj: "HeeJin",
  hs: "HaSeul",
  yb: "YuBin",
  yj: "YeonJi",
  yy: "YooYeon",
  x: "Xinyu",
  m: "Mayu",
  l: "Lynn",
};

function getMemberShortKeys(value: string) {
  return Object.keys(shortformMembers).filter(
    (key) => shortformMembers[key] === value
  );
}

function parseCollectionNo(value: string) {
  const expression = /^([a-zA-Z]?)(\d{3})([azAZ]?)$/;
  const match = value.match(expression);
  if (!match) return null;
  const [, seasonCode, collectionNo, type] = match;
  return {
    seasonCode,
    collectionNo,
    type,
  };
}

function parseSerial(value: string) {
  const expression = /\d+/;
  const match = value.match(expression);
  if (!match) return null;
  return parseInt(match[0]);
}

const searchFilter = (keyword: string, objekt: ValidObjekt) => {
  // Handle serial search (e.g. #1-20)
  if (keyword.startsWith("#") && "serial" in objekt) {
    const [start, end] = keyword.split("-").map(parseSerial);
    if (!start) return false;
    return objekt.serial >= start && objekt.serial <= (end ?? start);
  }

  // Handle collection range search (e.g. 301z-302z)
  if (!keyword.startsWith("#") && keyword.includes("-")) {
    const [start, end] = keyword.split("-").map(parseCollectionNo);
    if (!start || !end) return false;

    const collectionNo = objekt.collectionNo.toLowerCase();
    const seasonCode = objekt.season.charAt(0).toLowerCase();
    const startType = start.type || "a";
    const endType = end.type || "z";
    const startSeason = start.seasonCode || "a";
    const endSeason = end.seasonCode || start.seasonCode || "z";

    return (
      collectionNo >= `${start.collectionNo}${startType}` &&
      collectionNo <= `${end.collectionNo}${endType}` &&
      seasonCode >= startSeason &&
      seasonCode <= endSeason
    );
  }

  // Handle member search (e.g. naky, yy)
  const memberKeys = [...getMemberShortKeys(objekt.member), objekt.member];
  if (memberKeys.some((value) => value.toLowerCase() === keyword)) {
    return true;
  }

  // Handle collection number search
  const collectionNos = [objekt.collectionNo, getSeasonCollectionNo(objekt)];
  return collectionNos.some((value) => value.toLowerCase().startsWith(keyword));
};

const getSortDate = <T extends ValidObjekt>(obj: T) =>
  "receivedAt" in obj
    ? new Date(obj.receivedAt).getTime()
    : new Date(obj.createdAt).getTime();

function filterObjekts<T extends ValidObjekt>(
  filters: Filters,
  objekts: T[],
  artists: CosmoArtistWithMembersBFF[]
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
    objekts = objekts.filter((a) =>
      "transferable" in a ? a.transferable : undefined
    );
  }

  if (filters.search) {
    // support multiple query split by commas
    const queries = filters.search
      .toLowerCase()
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean)
      .map((query) =>
        query
          .split(" ")
          .map((a) => a.trim())
          .filter(Boolean)
      );

    if (queries.length > 0)
      objekts = objekts.filter((objekt) =>
        queries.some((s) => s.every((a) => searchFilter(a, objekt)))
      );
  }

  // default sort and season sort
  objekts = objekts
    .toSorted((a, b) => compareMember(a.member, b.member, "asc", artists))
    .toSorted((a, b) => b.collectionNo.localeCompare(a.collectionNo))
    .toSorted((a, b) => b.season.localeCompare(a.season));

  const sort = filters.sort ?? "date";
  const sortDir = filters.sort_dir ?? "desc";

  if (sort === "date") {
    if (sortDir === "desc")
      objekts = objekts.toSorted((a, b) => getSortDate(b) - getSortDate(a));
    else objekts = objekts.toSorted((a, b) => getSortDate(a) - getSortDate(b));
  } else if (sort === "season") {
    // for desc, use default
    if (sortDir === "asc")
      objekts = objekts
        .toSorted((a, b) => a.collectionNo.localeCompare(b.collectionNo))
        .toSorted((a, b) => a.season.localeCompare(b.season));
  } else if (sort === "collectionNo") {
    if (sortDir === "desc")
      objekts = objekts.toSorted((a, b) =>
        b.collectionNo.localeCompare(a.collectionNo)
      );
    else
      objekts = objekts.toSorted((a, b) =>
        a.collectionNo.localeCompare(b.collectionNo)
      );
  } else if (sort === "serial") {
    if (sortDir === "desc")
      objekts = objekts.toSorted(
        (a, b) => (b as OwnedObjekt).serial - (a as OwnedObjekt).serial
      );
    else
      objekts = objekts.toSorted(
        (a, b) => (a as OwnedObjekt).serial - (b as OwnedObjekt).serial
      );
  } else if (sort === "member") {
    objekts = objekts.toSorted((a, b) => {
      return compareMember(a.member, b.member, sortDir, artists);
    });
  }

  return objekts;
}

function sortDuplicate<T extends ValidObjekt>(
  filters: Filters,
  objekts: T[][]
) {
  const sort = filters.sort ?? "date";
  const sortDir = filters.sort_dir ?? "desc";

  if (sort === "duplicate") {
    if (sortDir === "desc")
      objekts = objekts.toSorted((a, b) => b.length - a.length);
    else objekts = objekts.toSorted((a, b) => a.length - b.length);
  }

  return objekts;
}

export function shapeIndexedObjekts<T extends ValidObjekt>(
  filters: Filters,
  objekts: T[],
  artists: CosmoArtistWithMembersBFF[]
): [string, T[]][] {
  objekts = filterObjekts(filters, objekts, artists);

  let results: Record<string, T[]>;
  if (filters.group_by) {
    results = groupBy(objekts, (a) => a[filters.group_by as ValidGroupBy]);
  } else {
    results = groupBy(objekts, () => "");
  }

  const groupDir = filters.group_dir ?? "desc";

  return Object.entries(results).toSorted(([keyA], [keyB]) => {
    if (filters.group_by === "member") {
      return compareMember(keyA, keyB, groupDir, artists);
    }

    if (groupDir === "desc") return keyB.localeCompare(keyA);
    return keyA.localeCompare(keyB);
  });
}

export function shapeProfileObjekts<T extends ValidObjekt>(
  filters: Filters,
  objekts: T[],
  artists: CosmoArtistWithMembersBFF[]
): [string, T[][]][] {
  return shapeIndexedObjekts(filters, objekts, artists).map(
    ([key, objekts]) => {
      let grouped: T[][];
      if (filters.grouped) {
        grouped = Object.values(groupBy(objekts, (a) => a.collectionId));
      } else {
        grouped = objekts.map((objekt) => [objekt]);
      }
      return [key, sortDuplicate(filters, grouped)];
    }
  );
}

function compareMember(
  memberA: string,
  memberB: string,
  direction: "asc" | "desc",
  artists: CosmoArtistWithMembersBFF[]
) {
  const memberOrderA =
    artists
      .flatMap((a) => a.artistMembers)
      .find((member) => member.name === memberA)?.order ?? Infinity;

  const memberOrderB =
    artists
      .flatMap((a) => a.artistMembers)
      .find((member) => member.name === memberB)?.order ?? Infinity;

  if (direction == "desc") return memberOrderB - memberOrderA;
  return memberOrderA - memberOrderB;
}
