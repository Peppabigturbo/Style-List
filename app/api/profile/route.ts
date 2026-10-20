import { eq } from 'drizzle-orm';

import {
  chatGPTSignInPath,
  chatGPTSignOutPath,
  getChatGPTUser,
} from '@/app/chatgpt-auth';
import { getDb } from '@/db';
import { profiles } from '@/db/schema';

export const dynamic = 'force-dynamic';

type ProfileInput = {
  username?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  birthDate?: unknown;
  city?: unknown;
  state?: unknown;
  country?: unknown;
  interests?: unknown;
  discoverable?: unknown;
  updatesAccepted?: unknown;
};

const ALLOWED_INTERESTS = new Set([
  'Streetwear',
  'Minimal',
  'Vintage',
  'Luxury',
  'Sneakers',
  'Workwear',
  'Avant-garde',
  'Sustainable',
]);

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return unauthenticated('/account');

  try {
    const db = getDb();
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.userId))
      .limit(1);

    return Response.json({
      user: { email: user.email, displayName: user.displayName },
      profile: profile ? serializeProfile(profile) : null,
      signOutPath: chatGPTSignOutPath('/'),
    });
  } catch (error) {
    return databaseError(error);
  }
}

export async function PUT(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return unauthenticated('/signup');

  let payload: ProfileInput;
  try {
    payload = (await request.json()) as ProfileInput;
  } catch {
    return Response.json({ error: 'Invalid JSON request.' }, { status: 400 });
  }

  const validation = validateProfile(payload);
  if ('error' in validation) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  const now = new Date().toISOString();
  const values = {
    userId: user.userId,
    email: user.email,
    ...validation.profile,
    interests: JSON.stringify(validation.profile.interests),
    createdAt: now,
    updatedAt: now,
  };

  try {
    const db = getDb();
    const [profile] = await db
      .insert(profiles)
      .values(values)
      .onConflictDoUpdate({
        target: profiles.userId,
        set: {
          email: values.email,
          username: values.username,
          firstName: values.firstName,
          lastName: values.lastName,
          birthDate: values.birthDate,
          city: values.city,
          region: values.region,
          country: values.country,
          interests: values.interests,
          discoverable: values.discoverable,
          updatesAccepted: values.updatesAccepted,
          updatedAt: now,
        },
      })
      .returning();

    return Response.json({ profile: serializeProfile(profile) });
  } catch (error) {
    const message = errorText(error);
    if (
      message.includes('UNIQUE constraint failed') &&
      message.includes('username')
    ) {
      return Response.json(
        { error: 'That username is already taken.' },
        { status: 409 },
      );
    }
    return databaseError(error);
  }
}

function validateProfile(payload: ProfileInput) {
  const username = textValue(payload.username).toLowerCase();
  const firstName = textValue(payload.firstName);
  const lastName = textValue(payload.lastName);
  const birthDate = textValue(payload.birthDate);
  const city = textValue(payload.city);
  const region = textValue(payload.state);
  const country = textValue(payload.country);
  const interests = Array.isArray(payload.interests)
    ? payload.interests
        .filter(
          (value): value is string =>
            typeof value === 'string' && ALLOWED_INTERESTS.has(value),
        )
        .slice(0, 12)
    : [];

  if (!/^[a-z0-9._]{3,20}$/.test(username)) {
    return {
      error:
        'Username must use 3–20 letters, numbers, periods, or underscores.',
    };
  }
  if (!firstName || !lastName || !city || !region || !country) {
    return { error: 'Complete all required profile fields.' };
  }
  const parsedBirthDate = new Date(`${birthDate}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(birthDate) ||
    Number.isNaN(parsedBirthDate.getTime()) ||
    parsedBirthDate.toISOString().slice(0, 10) !== birthDate
  ) {
    return { error: 'Enter a valid date of birth.' };
  }
  if (parsedBirthDate >= new Date()) {
    return { error: 'Date of birth must be in the past.' };
  }

  return {
    profile: {
      username,
      firstName: firstName.slice(0, 80),
      lastName: lastName.slice(0, 80),
      birthDate,
      city: city.slice(0, 100),
      region: region.slice(0, 100),
      country: country.slice(0, 100),
      interests,
      discoverable: payload.discoverable !== false,
      updatesAccepted: payload.updatesAccepted === true,
    },
  };
}

function textValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function serializeProfile(profile: typeof profiles.$inferSelect) {
  let interests: string[] = [];
  try {
    const parsed = JSON.parse(profile.interests) as unknown;
    if (Array.isArray(parsed)) {
      interests = parsed.filter(
        (value): value is string => typeof value === 'string',
      );
    }
  } catch {
    interests = [];
  }

  return {
    email: profile.email,
    username: profile.username,
    firstName: profile.firstName,
    lastName: profile.lastName,
    birthDate: profile.birthDate,
    city: profile.city,
    state: profile.region,
    country: profile.country,
    interests,
    discoverable: profile.discoverable,
    updatesAccepted: profile.updatesAccepted,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

function unauthenticated(returnTo: string) {
  return Response.json(
    { error: 'Sign in required.', signInPath: chatGPTSignInPath(returnTo) },
    { status: 401 },
  );
}

function databaseError(error: unknown) {
  const message = errorText(error);
  const missingTable =
    message.includes('no such table') || message.includes('profiles');
  return Response.json(
    {
      error: missingTable
        ? 'The profile database is not ready. Apply the generated migration and redeploy.'
        : 'The profile service is temporarily unavailable.',
    },
    { status: 500 },
  );
}

function errorText(error: unknown) {
  if (!(error instanceof Error)) return 'Unexpected database error.';
  const cause = error.cause instanceof Error ? error.cause.message : '';
  return `${error.message}\n${cause}`;
}
