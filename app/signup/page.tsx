'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';

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

const countries = [
  'United States',
  'Canada',
  'United Kingdom',
  'France',
  'Germany',
  'Italy',
  'Japan',
  'South Korea',
  'Nigeria',
  'South Africa',
  'Australia',
  'Brazil',
  'Mexico',
  'Other',
];

type FormErrors = Partial<
  Record<
    | 'email'
    | 'username'
    | 'password'
    | 'confirmPassword'
    | 'birthDate'
    | 'firstName'
    | 'lastName'
    | 'city'
    | 'state'
    | 'country'
    | 'terms',
    string
  >
>;

export default function SignupPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [updatesAccepted, setUpdatesAccepted] = useState(false);
  const [discoverable, setDiscoverable] = useState(true);
  const [interests, setInterests] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [complete, setComplete] = useState(false);
  const [createdName, setCreatedName] = useState('');

  const passwordRules = useMemo(
    () => [
      { label: '8+ characters', met: password.length >= 8 },
      { label: 'Uppercase', met: /[A-Z]/.test(password) },
      { label: 'Lowercase', met: /[a-z]/.test(password) },
      { label: 'Number', met: /\d/.test(password) },
    ],
    [password],
  );

  const toggleInterest = (interest: string) => {
    setInterests((items) =>
      items.includes(interest) ? items.filter((item) => item !== interest) : [...items, interest],
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const nextErrors: FormErrors = {};
    const email = String(data.get('email') || '').trim();
    const username = String(data.get('username') || '').trim();
    const birthDate = String(data.get('birthDate') || '');
    const firstName = String(data.get('firstName') || '').trim();
    const lastName = String(data.get('lastName') || '').trim();
    const city = String(data.get('city') || '').trim();
    const state = String(data.get('state') || '').trim();
    const country = String(data.get('country') || '').trim();

    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = 'Enter a valid email address.';
    if (!/^[a-zA-Z0-9._]{3,20}$/.test(username)) {
      nextErrors.username = 'Use 3–20 letters, numbers, periods, or underscores.';
    }
    if (!passwordRules.every((rule) => rule.met)) {
      nextErrors.password = 'Your password needs to meet all four requirements.';
    }
    if (password !== confirmPassword) nextErrors.confirmPassword = 'The passwords do not match.';
    if (!birthDate) nextErrors.birthDate = 'Enter your date of birth.';
    if (!firstName) nextErrors.firstName = 'Enter your first name.';
    if (!lastName) nextErrors.lastName = 'Enter your last name.';
    if (!city) nextErrors.city = 'Enter your city.';
    if (!state) nextErrors.state = 'Enter your state or province.';
    if (!country) nextErrors.country = 'Select your country.';
    if (!termsAccepted) nextErrors.terms = 'You must agree before creating an account.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      window.localStorage.setItem(
        'stylelist.accountProfile',
        JSON.stringify({
          email,
          username,
          firstName,
          lastName,
          city,
          state,
          country,
          interests,
          discoverable,
          updatesAccepted,
          createdAt: new Date().toISOString(),
        }),
      );
    } catch {
      // Account details remain available for this session if browser storage is unavailable.
    }

    setCreatedName(firstName || username);
    setComplete(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (complete) {
    return (
      <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6">
        <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
          <div className="w-full rounded-[32px] border border-border bg-card p-7 text-center shadow-[0_25px_80px_rgba(25,22,17,0.1)] sm:p-10">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CheckCircle2 className="size-8" />
            </span>
            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Account created</p>
            <h1 className="mt-2 font-display text-4xl font-black tracking-[-0.055em]">Welcome, {createdName}.</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Your profile is ready. Start rating looks, saving inspiration, and pinning your own style to the map.
            </p>
            <Button className="mt-8 h-12 rounded-full px-7 font-black" onClick={() => window.location.assign('/account')}>
              Open my account <Sparkles className="size-4" />
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[minmax(340px,0.82fr)_minmax(600px,1.18fr)]">
        <aside className="relative hidden min-h-screen overflow-hidden bg-foreground lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 grid grid-cols-2 gap-2 p-2 opacity-70">
            <img
              alt="Street style in the city"
              className="h-full w-full rounded-[26px] object-cover"
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85"
            />
            <div className="grid gap-2">
              <img
                alt="Personal fashion details"
                className="h-full min-h-0 w-full rounded-[26px] object-cover"
                src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=85"
              />
              <img
                alt="Modern city style"
                className="h-full min-h-0 w-full rounded-[26px] object-cover"
                src="https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=700&q=85"
              />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/10" />
          <a className="relative z-10 m-8 w-fit font-display text-2xl font-black tracking-[-0.08em] text-white" href="/">
            onlook<span className="text-primary">°</span>
          </a>
          <div className="relative z-10 p-8 text-white xl:p-12">
            <div className="mb-5 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <MapPin className="size-5" />
            </div>
            <h2 className="max-w-md font-display text-4xl font-black leading-[0.98] tracking-[-0.055em] xl:text-5xl">
              Your style belongs on the map.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              Join people discovering what the city wears—and where every look comes alive.
            </p>
          </div>
        </aside>

        <section className="px-4 py-6 sm:px-8 lg:px-12 lg:py-10 xl:px-20">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 flex items-center justify-between">
              <a className="flex items-center gap-2 text-sm font-bold text-muted-foreground transition hover:text-foreground" href="/">
                <ArrowLeft className="size-4" /> Back to discover
              </a>
              <span className="font-display text-xl font-black tracking-[-0.07em] lg:hidden">
                onlook<span className="text-primary">°</span>
              </span>
            </div>

            <div className="mb-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Create your account</p>
              <h1 className="mt-2 font-display text-[clamp(2.4rem,7vw,4rem)] font-black leading-[0.95] tracking-[-0.06em]">
                Make the city your runway.
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Build your profile, find your scene, and start sharing the looks that feel like you.
              </p>
            </div>

            <form className="space-y-8" noValidate onSubmit={handleSubmit}>
              <fieldset className="space-y-4">
                <legend className="mb-4 flex items-center gap-2 text-sm font-black">
                  <span className="flex size-7 items-center justify-center rounded-full bg-foreground text-xs text-background">1</span>
                  Your account
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Email address" error={errors.email} htmlFor="email">
                    <Input aria-invalid={Boolean(errors.email)} className="h-11 rounded-xl" id="email" name="email" placeholder="you@example.com" type="email" />
                  </Field>
                  <Field label="Create a username" error={errors.username} hint="3–20 characters" htmlFor="username">
                    <Input aria-invalid={Boolean(errors.username)} autoCapitalize="none" className="h-11 rounded-xl" id="username" name="username" placeholder="yourstyle" />
                  </Field>
                  <Field label="Password" error={errors.password} htmlFor="password">
                    <div className="relative">
                      <Input
                        aria-invalid={Boolean(errors.password)}
                        className="h-11 rounded-xl pr-10"
                        id="password"
                        name="password"
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Create a strong password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                      />
                      <button
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowPassword((value) => !value)}
                        type="button"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </Field>
                  <Field label="Confirm password" error={errors.confirmPassword} htmlFor="confirmPassword">
                    <Input
                      aria-invalid={Boolean(errors.confirmPassword)}
                      className="h-11 rounded-xl"
                      id="confirmPassword"
                      name="confirmPassword"
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Repeat your password"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-secondary/70 p-3 sm:grid-cols-4">
                  {passwordRules.map((rule) => (
                    <span className={`flex items-center gap-1.5 text-[10px] font-bold ${rule.met ? 'text-foreground' : 'text-muted-foreground'}`} key={rule.label}>
                      <span className={`flex size-4 items-center justify-center rounded-full ${rule.met ? 'bg-primary text-primary-foreground' : 'border border-border'}`}>
                        {rule.met && <Check className="size-2.5" />}
                      </span>
                      {rule.label}
                    </span>
                  ))}
                </div>
              </fieldset>

              <fieldset className="space-y-4 border-t border-border pt-8">
                <legend className="mb-4 flex items-center gap-2 text-sm font-black">
                  <span className="flex size-7 items-center justify-center rounded-full bg-foreground text-xs text-background">2</span>
                  About you
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="First name" error={errors.firstName} htmlFor="firstName">
                    <Input aria-invalid={Boolean(errors.firstName)} className="h-11 rounded-xl" id="firstName" name="firstName" placeholder="First name" required />
                  </Field>
                  <Field label="Last name" error={errors.lastName} htmlFor="lastName">
                    <Input aria-invalid={Boolean(errors.lastName)} className="h-11 rounded-xl" id="lastName" name="lastName" placeholder="Last name" required />
                  </Field>
                  <Field label="Date of birth" error={errors.birthDate} hint="Used for age eligibility" htmlFor="birthDate">
                    <Input aria-invalid={Boolean(errors.birthDate)} className="h-11 rounded-xl" id="birthDate" name="birthDate" type="date" />
                  </Field>
                  <Field label="City" error={errors.city} htmlFor="city">
                    <Input aria-invalid={Boolean(errors.city)} className="h-11 rounded-xl" id="city" name="city" placeholder="New York" required />
                  </Field>
                  <Field label="State / province" error={errors.state} htmlFor="state">
                    <Input aria-invalid={Boolean(errors.state)} className="h-11 rounded-xl" id="state" name="state" placeholder="New York" required />
                  </Field>
                  <Field label="Country" error={errors.country} htmlFor="country">
                    <NativeSelect aria-invalid={Boolean(errors.country)} className="w-full" id="country" name="country" required>
                      <NativeSelectOption value="">Select your country</NativeSelectOption>
                      {countries.map((country) => (
                        <NativeSelectOption key={country} value={country}>{country}</NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </Field>
                </div>
                <p className="flex items-start gap-2 rounded-2xl bg-secondary/70 p-3 text-xs leading-relaxed text-muted-foreground">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  We only ask for city, state, and country—never your street address.
                </p>
              </fieldset>

              <fieldset className="space-y-4 border-t border-border pt-8">
                <legend className="mb-4 flex items-center gap-2 text-sm font-black">
                  <span className="flex size-7 items-center justify-center rounded-full bg-foreground text-xs text-background">3</span>
                  Make it yours
                </legend>
                <div>
                  <Label className="mb-2">Style interests <span className="font-normal text-muted-foreground">(optional)</span></Label>
                  <div className="flex flex-wrap gap-2">
                    {styleInterests.map((interest) => {
                      const selected = interests.includes(interest);
                      return (
                        <button
                          aria-pressed={selected}
                          className={`rounded-full border px-3 py-2 text-xs font-bold transition ${
                            selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-foreground/30'
                          }`}
                          key={interest}
                          onClick={() => toggleInterest(interest)}
                          type="button"
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
                  <CheckRow
                    checked={discoverable}
                    description="Let people find your looks and follow your style."
                    label="Make my profile discoverable"
                    onCheckedChange={setDiscoverable}
                  />
                  <CheckRow
                    checked={updatesAccepted}
                    description="Occasional trend edits and product news."
                    label="Send me style updates"
                    onCheckedChange={setUpdatesAccepted}
                  />
                  <div className="border-t border-border pt-4">
                    <CheckRow
                      checked={termsAccepted}
                      description="I agree to the Terms of Use and acknowledge the Privacy Policy."
                      error={errors.terms}
                      label="Terms and privacy"
                      onCheckedChange={setTermsAccepted}
                    />
                  </div>
                </div>
              </fieldset>

              <div className="flex flex-col items-center gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
                <p className="text-xs text-muted-foreground">Already have an account? <button className="font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4" type="button">Sign in</button></p>
                <Button className="h-12 w-full rounded-full px-7 font-black sm:w-auto" type="submit">
                  Create my account <UserRound className="size-4" />
                </Button>
              </div>
              <p className="flex items-center justify-center gap-1.5 text-center text-[10px] text-muted-foreground">
                <LockKeyhole className="size-3" /> Your account information is kept private and secure.
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1.5 text-xs font-medium text-destructive" role="alert">{error}</p>}
    </div>
  );
}

function CheckRow({
  checked,
  label,
  description,
  error,
  onCheckedChange,
}: {
  checked: boolean;
  label: string;
  description: string;
  error?: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onCheckedChange(event.target.checked)}
          className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-border accent-primary"
        />
        <span>
          <span className="block text-sm font-bold">{label}</span>
          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{description}</span>
        </span>
      </label>
      {error && <p className="ml-7 mt-1 text-xs font-medium text-destructive" role="alert">{error}</p>}
    </div>
  );
}
