import { indexer } from "@/lib/server/db/indexer";
import { asc, eq } from "drizzle-orm";
import { collections, objekts } from "@/lib/server/db/indexer/schema";

type Params = {
  params: Promise<{
    collectionSlug: string;
  }>;
};

export async function GET(_: Request, props: Params) {
  const params = await props.params;

  const results = await indexer
    .select({
      serial: objekts.serial,
      owner: objekts.owner,
      transferable: objekts.transferable,
    })
    .from(objekts)
    .leftJoin(collections, eq(objekts.collectionId, collections.id))
    .where(eq(collections.slug, params.collectionSlug))
    .orderBy(asc(objekts.serial));

  return Response.json({
    objekts: results,
  });
}