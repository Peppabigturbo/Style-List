import { and, count, eq } from 'drizzle-orm';

import { chatGPTSignInPath, getChatGPTUser } from '@/app/chatgpt-auth';
import { getDb } from '@/db';
import { follows, profiles } from '@/db/schema';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ username: string }> };

export async function POST(_request: Request, context: RouteContext) {
  return updateFollow(context, true);
}

export async function DELETE(_request: Request, context: RouteContext) {
  return updateFollow(context, false);
}

async function updateFollow(context: RouteContext, shouldFollow: boolean) {
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

  const { username: rawUsername } = await context.params;
  const username = rawUsername.trim().toLowerCase();
  if (!/^[a-z0-9._]{3,20}$/.test(username)) {
    return Response.json({ error: 'Invalid username.' }, { status: 400 });
  }

  try {
    const db = getDb();
    const [[viewer], [target]] = await Promise.all([
      db
        .select({ userId: profiles.userId })
        .from(profiles)
        .where(eq(profiles.userId, user.userId))
        .limit(1),
      db
        .select({
          userId: profiles.userId,
          discoverable: profiles.discoverable,
        })
        .from(profiles)
        .where(eq(profiles.username, username))
        .limit(1),
    ]);

    if (!viewer) {
      return Response.json(
        { error: 'Create your profile before following people.' },
        { status: 409 },
      );
    }
    if (!target) {
      return Response.json({ error: 'Profile not found.' }, { status: 404 });
    }
    if (target.userId === user.userId) {
      return Response.json(
        { error: 'You cannot follow yourself.' },
        { status: 400 },
      );
    }
    if (shouldFollow && !target.discoverable) {
      return Response.json(
        { error: 'This profile is not discoverable.' },
        { status: 403 },
      );
    }

    const relationship = and(
      eq(follows.followerUserId, user.userId),
      eq(follows.followedUserId, target.userId),
    );

    if (shouldFollow) {
      await db
        .insert(follows)
        .values({
          followerUserId: user.userId,
          followedUserId: target.userId,
          createdAt: new Date().toISOString(),
        })
        .onConflictDoNothing();
    } else {
      await db.delete(follows).where(relationship);
    }

    const [[currentRelationship], [followerCount]] = await Promise.all([
      db
        .select({ followedUserId: follows.followedUserId })
        .from(follows)
        .where(relationship)
        .limit(1),
      db
        .select({ value: count() })
        .from(follows)
        .where(eq(follows.followedUserId, target.userId)),
    ]);

    return Response.json({
      username,
      isFollowing: Boolean(currentRelationship),
      followerCount: Number(followerCount?.value ?? 0),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    return Response.json(
      {
        error: message.includes('no such table')
          ? 'The follow database is not ready. Apply the latest migration and redeploy.'
          : 'Unable to update this follow right now.',
      },
      { status: 500 },
    );
  }
}
