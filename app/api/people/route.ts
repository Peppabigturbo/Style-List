import { and, count, desc, eq, ne } from 'drizzle-orm';

import { chatGPTSignInPath, getChatGPTUser } from '@/app/chatgpt-auth';
import { getDb } from '@/db';
import { follows, profiles } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) {
    return Response.json(
      {
        error: 'Sign in required.',
        signInPath: chatGPTSignInPath('/people'),
      },
      { status: 401 },
    );
  }

  try {
    const db = getDb();
    const [viewerProfile] = await db
      .select({ userId: profiles.userId, username: profiles.username })
      .from(profiles)
      .where(eq(profiles.userId, user.userId))
      .limit(1);

    if (!viewerProfile) {
      return Response.json({ needsProfile: true, people: [] });
    }

    const [people, followedRows, followerCountRows, followingCountRows] =
      await Promise.all([
        db
          .select({
            userId: profiles.userId,
            username: profiles.username,
            firstName: profiles.firstName,
            lastName: profiles.lastName,
            city: profiles.city,
            region: profiles.region,
            country: profiles.country,
            interests: profiles.interests,
          })
          .from(profiles)
          .where(
            and(
              eq(profiles.discoverable, true),
              ne(profiles.userId, user.userId),
            ),
          )
          .orderBy(desc(profiles.createdAt))
          .limit(60),
        db
          .select({ userId: follows.followedUserId })
          .from(follows)
          .where(eq(follows.followerUserId, user.userId)),
        db
          .select({ userId: follows.followedUserId, value: count() })
          .from(follows)
          .groupBy(follows.followedUserId),
        db
          .select({ userId: follows.followerUserId, value: count() })
          .from(follows)
          .groupBy(follows.followerUserId),
      ]);

    const followed = new Set(followedRows.map((row) => row.userId));
    const followerCounts = new Map(
      followerCountRows.map((row) => [row.userId, Number(row.value)]),
    );
    const followingCounts = new Map(
      followingCountRows.map((row) => [row.userId, Number(row.value)]),
    );

    return Response.json({
      needsProfile: false,
      viewer: { username: viewerProfile.username },
      people: people.map((profile) => ({
        username: profile.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
        city: profile.city,
        state: profile.region,
        country: profile.country,
        interests: parseInterests(profile.interests),
        followerCount: followerCounts.get(profile.userId) ?? 0,
        followingCount: followingCounts.get(profile.userId) ?? 0,
        isFollowing: followed.has(profile.userId),
      })),
    });
  } catch (error) {
    return databaseError(error);
  }
}

function parseInterests(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

function databaseError(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  const missingTable = message.includes('no such table');
  return Response.json(
    {
      error: missingTable
        ? 'The follow database is not ready. Apply the latest migration and redeploy.'
        : 'People are temporarily unavailable.',
    },
    { status: 500 },
  );
}
