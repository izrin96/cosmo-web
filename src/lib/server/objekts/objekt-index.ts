import { desc } from "drizzle-orm";
import { indexer } from "../db/indexer";
import { collections } from "../db/indexer/schema";
import { overrideColor } from "@/lib/utils";

export async function fetchObjektsIndex() {
  const result = await indexer
    .select()
    .from(collections)
    .orderBy(desc(collections.createdAt), desc(collections.collectionNo));

  return result.map((objekt) => ({
    ...objekt,
    ...overrideColor(objekt),
  }));
}
