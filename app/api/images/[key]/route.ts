import { env } from 'cloudflare:workers';
import { and, eq } from 'drizzle-orm';

import { getDb } from '@/db';
import { looks, profiles } from '@/db/schema';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ key: string }> };

export async function GET(_request: Request, context: RouteContext) {
  if (!env.BUCKET) {
    return Response.json(
      { error: 'Image storage is unavailable.' },
      { status: 503 },
    );
  }

  const { key } = await context.params;
  if (!/^[0-9a-f-]{36}\.(?:jpg|png|webp)$/i.test(key)) {
    return Response.json({ error: 'Image not found.' }, { status: 404 });
  }

  let visibleLook: { id: string } | undefined;
  try {
    [visibleLook] = await getDb()
      .select({ id: looks.id })
      .from(looks)
      .innerJoin(profiles, eq(looks.userId, profiles.userId))
      .where(and(eq(looks.imageKey, key), eq(profiles.discoverable, true)))
      .limit(1);
  } catch {
    return Response.json(
      { error: 'Image storage is unavailable.' },
      { status: 503 },
    );
  }
  if (!visibleLook) {
    return Response.json({ error: 'Image not found.' }, { status: 404 });
  }

  const object = await env.BUCKET.get(key);
  if (!object) {
    return Response.json({ error: 'Image not found.' }, { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('ETag', object.httpEtag);
  headers.set('X-Content-Type-Options', 'nosniff');

  return new Response(object.body, { headers });
}
