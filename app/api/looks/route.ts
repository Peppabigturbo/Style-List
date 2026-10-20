import { env } from 'cloudflare:workers';
import { desc, eq } from 'drizzle-orm';

import { chatGPTSignInPath, getChatGPTUser } from '@/app/chatgpt-auth';
import { getDb } from '@/db';
import { looks, profiles } from '@/db/schema';

export const dynamic = 'force-dynamic';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MIME_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const;

export async function GET() {
  try {
    const db = getDb();
    const rows = await db
      .select({
        id: looks.id,
        caption: looks.caption,
        location: looks.location,
        area: looks.area,
        placeRating: looks.placeRating,
        outfit: looks.outfit,
        imageKey: looks.imageKey,
        createdAt: looks.createdAt,
        username: profiles.username,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
      })
      .from(looks)
      .innerJoin(profiles, eq(looks.userId, profiles.userId))
      .where(eq(profiles.discoverable, true))
      .orderBy(desc(looks.createdAt))
      .limit(60);

    return Response.json({ looks: rows.map(serializeLook) });
  } catch (error) {
    return storageError(error);
  }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) {
    return Response.json(
      {
        error: 'Sign in to post a look.',
        signInPath: chatGPTSignInPath('/'),
      },
      { status: 401 },
    );
  }
  if (!env.BUCKET) {
    return Response.json(
      { error: 'Image storage is not configured.' },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: 'Invalid upload request.' }, { status: 400 });
  }

  const image = formData.get('image');
  const caption = textValue(formData.get('caption'));
  const location = textValue(formData.get('location'));
  const rating = Number(formData.get('rating') || 5);

  if (!(image instanceof File) || image.size === 0) {
    return Response.json({ error: 'Choose a photo to post.' }, { status: 400 });
  }
  if (image.size > MAX_IMAGE_BYTES) {
    return Response.json(
      { error: 'Photos must be 8 MB or smaller.' },
      { status: 413 },
    );
  }
  if (!caption || caption.length > 500) {
    return Response.json(
      { error: 'Add a caption up to 500 characters.' },
      { status: 400 },
    );
  }
  if (location.length < 2 || location.length > 160) {
    return Response.json(
      { error: 'Add a location up to 160 characters.' },
      { status: 400 },
    );
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return Response.json(
      { error: 'Location rating must be between 1 and 5.' },
      { status: 400 },
    );
  }

  const buffer = await image.arrayBuffer();
  const mimeType = sniffImageMime(new Uint8Array(buffer));
  if (!mimeType || mimeType !== image.type) {
    return Response.json(
      { error: 'Use a valid JPEG, PNG, or WebP photo.' },
      { status: 415 },
    );
  }

  let db: ReturnType<typeof getDb>;
  let profile:
    | {
        userId: string;
        username: string;
        firstName: string;
        lastName: string;
      }
    | undefined;
  try {
    db = getDb();
    [profile] = await db
      .select({
        userId: profiles.userId,
        username: profiles.username,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
      })
      .from(profiles)
      .where(eq(profiles.userId, user.userId))
      .limit(1);
  } catch (error) {
    return storageError(error);
  }

  if (!profile) {
    return Response.json(
      {
        error: 'Create your profile before posting a look.',
        needsProfile: true,
      },
      { status: 409 },
    );
  }

  const id = crypto.randomUUID();
  const imageKey = `${id}.${MIME_EXTENSIONS[mimeType]}`;
  const createdAt = new Date().toISOString();
  const values = {
    id,
    userId: user.userId,
    imageKey,
    imageMimeType: mimeType,
    caption,
    location,
    area: location.split(',')[0]?.trim().slice(0, 80) || location.slice(0, 80),
    placeRating: rating,
    outfit: '[]',
    createdAt,
  };

  let imageStored = false;
  try {
    await env.BUCKET.put(imageKey, buffer, {
      httpMetadata: { contentType: mimeType },
      customMetadata: { ownerUserId: user.userId },
    });
    imageStored = true;
    await db.insert(looks).values(values);
  } catch (error) {
    if (imageStored) {
      await env.BUCKET.delete(imageKey).catch(() => undefined);
    }
    return storageError(error);
  }

  return Response.json(
    {
      look: serializeLook({
        ...values,
        username: profile.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
      }),
    },
    { status: 201 },
  );
}

type SerializedLook = {
  id: string;
  caption: string;
  location: string;
  area: string;
  placeRating: number;
  outfit: string;
  imageKey: string;
  createdAt: string;
  username: string;
  firstName: string;
  lastName: string;
};

function serializeLook(row: SerializedLook) {
  return {
    id: row.id,
    author: `${row.firstName} ${row.lastName}`.trim() || row.username,
    handle: `@${row.username}`,
    avatar: '',
    image: `/api/images/${encodeURIComponent(row.imageKey)}`,
    caption: row.caption,
    outfit: parseOutfit(row.outfit),
    area: row.area,
    location: row.location,
    distance: 'Recently posted',
    placeNote: `Shared by @${row.username}`,
    placeRating: row.placeRating,
    pins: 1,
    views: 0,
    accent: '#d8ff4f',
    comments: [],
    createdAt: row.createdAt,
  };
}

function parseOutfit(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

function textValue(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : '';
}

function sniffImageMime(
  bytes: Uint8Array,
): keyof typeof MIME_EXTENSIONS | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return 'image/jpeg';
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png';
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  ) {
    return 'image/webp';
  }
  return null;
}

function storageError(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  const unavailable =
    message.includes('no such table') || message.includes('binding');
  return Response.json(
    {
      error: unavailable
        ? 'Look storage is not ready. Apply the latest migration and redeploy.'
        : 'Look storage is temporarily unavailable.',
    },
    { status: 500 },
  );
}
