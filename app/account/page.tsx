'use client';

import { type SyntheticEvent, useEffect, useState } from 'react';
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
  Pencil,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type AccountProfile = {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  city: string;
  state: string;
  country: string;
  interests: string[];
  discoverable: boolean;
  updatesAccepted: boolean;
  createdAt: string;
};

type ActivityCounts = { looks: number; followers: number; following: number };

const styleInterests = [
  'Streetwear',
  'Minimal',
  'Vintage',
  'Luxury',
  'Sneakers',
  'Workwear',
  'Avant-garde',
  'Sustainable',
];

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
  const [editOpen, setEditOpen] = useState(false);
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [editDiscoverable, setEditDiscoverable] = useState(true);
  const [editUpdatesAccepted, setEditUpdatesAccepted] = useState(false);
  const [editError, setEditError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState('');

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

  const openProfileEditor = () => {
    if (!profile) return;
    setEditInterests(profile.interests);
    setEditDiscoverable(profile.discoverable);
    setEditUpdatesAccepted(profile.updatesAccepted);
    setEditError('');
    setEditOpen(true);
  };

  const toggleEditInterest = (interest: string) => {
    setEditInterests((items) =>
      items.includes(interest)
        ? items.filter((item) => item !== interest)
        : [...items, interest],
    );
  };

  const saveProfile = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSavingProfile(true);
    setEditError('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          username: formText(data, 'username'),
          firstName: formText(data, 'firstName'),
          lastName: formText(data, 'lastName'),
          birthDate: formText(data, 'birthDate'),
          city: formText(data, 'city'),
          state: formText(data, 'state'),
          country: formText(data, 'country'),
          interests: editInterests,
          discoverable: editDiscoverable,
          updatesAccepted: editUpdatesAccepted,
        }),
      });
      const result = (await response.json()) as {
        profile?: AccountProfile;
        error?: string;
        signInPath?: string;
      };

      if (response.status === 401 && result.signInPath) {
        window.location.assign(result.signInPath);
        return;
      }
      if (!response.ok || !result.profile) {
        throw new Error(result.error || 'Unable to update your profile.');
      }

      setProfile(result.profile);
      setEditOpen(false);
      setProfileNotice('Profile updated');
      window.setTimeout(() => setProfileNotice(''), 2600);
    } catch (error) {
      setEditError(
        error instanceof Error
          ? error.message
          : 'Unable to update your profile.',
      );
    } finally {
      setSavingProfile(false);
    }
  };

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
              <Link
                className="inline-flex h-12 items-center justify-center rounded-full border border-input bg-background px-7 text-sm font-black shadow-xs transition hover:bg-accent hover:text-accent-foreground"
                href="/"
                target="_top"
              >
                Back to discovery
              </Link>
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
          target="_top"
        >
          <ArrowLeft className="size-4" /> Back to discovery
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
                onClick={openProfileEditor}
              >
                Edit profile <Pencil className="size-4" />
              </Button>
              <Button
                className="h-11 rounded-full px-5 font-black"
                onClick={() => window.location.assign('/people')}
                variant="outline"
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

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (!savingProfile) setEditOpen(open);
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[28px] sm:max-w-2xl">
          <DialogHeader>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
              Account settings
            </p>
            <DialogTitle className="font-display text-3xl font-black tracking-[-0.05em]">
              Edit your profile
            </DialogTitle>
            <DialogDescription>
              Update how you appear across discovery, people, and your posted
              looks. Your ChatGPT email stays private and cannot be changed
              here.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-6" onSubmit={saveProfile}>
            <div className="grid gap-4 sm:grid-cols-2">
              <EditField
                defaultValue={profile.firstName}
                id="edit-first-name"
                label="First name"
                name="firstName"
              />
              <EditField
                defaultValue={profile.lastName}
                id="edit-last-name"
                label="Last name"
                name="lastName"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <EditField
                defaultValue={profile.username}
                id="edit-username"
                label="Username"
                name="username"
                pattern="[A-Za-z0-9._]{3,20}"
              />
              <EditField
                defaultValue={profile.birthDate}
                id="edit-birth-date"
                label="Date of birth"
                name="birthDate"
                type="date"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <EditField
                defaultValue={profile.city}
                id="edit-city"
                label="City"
                name="city"
              />
              <EditField
                defaultValue={profile.state}
                id="edit-state"
                label="State / province"
                name="state"
              />
              <EditField
                defaultValue={profile.country}
                id="edit-country"
                label="Country"
                name="country"
              />
            </div>

            <div>
              <Label className="mb-3">Style interests</Label>
              <div className="flex flex-wrap gap-2">
                {styleInterests.map((interest) => {
                  const selected = editInterests.includes(interest);
                  return (
                    <button
                      aria-pressed={selected}
                      className={`rounded-full border px-3 py-2 text-xs font-bold transition ${
                        selected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card hover:border-foreground/30'
                      }`}
                      key={interest}
                      onClick={() => toggleEditInterest(interest)}
                      type="button"
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-border bg-secondary/45 p-4">
              <SettingToggle
                checked={editDiscoverable}
                description="Let people find your profile and public looks."
                label="Discoverable profile"
                onCheckedChange={setEditDiscoverable}
              />
              <SettingToggle
                checked={editUpdatesAccepted}
                description="Receive occasional style and product updates."
                label="Style updates"
                onCheckedChange={setEditUpdatesAccepted}
              />
            </div>

            {editError && (
              <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive">
                {editError}
              </p>
            )}

            <DialogFooter className="-mx-4 mt-6 rounded-b-[28px]">
              <Button
                className="h-11 rounded-full px-6 font-black"
                disabled={savingProfile}
                type="submit"
              >
                {savingProfile ? 'Saving…' : 'Save changes'}
                <Save className="size-4" />
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {profileNotice && (
        <output className="fixed left-1/2 top-20 z-[70] -translate-x-1/2 rounded-full bg-foreground px-4 py-2.5 text-xs font-bold text-background shadow-xl">
          {profileNotice}
        </output>
      )}
    </main>
  );
}

function EditField({
  id,
  label,
  name,
  defaultValue,
  pattern,
  type = 'text',
}: {
  id: string;
  label: string;
  name: string;
  defaultValue: string;
  pattern?: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        className="h-11 rounded-xl bg-background"
        defaultValue={defaultValue}
        id={id}
        name={name}
        pattern={pattern}
        required
        type={type}
      />
    </div>
  );
}

function SettingToggle({
  checked,
  label,
  description,
  onCheckedChange,
}: {
  checked: boolean;
  label: string;
  description: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-black">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        aria-label={label}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

function formText(data: FormData, key: string) {
  const value = data.get(key);
  return typeof value === 'string' ? value.trim() : '';
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
