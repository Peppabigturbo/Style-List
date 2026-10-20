'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Search,
  Sparkles,
  UserPlus,
  UsersRound,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Person = {
  username: string;
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  country: string;
  interests: string[];
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
};

type PeopleResponse = {
  people?: Person[];
  needsProfile?: boolean;
  signInPath?: string;
  error?: string;
};

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [query, setQuery] = useState('');
  const [followingOnly, setFollowingOnly] = useState(false);
  const [ready, setReady] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [signInPath, setSignInPath] = useState('');
  const [error, setError] = useState('');
  const [pendingUsername, setPendingUsername] = useState('');

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/people', { cache: 'no-store' })
      .then(async (response) => {
        const result = (await response.json()) as PeopleResponse;
        if (cancelled) return;
        if (response.status === 401) {
          setSignInPath(
            result.signInPath ?? '/signin-with-chatgpt?return_to=%2Fpeople',
          );
          return;
        }
        if (!response.ok) throw new Error(result.error);
        setPeople(result.people ?? []);
        setNeedsProfile(Boolean(result.needsProfile));
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(
            caught instanceof Error ? caught.message : 'Unable to load people.',
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

  const filteredPeople = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return people.filter((person) => {
      if (followingOnly && !person.isFollowing) return false;
      if (!needle) return true;
      return [
        person.firstName,
        person.lastName,
        person.username,
        person.city,
        person.state,
        ...person.interests,
      ].some((value) => value.toLowerCase().includes(needle));
    });
  }, [followingOnly, people, query]);

  const toggleFollow = async (person: Person) => {
    setPendingUsername(person.username);
    setError('');
    try {
      const response = await fetch(
        `/api/follows/${encodeURIComponent(person.username)}`,
        { method: person.isFollowing ? 'DELETE' : 'POST' },
      );
      const result = (await response.json()) as {
        isFollowing?: boolean;
        followerCount?: number;
        signInPath?: string;
        error?: string;
      };
      if (response.status === 401 && result.signInPath) {
        window.location.assign(result.signInPath);
        return;
      }
      if (!response.ok)
        throw new Error(result.error ?? 'Unable to update follow.');

      setPeople((items) =>
        items.map((item) =>
          item.username === person.username
            ? {
                ...item,
                isFollowing: Boolean(result.isFollowing),
                followerCount: result.followerCount ?? item.followerCount,
              }
            : item,
        ),
      );
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Unable to update follow.',
      );
    } finally {
      setPendingUsername('');
    }
  };

  if (!ready) return <LoadingPeople />;
  if (signInPath) return <PeopleGate signInPath={signInPath} />;
  if (needsProfile) return <CreateProfileGate />;

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
          <Link
            className="rounded-full border border-border px-4 py-2 text-xs font-black transition hover:bg-secondary"
            href="/account"
          >
            My profile
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-10">
        <Link
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition hover:text-foreground"
          href="/"
        >
          <ArrowLeft className="size-4" /> Back to discover
        </Link>

        <section className="mt-6 overflow-hidden rounded-[32px] bg-foreground px-6 py-9 text-background sm:px-10 sm:py-12">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              The style network
            </p>
            <h1 className="mt-2 font-display text-[clamp(2.6rem,7vw,5rem)] font-black leading-[0.92] tracking-[-0.065em]">
              People with taste worth tracking.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-background/65">
              Follow the people shaping your city’s style and keep their next
              looks close.
            </p>
          </div>
        </section>

        <section className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search people"
              className="h-12 rounded-full bg-card pl-11"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search names, cities, or styles"
              value={query}
            />
          </div>
          <div className="flex rounded-full bg-secondary p-1">
            <FilterButton
              active={!followingOnly}
              label="Everyone"
              onClick={() => setFollowingOnly(false)}
            />
            <FilterButton
              active={followingOnly}
              label={`Following ${people.filter((person) => person.isFollowing).length}`}
              onClick={() => setFollowingOnly(true)}
            />
          </div>
        </section>

        {error && (
          <p
            className="mt-4 rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}

        {filteredPeople.length ? (
          <section
            className="mt-6 grid gap-4 md:grid-cols-2"
            aria-label="Discover people"
          >
            {filteredPeople.map((person, index) => (
              <PersonCard
                key={person.username}
                person={person}
                index={index}
                pending={pendingUsername === person.username}
                onToggle={toggleFollow}
              />
            ))}
          </section>
        ) : (
          <section className="mt-6 rounded-[28px] border border-dashed border-border bg-card px-6 py-16 text-center">
            <UsersRound className="mx-auto size-8 text-primary" />
            <h2 className="mt-4 font-display text-2xl font-black tracking-[-0.04em]">
              {people.length
                ? 'No people match that search.'
                : 'You’re early to the scene.'}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {people.length
                ? 'Try another name, city, or style interest.'
                : 'Discoverable profiles will appear here as more people join onlook.'}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

function PersonCard({
  person,
  index,
  pending,
  onToggle,
}: {
  person: Person;
  index: number;
  pending: boolean;
  onToggle: (person: Person) => void;
}) {
  const fullName =
    `${person.firstName} ${person.lastName}`.trim() || person.username;
  const initials =
    `${person.firstName[0] ?? ''}${person.lastName[0] ?? ''}`.toUpperCase() ||
    'ON';
  const location = [person.city, person.state].filter(Boolean).join(', ');
  const colors = [
    'bg-[#d8ff4f]',
    'bg-[#ff8fa7]',
    'bg-[#8bd3ff]',
    'bg-[#ffb65b]',
  ];

  return (
    <article className="rounded-[28px] border border-border bg-card p-5 shadow-[0_12px_36px_rgba(25,22,17,0.04)] sm:p-6">
      <div className="flex items-start gap-4">
        <span
          className={`flex size-14 shrink-0 items-center justify-center rounded-2xl font-display text-lg font-black text-foreground ${colors[index % colors.length]}`}
        >
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-xl font-black tracking-[-0.035em]">
            {fullName}
          </h2>
          <p className="text-xs font-semibold text-muted-foreground">
            @{person.username}
          </p>
          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" /> {location || person.country}
          </p>
        </div>
        <Button
          className="rounded-full px-4 font-black"
          disabled={pending}
          onClick={() => onToggle(person)}
          size="sm"
          variant={person.isFollowing ? 'outline' : 'default'}
        >
          {pending ? 'Saving…' : person.isFollowing ? 'Following' : 'Follow'}
          {!person.isFollowing && !pending && <UserPlus className="size-3.5" />}
        </Button>
      </div>
      <div className="mt-5 flex items-center gap-5 border-t border-border pt-4 text-xs">
        <span>
          <strong className="text-sm">{person.followerCount}</strong>{' '}
          <span className="text-muted-foreground">followers</span>
        </span>
        <span>
          <strong className="text-sm">{person.followingCount}</strong>{' '}
          <span className="text-muted-foreground">following</span>
        </span>
      </div>
      {person.interests.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {person.interests.slice(0, 4).map((interest) => (
            <span
              className="rounded-full bg-secondary px-2.5 py-1.5 text-[10px] font-bold"
              key={interest}
            >
              {interest}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={`rounded-full px-4 py-2 text-xs font-black transition ${active ? 'bg-foreground text-background' : 'text-muted-foreground'}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function LoadingPeople() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <span
        aria-label="Loading people"
        className="size-9 animate-pulse rounded-full bg-primary"
      />
    </main>
  );
}

function PeopleGate({ signInPath }: { signInPath: string }) {
  return (
    <Gate
      title="Sign in to find your people."
      description="Follow creators and build a personal style network tied to your secure account."
      action={
        <a
          className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-sm font-black text-primary-foreground"
          href={signInPath}
          target="_top"
        >
          Continue with ChatGPT <Sparkles className="ml-2 size-4" />
        </a>
      }
    />
  );
}

function CreateProfileGate() {
  return (
    <Gate
      title="Create your profile first."
      description="Choose a username and style interests before connecting with the community."
      action={
        <Button
          className="h-12 rounded-full px-7 font-black"
          onClick={() => window.location.assign('/signup')}
        >
          Create profile
        </Button>
      }
    />
  );
}

function Gate({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
        <div className="w-full rounded-[32px] border border-border bg-card p-8 text-center shadow-[0_25px_80px_rgba(25,22,17,0.1)] sm:p-10">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <UsersRound className="size-7" />
          </span>
          <h1 className="mt-6 font-display text-4xl font-black tracking-[-0.055em]">
            {title}
          </h1>
          <p className="mx-auto mb-8 mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
          {action}
          <Link
            className="mx-auto mt-5 block text-sm font-bold text-muted-foreground hover:text-foreground"
            href="/"
          >
            Back to discover
          </Link>
        </div>
      </section>
    </main>
  );
}
