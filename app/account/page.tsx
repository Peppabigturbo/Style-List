'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  AtSign,
  Bookmark,
  CalendarDays,
  Compass,
  Eye,
  EyeOff,
  LogOut,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

type AccountProfile = {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  country: string;
  interests: string[];
  discoverable: boolean;
  updatesAccepted: boolean;
  createdAt: string;
};

type ActivityCounts = { looks: number; followers: number; following: number };

const profileImage =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=88';

export default function AccountPage() {
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [signInPath, setSignInPath] = useState(
    '/signin-with-chatgpt?return_to=%2Faccount',
  );
  const [signOutPath, setSignOutPath] = useState(
    '/signout-with-chatgpt?return_to=%2F',
  );
  const [authenticated, setAuthenticated] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [activity, setActivity] = useState<ActivityCounts>({
    looks: 0,
    followers: 0,
    following: 0,
  });

  useEffect(() => {
    let cancelled = false;

    void fetch('/api/profile', { cache: 'no-store' })
      .then(async (response) => {
        const result = (await response.json()) as {
          profile?: AccountProfile | null;
          signInPath?: string;
          signOutPath?: string;
          activity?: ActivityCounts;
          error?: string;
        };
        if (cancelled) return;
        if (response.status === 401) {
          setSignInPath(
            result.signInPath ?? '/signin-with-chatgpt?return_to=%2Faccount',
          );
          return;
        }
        if (!response.ok) throw new Error(result.error);

        setAuthenticated(true);
        setProfile(result.profile ?? null);
        if (result.activity) setActivity(result.activity);
        if (result.signOutPath) setSignOutPath(result.signOutPath);
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : 'Unable to load your account.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <span
          className="size-8 animate-pulse rounded-full bg-primary"
          aria-label="Loading account"
        />
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <div className="max-w-md rounded-[28px] border border-border bg-card p-8 text-center">
          <p className="text-sm font-bold text-destructive">{loadError}</p>
          <Button
            className="mt-5 rounded-full"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6">
        <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl items-center justify-center">
          <div className="w-full rounded-[32px] border border-border bg-card p-7 text-center shadow-[0_25px_80px_rgba(25,22,17,0.1)] sm:p-10">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <ShieldCheck className="size-7" />
            </span>
            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              Your account
            </p>
            <h1 className="mt-2 font-display text-4xl font-black tracking-[-0.055em]">
              Sign in to see your style profile.
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Your profile and future saved looks stay connected to your secure
              ChatGPT identity.
            </p>
            <a
              className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-sm font-black text-primary-foreground"
              href={signInPath}
              target="_top"
            >
              Continue with ChatGPT <Sparkles className="ml-2 size-4" />
            </a>
          </div>
        </section>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6">
        <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl items-center justify-center">
          <div className="w-full rounded-[32px] border border-border bg-card p-7 text-center shadow-[0_25px_80px_rgba(25,22,17,0.1)] sm:p-10">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary">
              <UserRound className="size-7" />
            </span>
            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              Your account
            </p>
            <h1 className="mt-2 font-display text-4xl font-black tracking-[-0.055em]">
              Create your style identity.
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              You’re signed in securely. Add your public style details to start
              posting looks and saving inspiration.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                className="h-12 rounded-full px-7 font-black"
                onClick={() => window.location.assign('/signup')}
              >
                Create account <Sparkles className="size-4" />
              </Button>
              <Button
                className="h-12 rounded-full px-7 font-black"
                onClick={() => window.location.assign('/')}
                variant="outline"
              >
                Back to discover
              </Button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const fullName =
    [profile.firstName, profile.lastName].filter(Boolean).join(' ') ||
    profile.username;
  const initials =
    [profile.firstName, profile.lastName]
      .filter(Boolean)
      .map((name) => name[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'YS';
  const location = [profile.city, profile.state, profile.country]
    .filter(Boolean)
    .join(', ');
  const joined = profile.createdAt
    ? new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(
        new Date(profile.createdAt),
      )
    : 'Recently';

  return (
    <main className="min-h-screen bg-background pb-16 text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            className="font-display text-2xl font-black tracking-[-0.08em]"
            href="/"
          >
            onlook<span className="text-primary">°</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-right sm:block">
              <span className="block text-xs font-black">{fullName}</span>
              <span className="block text-[10px] text-muted-foreground">
                @{profile.username}
              </span>
            </span>
            <Avatar className="size-9 ring-2 ring-primary/35">
              <AvatarImage alt={fullName} src={profileImage} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <a
              aria-label="Sign out"
              className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              href={signOutPath}
              target="_top"
            >
              <LogOut className="size-4" />
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-10">
        <Link
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition hover:text-foreground"
          href="/"
        >
          <ArrowLeft className="size-4" /> Back to discover
        </Link>

        <section className="relative overflow-hidden rounded-[32px] bg-foreground px-6 py-8 text-background sm:px-10 sm:py-10">
          <div className="absolute -right-14 -top-24 size-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar className="size-24 border-4 border-background/15 sm:size-28">
                <AvatarImage
                  alt={fullName}
                  className="object-cover"
                  src={profileImage}
                />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                  Style profile
                </p>
                <h1 className="mt-1 font-display text-4xl font-black tracking-[-0.055em] sm:text-5xl">
                  {fullName}
                </h1>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-background/65">
                  <AtSign className="size-3.5" /> {profile.username}
                </p>
                {location && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-background/65">
                    <MapPin className="size-3.5" /> {location}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                className="h-11 rounded-full px-5 font-black"
                onClick={() => window.location.assign('/people')}
              >
                Find people <UsersRound className="size-4" />
              </Button>
              <Button
                className="h-11 rounded-full px-5 font-black"
                onClick={() => window.location.assign('/')}
                variant="outline"
              >
                Explore looks
              </Button>
            </div>
          </div>
        </section>

        <section
          className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4"
          aria-label="Account activity"
        >
          {[
            { label: 'Looks', value: String(activity.looks), icon: Compass },
            {
              label: 'Followers',
              value: String(activity.followers),
              icon: UsersRound,
            },
            {
              label: 'Following',
              value: String(activity.following),
              icon: UserRound,
            },
            { label: 'Saved', value: '0', icon: Bookmark },
          ].map(({ label, value, icon: Icon }) => (
            <div
              className="rounded-[22px] border border-border bg-card p-4 sm:p-5"
              key={label}
            >
              <Icon className="mb-4 size-4 text-primary" />
              <p className="font-display text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                {value}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {label}
              </p>
            </div>
          ))}
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[28px] border border-border bg-card p-6 sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                  Personal details
                </p>
                <h2 className="mt-1 font-display text-2xl font-black tracking-[-0.04em]">
                  Account information
                </h2>
              </div>
              <ShieldCheck className="size-6 text-primary" />
            </div>
            <dl className="divide-y divide-border">
              <Detail label="Email" value={profile.email} />
              <Detail label="Username" value={`@${profile.username}`} />
              <Detail label="Location" value={location || 'Not added'} />
              <Detail
                label="Member since"
                value={joined}
                icon={<CalendarDays className="size-3.5" />}
              />
            </dl>
          </section>

          <div className="grid gap-5">
            <section className="rounded-[28px] border border-border bg-card p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                Your taste
              </p>
              <h2 className="mt-1 font-display text-2xl font-black tracking-[-0.04em]">
                Style interests
              </h2>
              {profile.interests.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span
                      className="rounded-full bg-secondary px-3 py-2 text-xs font-bold"
                      key={interest}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  No interests selected yet.
                </p>
              )}
            </section>

            <section className="rounded-[28px] border border-border bg-card p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                Privacy
              </p>
              <h2 className="mt-1 font-display text-2xl font-black tracking-[-0.04em]">
                Profile visibility
              </h2>
              <div className="mt-5 flex items-start gap-3 rounded-2xl bg-secondary/70 p-4">
                {profile.discoverable ? (
                  <Eye className="mt-0.5 size-4 shrink-0" />
                ) : (
                  <EyeOff className="mt-0.5 size-4 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-black">
                    {profile.discoverable ? 'Discoverable' : 'Private'}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {profile.discoverable
                      ? 'People can find your profile and your public looks.'
                      : 'Your profile stays out of discovery.'}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function Detail({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 py-4 first:pt-0 last:pb-0 sm:grid-cols-[120px_1fr] sm:items-center">
      <dt className="text-xs font-bold text-muted-foreground">{label}</dt>
      <dd className="flex items-center gap-1.5 break-all text-sm font-semibold sm:justify-end sm:text-right">
        {icon}
        {value}
      </dd>
    </div>
  );
}
