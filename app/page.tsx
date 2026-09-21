'use client';

import { FormEvent, PointerEvent, useMemo, useRef, useState } from 'react';
import {
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Heart,
  ImagePlus,
  Map,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Send,
  Shirt,
  Sparkles,
  Star,
  UserRound,
  X,
} from 'lucide-react';

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
import { Textarea } from '@/components/ui/textarea';

type Look = {
  id: number;
  author: string;
  handle: string;
  avatar: string;
  image: string;
  caption: string;
  outfit: string[];
  area: string;
  location: string;
  distance: string;
  placeNote: string;
  placeRating: number;
  pins: number;
  accent: string;
  comments: { name: string; text: string; avatar?: string }[];
};

const INITIAL_LOOKS: Look[] = [
  {
    id: 1,
    author: 'Maya Chen',
    handle: '@mayawears',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    image:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=88',
    caption: 'Red leather, grey skies. The city understood the assignment.',
    outfit: [
      'Vintage moto jacket — Depop find',
      'Ribbed tank — COS',
      'Wide-leg trousers — Aritzia',
      'Square-toe boots — Vagabond',
      'Mini shoulder bag — BY FAR',
    ],
    area: 'SoHo',
    location: 'Prince & Mercer',
    distance: '0.3 mi',
    placeNote: 'Cobblestone, cast-iron façades, best after 4pm.',
    placeRating: 4.7,
    pins: 82,
    accent: '#d8ff4f',
    comments: [
      {
        name: 'Noah',
        text: 'That red against the stone is perfect.',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80',
      },
      {
        name: 'Jules',
        text: 'Need the jacket ID immediately.',
        avatar:
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=80&q=80',
      },
    ],
  },
  {
    id: 2,
    author: 'Sloane Brooks',
    handle: '@sloaneb',
    avatar:
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=120&q=80',
    image:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=88',
    caption: 'Soft tailoring and a little Lower East Side attitude.',
    outfit: [
      'Relaxed blazer — Frankie Shop',
      'Silk slip dress — Réalisation Par',
      'Sculptural earrings — Completedworks',
      'Kitten-heel slingbacks — Reformation',
    ],
    area: 'Lower East Side',
    location: 'Orchard & Rivington',
    distance: '0.8 mi',
    placeNote: 'Warm brick, shopfront color, lively weekend foot traffic.',
    placeRating: 4.4,
    pins: 61,
    accent: '#ff8fa7',
    comments: [
      { name: 'Aria', text: 'The proportions are so good.' },
      { name: 'Theo', text: 'This corner always delivers.' },
    ],
  },
  {
    id: 3,
    author: 'Dani Okafor',
    handle: '@danididit',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    image:
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=88',
    caption: 'A quiet look for a very loud block.',
    outfit: [
      'Boxy poplin shirt — Studio Nicholson',
      'Pleated trousers — Tibi',
      'Leather loafers — G.H. Bass',
      'Silver cuff — Vintage',
    ],
    area: 'Nolita',
    location: 'Elizabeth Street Garden',
    distance: '1.1 mi',
    placeNote: 'Leafy light, textured walls, calmest around midday.',
    placeRating: 4.9,
    pins: 109,
    accent: '#8bd3ff',
    comments: [
      { name: 'Leila', text: 'The light here is unreal.' },
      { name: 'Micah', text: 'Simple and sharp.' },
    ],
  },
  {
    id: 4,
    author: 'Leo Park',
    handle: '@leoparked',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    image:
      'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=1200&q=88',
    caption: 'Monochrome, but never one-note.',
    outfit: [
      'Wool overcoat — Our Legacy',
      'Mock-neck knit — Uniqlo U',
      'Relaxed trousers — Lemaire',
      'Derby shoes — Dr. Martens',
    ],
    area: 'DUMBO',
    location: 'Washington & Water',
    distance: '2.4 mi',
    placeNote: 'Graphic brick canyon and bridge views before the crowds.',
    placeRating: 4.6,
    pins: 146,
    accent: '#ffb65b',
    comments: [
      { name: 'Mina', text: 'This silhouette is everything.' },
      { name: 'Benji', text: 'Peak DUMBO without feeling touristy.' },
    ],
  },
];

const mapPositions = [
  { left: '48%', top: '34%' },
  { left: '62%', top: '58%' },
  { left: '31%', top: '68%' },
  { left: '73%', top: '24%' },
];

export default function Home() {
  const [looks, setLooks] = useState(INITIAL_LOOKS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<'discover' | 'map'>('discover');
  const [dragX, setDragX] = useState(0);
  const [rating, setRating] = useState<number | null>(null);
  const [saved, setSaved] = useState<number[]>([]);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [locationRating, setLocationRating] = useState(0);
  const [toast, setToast] = useState('');
  const [postImage, setPostImage] = useState<File | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const dragStart = useRef<number | null>(null);
  const lastTouchTap = useRef(0);

  const look = looks[currentIndex % looks.length];
  const nextLook = looks[(currentIndex + 1) % looks.length];
  const remaining = Math.max(looks.length - (currentIndex % looks.length) - 1, 0);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const advance = (message?: string) => {
    if (message) notify(message);
    setDragX(0);
    setRating(null);
    setIsFlipped(false);
    setCurrentIndex((index) => (index + 1) % looks.length);
    setLocationRating(0);
  };

  const rateLook = (value: number) => {
    setRating(value);
    window.setTimeout(() => advance(`${value}/5 — your vote is in`), 360);
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('button, input, textarea, label')) {
      dragStart.current = null;
      return;
    }
    dragStart.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (dragStart.current === null || isFlipped) return;
    setDragX(Math.max(-170, Math.min(170, event.clientX - dragStart.current)));
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    if (dragStart.current === null) return;

    if (event.pointerType === 'touch' && Math.abs(dragX) < 12) {
      const now = Date.now();
      if (now - lastTouchTap.current < 320) {
        setIsFlipped((value) => !value);
        lastTouchTap.current = 0;
      } else {
        lastTouchTap.current = now;
      }
      setDragX(0);
    } else if (!isFlipped && dragX < -85) {
      advance('Passed — showing the next look');
    } else if (!isFlipped && dragX > 85) {
      rateLook(5);
    } else {
      setDragX(0);
    }
    dragStart.current = null;
  };

  const toggleSaved = () => {
    setSaved((items) =>
      items.includes(look.id) ? items.filter((id) => id !== look.id) : [...items, look.id],
    );
    notify(saved.includes(look.id) ? 'Removed from saved' : 'Saved to your style list');
  };

  const addComment = (event: FormEvent) => {
    event.preventDefault();
    if (!commentText.trim()) return;
    setLooks((items) =>
      items.map((item) =>
        item.id === look.id
          ? {
              ...item,
              comments: [...item.comments, { name: 'You', text: commentText.trim() }],
            }
          : item,
      ),
    );
    setCommentText('');
    notify('Comment added');
  };

  const createPost = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const caption = String(data.get('caption') || 'A new look in the city.');
    const location = String(data.get('location') || 'New York City');
    const newLook: Look = {
      id: Date.now(),
      author: 'You',
      handle: '@yourstyle',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      image: postImage
        ? URL.createObjectURL(postImage)
        : 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=88',
      caption,
      outfit: [
        'Statement outer layer — add the label',
        'Main piece — add the label',
        'Shoes — add the label',
        'Accessories — add the label',
      ],
      area: location.split(',')[0],
      location,
      distance: 'Your pin',
      placeNote: 'A fresh style spot, added by you.',
      placeRating: locationRating || 5,
      pins: 1,
      accent: '#d8ff4f',
      comments: [],
    };
    setLooks((items) => [...items, newLook]);
    setCurrentIndex(looks.length);
    setMode('discover');
    setPostOpen(false);
    setPostImage(null);
    notify('Your look is live on the map');
    event.currentTarget.reset();
  };

  const selectMapLook = (index: number) => {
    setCurrentIndex(index);
    setIsFlipped(false);
    setLocationRating(0);
  };

  const navItems = useMemo(
    () => [
      {
        label: 'Discover',
        icon: Compass,
        active: mode === 'discover',
        onClick: () => setMode('discover' as const),
      },
      {
        label: 'Style map',
        icon: Map,
        active: mode === 'map',
        onClick: () => setMode('map' as const),
      },
      {
        label: 'Saved',
        icon: Bookmark,
        active: false,
        onClick: () => notify(`${saved.length} saved look${saved.length === 1 ? '' : 's'}`),
      },
      {
        label: 'Profile',
        icon: UserRound,
        active: false,
        onClick: () => window.location.assign('/signup'),
      },
    ],
    [mode, saved.length],
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1480px] items-center justify-between px-4 md:px-8">
          <button
            className="font-display text-2xl font-black tracking-[-0.08em]"
            onClick={() => setMode('discover')}
          >
            onlook<span className="text-primary">°</span>
          </button>

          <button
            className="hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold shadow-sm sm:flex"
            onClick={() => setMode('map')}
          >
            <MapPin className="size-4 text-primary" />
            New York City
            <span className="text-muted-foreground">· 12 mi</span>
          </button>

          <div className="flex items-center gap-2">
            <Button
              aria-label="Search looks"
              className="rounded-full bg-transparent text-foreground hover:bg-secondary"
              onClick={() => setSearchOpen(true)}
              size="icon"
              variant="ghost"
            >
              <Search className="size-[18px]" />
            </Button>
            <button aria-label="Create your account" onClick={() => window.location.assign('/signup')}>
              <Avatar className="size-9 ring-2 ring-background">
                <AvatarImage
                  alt="Your profile"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                />
                <AvatarFallback>YS</AvatarFallback>
              </Avatar>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1480px] grid-cols-1 gap-8 px-4 pb-28 pt-6 md:px-8 lg:grid-cols-[190px_minmax(420px,590px)_300px] lg:gap-10 lg:pb-10 xl:grid-cols-[210px_minmax(480px,620px)_340px] xl:gap-14">
        <aside className="hidden lg:block">
          <div className="sticky top-24 flex min-h-[calc(100vh-8rem)] flex-col">
            <nav className="space-y-1" aria-label="Main navigation">
              {navItems.map(({ label, icon: Icon, active, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon className="size-[18px]" />
                  {label}
                  {label === 'Saved' && saved.length > 0 && (
                    <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-primary-foreground">
                      {saved.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="mt-6 rounded-[24px] border border-border bg-card p-4">
              <div className="mb-3 flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Plus className="size-5" />
              </div>
              <p className="text-sm font-bold">Share today’s fit</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Pin the place. Set the scene. Let the city vote.
              </p>
              <Button
                className="mt-4 w-full rounded-full font-bold"
                onClick={() => setPostOpen(true)}
                size="lg"
              >
                Post a look
              </Button>
            </div>

            <p className="mt-auto px-3 text-[11px] leading-relaxed text-muted-foreground">
              Style, where it happens. © 2026 onlook
            </p>
          </div>
        </aside>

        {mode === 'discover' ? (
          <section className="mx-auto w-full max-w-[590px]">
            <div className="mb-4 flex items-end justify-between px-1">
              <div>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                  {look.area} · Today
                </p>
                <h1 className="font-display text-[clamp(1.8rem,5vw,2.45rem)] font-black leading-none tracking-[-0.055em]">
                  Street style, nearby.
                </h1>
              </div>
              <span className="hidden text-xs font-medium text-muted-foreground sm:block">
                {remaining} looks left
              </span>
            </div>

            <div className="relative">
              <div className="absolute inset-x-5 top-3 h-[calc(100%-4rem)] rounded-[30px] border border-border bg-secondary" />
              <article
                className={`relative touch-pan-y select-none overflow-hidden rounded-[30px] border border-border bg-card shadow-[0_18px_50px_rgba(25,22,17,0.08)] transition-transform ${
                  dragStart.current === null ? 'duration-300' : 'duration-0'
                }`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onDoubleClick={(event) => {
                  if ((event.target as HTMLElement).closest('button')) return;
                  setIsFlipped((value) => !value);
                }}
                style={{
                  transform: `translateX(${dragX}px) rotate(${dragX / 24}deg)`,
                }}
              >
                <div
                  aria-label={isFlipped ? 'Outfit details. Double tap to show photo.' : 'Look photo. Double tap for outfit details.'}
                  className="relative aspect-[4/5] overflow-hidden bg-secondary [perspective:1400px]"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setIsFlipped((value) => !value);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div
                    className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${
                      isFlipped ? '[transform:rotateY(180deg)]' : ''
                    }`}
                  >
                    <div className="absolute inset-0 overflow-hidden [backface-visibility:hidden]">
                      <img
                        alt={`${look.author}'s street-style look in ${look.area}`}
                        className="pointer-events-none h-full w-full object-cover"
                        draggable={false}
                        src={look.image}
                      />
                      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

                      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/45 px-3 py-2 text-xs font-bold text-white backdrop-blur-md">
                        <span className="size-1.5 rounded-full bg-primary" />
                        {look.distance} away
                      </div>

                      <span className="absolute left-4 top-16 rounded-full bg-black/45 px-3 py-2 text-[10px] font-bold text-white/90 backdrop-blur-md">
                        Double tap for outfit details
                      </span>

                      <div className="absolute right-4 top-4 flex gap-2">
                    <button
                      aria-label="Open comments"
                      className="flex size-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition-transform hover:scale-105"
                      onClick={() => setCommentsOpen(true)}
                    >
                      <MessageCircle className="size-[18px]" />
                    </button>
                    <button
                      aria-label="Save this look"
                      className={`flex size-10 items-center justify-center rounded-full backdrop-blur-md transition-transform hover:scale-105 ${
                        saved.includes(look.id) ? 'bg-primary text-primary-foreground' : 'bg-black/45 text-white'
                      }`}
                      onClick={toggleSaved}
                    >
                      <Bookmark className={`size-[18px] ${saved.includes(look.id) ? 'fill-current' : ''}`} />
                    </button>
                      </div>

                      {Math.abs(dragX) > 35 && (
                    <div
                      className={`absolute top-24 rounded-xl border-4 px-4 py-2 font-display text-2xl font-black uppercase tracking-wider ${
                        dragX > 0
                          ? 'left-7 rotate-[-8deg] border-primary text-primary'
                          : 'right-7 rotate-[8deg] border-white text-white'
                      }`}
                    >
                      {dragX > 0 ? 'Love' : 'Pass'}
                    </div>
                      )}

                      <div className="absolute inset-x-5 bottom-5 text-white">
                    <div className="mb-3 flex items-center gap-2">
                      <Avatar className="size-8 border-2 border-white/50">
                        <AvatarImage alt={look.author} src={look.avatar} />
                        <AvatarFallback>{look.author.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="leading-tight">
                        <p className="text-sm font-bold">{look.author}</p>
                        <p className="text-[11px] text-white/70">{look.handle} · 18m</p>
                      </div>
                    </div>
                    <p className="font-display text-xl font-bold leading-snug tracking-tight sm:text-2xl">
                      {look.caption}
                    </p>
                    <button
                      className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-white/85"
                      onClick={() => setMode('map')}
                    >
                      <MapPin className="size-3.5 text-primary" />
                      {look.location}, {look.area}
                    </button>
                      </div>
                    </div>

                    <div className="absolute inset-0 grid bg-card [backface-visibility:hidden] [transform:rotateY(180deg)] sm:grid-cols-[1.08fr_.92fr]">
                      <div className="flex flex-col p-6 sm:p-8">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                          <Shirt className="size-4" /> Outfit details
                        </div>
                        <h2 className="mt-3 font-display text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                          Get the look.
                        </h2>
                        <ul className="mt-6 space-y-3">
                          {look.outfit.map((item) => (
                            <li className="flex gap-3 text-sm leading-relaxed" key={item}>
                              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-auto hidden items-center gap-2 pt-5 text-[10px] font-bold text-muted-foreground sm:flex">
                          <span className="flex size-6 items-center justify-center rounded-full border border-border">↺</span>
                          Double tap to return to the photo
                        </div>
                      </div>

                      <div className="relative min-h-44 overflow-hidden border-t border-border bg-[#e6e4dc] sm:border-l sm:border-t-0">
                        <div className="map-grid absolute inset-0 opacity-75" />
                        <div className="absolute left-[35%] top-0 h-full w-[10px] -rotate-[18deg] bg-background/90" />
                        <div className="absolute left-0 top-[52%] h-[9px] w-full rotate-[8deg] bg-background/90" />
                        <div className="absolute left-1/2 top-[42%] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                          <span className="absolute size-14 rounded-full bg-primary/20" />
                          <span className="relative flex size-10 items-center justify-center rounded-full border-[3px] border-white bg-foreground text-[11px] font-black text-background shadow-lg">
                            {look.placeRating.toFixed(1)}
                          </span>
                        </div>
                        <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-card/95 p-3 shadow-lg backdrop-blur">
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Shot here</p>
                          <p className="mt-1 text-sm font-black">{look.location}</p>
                          <p className="text-[11px] text-muted-foreground">{look.area} · {look.pins} style pins</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-5 sm:px-6 sm:pb-5">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      aria-label="Pass on this look"
                      className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:-rotate-6 hover:border-foreground/30 hover:text-foreground"
                      onClick={() => advance('Passed — showing the next look')}
                    >
                      <X className="size-5" />
                    </button>

                    <div className="flex flex-1 justify-center gap-1" aria-label="Rate this look">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          aria-label={`Rate ${value} out of 5`}
                          className="group flex size-9 items-center justify-center rounded-full transition hover:-translate-y-1 hover:bg-primary/15 sm:size-10"
                          onClick={() => rateLook(value)}
                        >
                          <Star
                            className={`size-[19px] transition-colors ${
                              rating && value <= rating
                                ? 'fill-primary text-primary'
                                : 'text-muted-foreground group-hover:fill-primary group-hover:text-primary'
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <button
                      aria-label="Love this look"
                      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition hover:scale-105"
                      onClick={() => rateLook(5)}
                    >
                      <Heart className="size-5 fill-current" />
                    </button>
                  </div>
                  <p className="mt-3 text-center text-[11px] font-medium text-muted-foreground">
                    Swipe to pass or love · double tap photo for outfit details
                  </p>
                </div>
              </article>
              <span className="sr-only">Next look is by {nextLook.author}</span>
            </div>
          </section>
        ) : (
          <MapSurface looks={looks} selectedIndex={currentIndex} onSelect={selectMapLook} />
        )}

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <PlaceCard
              look={look}
              locationRating={locationRating}
              onLocationRate={(value) => {
                setLocationRating(value);
                notify(`You rated this location ${value}/5`);
              }}
              onOpenMap={() => setMode('map')}
            />

            <CommentSection
              comments={look.comments}
              commentText={commentText}
              onChange={setCommentText}
              onSubmit={addComment}
              onOpen={() => setCommentsOpen(true)}
            />
          </div>
        </aside>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-[22px] border border-white/70 bg-foreground px-2 py-2 text-background shadow-2xl lg:hidden">
        {navItems.slice(0, 3).map(({ label, icon: Icon, active, onClick }) => (
          <button
            key={label}
            aria-label={label}
            onClick={onClick}
            className={`flex size-11 items-center justify-center rounded-2xl ${
              active ? 'bg-primary text-primary-foreground' : 'text-background/65'
            }`}
          >
            <Icon className="size-5" />
          </button>
        ))}
        <button
          className="flex h-11 items-center gap-2 rounded-2xl bg-background px-4 text-xs font-black text-foreground"
          onClick={() => setPostOpen(true)}
        >
          <Plus className="size-4" /> Post
        </button>
      </nav>

      <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto rounded-[26px] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-black">The conversation</DialogTitle>
            <DialogDescription>{look.comments.length} people are talking about this look.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            {look.comments.length ? (
              look.comments.map((comment, index) => (
                <div className="flex gap-3" key={`${comment.name}-${index}`}>
                  <Avatar>
                    {comment.avatar && <AvatarImage alt={comment.name} src={comment.avatar} />}
                    <AvatarFallback>{comment.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="rounded-2xl rounded-tl-sm bg-secondary px-4 py-3 text-sm">
                    <strong>{comment.name}</strong>
                    <p className="mt-0.5 text-muted-foreground">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-secondary p-5 text-center text-sm text-muted-foreground">
                Be the first to say something.
              </p>
            )}
          </div>
          <form className="flex gap-2" onSubmit={addComment}>
            <Input
              aria-label="Comment"
              className="h-11 rounded-full bg-secondary px-4"
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Add to the conversation…"
              value={commentText}
            />
            <Button aria-label="Post comment" className="size-11 rounded-full" size="icon">
              <Send className="size-4" />
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={postOpen} onOpenChange={setPostOpen}>
        <DialogContent className="rounded-[28px] sm:max-w-lg">
          <DialogHeader>
            <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-primary">
              <Sparkles className="size-5" />
            </div>
            <DialogTitle className="font-display text-2xl font-black tracking-tight">
              Pin today’s look
            </DialogTitle>
            <DialogDescription>Give the city a little context, then drop it on the map.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={createPost}>
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-foreground/25 bg-secondary/50 p-4 transition hover:border-primary">
              <span className="flex size-11 items-center justify-center rounded-full bg-card">
                {postImage ? <Check className="size-5 text-primary" /> : <ImagePlus className="size-5" />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold">{postImage ? postImage.name : 'Choose your photo'}</span>
                <span className="block text-xs text-muted-foreground">Portrait photos work best</span>
              </span>
              <Input
                accept="image/*"
                className="sr-only"
                onChange={(event) => setPostImage(event.target.files?.[0] || null)}
                type="file"
              />
            </label>
            <div>
              <label className="mb-2 block text-xs font-bold" htmlFor="caption">
                Caption
              </label>
              <Textarea
                className="min-h-24 rounded-2xl bg-secondary/50 p-4"
                id="caption"
                name="caption"
                placeholder="What’s the story behind this look?"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold" htmlFor="location">
                Where was this?
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
                <Input
                  className="h-11 rounded-full bg-secondary/50 pl-9"
                  id="location"
                  name="location"
                  placeholder="Search a spot or neighborhood"
                  required
                />
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold">Rate the location</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    aria-label={`Rate location ${value} out of 5`}
                    key={value}
                    onClick={() => setLocationRating(value)}
                    type="button"
                  >
                    <Star
                      className={`size-6 ${
                        value <= locationRating ? 'fill-primary text-primary' : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <DialogFooter className="-mx-4 mt-6 rounded-b-[28px]">
              <Button className="h-11 w-full rounded-full font-black sm:w-auto" type="submit">
                Drop the pin <MapPin className="size-4" />
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="rounded-[26px] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-black">Find your scene</DialogTitle>
            <DialogDescription>Jump to a neighborhood with fresh style pins.</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input autoFocus className="h-11 rounded-full bg-secondary pl-9" placeholder="Neighborhood or place" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {looks.map((item, index) => (
              <button
                className="rounded-2xl border border-border p-3 text-left transition hover:border-primary hover:bg-primary/10"
                key={item.id}
                onClick={() => {
                  setCurrentIndex(index);
                  setSearchOpen(false);
                  setMode('discover');
                }}
              >
                <span className="block text-sm font-bold">{item.area}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{item.location}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {toast && (
        <output className="fixed left-1/2 top-20 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-xs font-bold text-background shadow-xl">
          <Check className="size-4 text-primary" /> {toast}
        </output>
      )}
    </main>
  );
}

function MapSurface({
  looks,
  selectedIndex,
  onSelect,
}: {
  looks: Look[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <section className="mx-auto w-full max-w-[620px]">
      <div className="mb-4 px-1">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
          New York City · 299 pins
        </p>
        <h1 className="font-display text-[clamp(1.8rem,5vw,2.45rem)] font-black leading-none tracking-[-0.055em]">
          Find the city’s best-dressed corners.
        </h1>
      </div>
      <div className="relative min-h-[650px] overflow-hidden rounded-[30px] border border-border bg-[#e4e3d9] shadow-[0_18px_50px_rgba(25,22,17,0.08)]">
        <div className="map-grid absolute inset-0 opacity-90" />
        <div className="map-river absolute -right-24 top-[-10%] h-[120%] w-52 rotate-[12deg] rounded-[50%] bg-[#c8e4e6]" />
        <div className="absolute left-[24%] top-0 h-full w-[13px] -rotate-[18deg] bg-background/95 shadow-[18px_0_0_rgba(253,250,243,0.8)]" />
        <div className="absolute left-0 top-[48%] h-[12px] w-full rotate-[8deg] bg-background/95" />
        <div className="absolute left-0 top-[75%] h-[9px] w-full -rotate-[5deg] bg-background/90" />

        <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/70 bg-card/90 px-4 py-2 text-xs font-bold shadow-sm backdrop-blur">
          <span className="size-2 rounded-full bg-primary" /> Live style map
        </div>

        {looks.slice(0, 4).map((item, index) => (
          <button
            aria-label={`View look at ${item.location}`}
            className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 transition hover:z-20 hover:scale-110 ${
              index === selectedIndex % looks.length ? 'scale-110' : ''
            }`}
            key={item.id}
            onClick={() => onSelect(index)}
            style={mapPositions[index]}
          >
            <span
              className={`block overflow-hidden rounded-full border-[3px] shadow-xl ${
                index === selectedIndex % looks.length
                  ? 'size-[72px] border-primary'
                  : 'size-14 border-white'
              }`}
            >
              <img alt="" className="h-full w-full object-cover" src={item.image} />
            </span>
            <span className="mx-auto -mt-1 block w-max rounded-full bg-foreground px-2 py-1 text-[9px] font-black text-background">
              {item.placeRating.toFixed(1)}
            </span>
          </button>
        ))}

        <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-[22px] bg-card/95 p-3 shadow-xl backdrop-blur sm:inset-x-6 sm:p-4">
          <img alt="" className="size-14 rounded-2xl object-cover sm:size-16" src={looks[selectedIndex % looks.length].image} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black">{looks[selectedIndex % looks.length].location}</p>
            <p className="truncate text-xs text-muted-foreground">
              {looks[selectedIndex % looks.length].area} · {looks[selectedIndex % looks.length].pins} pins
            </p>
          </div>
          <Button
            aria-label="Previous map pin"
            className="rounded-full"
            onClick={() => onSelect((selectedIndex - 1 + looks.length) % looks.length)}
            size="icon"
            variant="outline"
          >
            <ChevronLeft />
          </Button>
          <Button
            aria-label="Next map pin"
            className="rounded-full"
            onClick={() => onSelect((selectedIndex + 1) % looks.length)}
            size="icon"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </section>
  );
}

function PlaceCard({
  look,
  locationRating,
  onLocationRate,
  onOpenMap,
}: {
  look: Look;
  locationRating: number;
  onLocationRate: (value: number) => void;
  onOpenMap: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-[26px] border border-border bg-card">
      <div className="relative h-36 bg-[#e6e4dc]">
        <div className="map-grid absolute inset-0 opacity-75" />
        <div className="absolute left-[34%] top-0 h-full w-[10px] -rotate-[19deg] bg-background/90" />
        <div className="absolute left-0 top-[48%] h-[9px] w-full rotate-[7deg] bg-background/90" />
        <div className="absolute left-[48%] top-[42%] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <span className="absolute size-12 animate-ping rounded-full bg-primary/25" />
          <span className="relative flex size-9 items-center justify-center rounded-full border-[3px] border-white bg-foreground text-[11px] font-black text-white shadow-lg">
            {look.placeRating.toFixed(1)}
          </span>
        </div>
        <button
          className="absolute bottom-3 right-3 rounded-full bg-card px-3 py-1.5 text-[11px] font-bold shadow-sm"
          onClick={onOpenMap}
        >
          Open map
        </button>
      </div>
      <div className="p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          The backdrop
        </p>
        <div className="mt-2 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-black tracking-tight">{look.location}</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{look.placeNote}</p>
          </div>
          <span className="rounded-full bg-primary/20 px-2.5 py-1 text-xs font-black text-foreground">
            {look.placeRating.toFixed(1)}
          </span>
        </div>
        <div className="mt-4 border-t border-border pt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{look.pins} style pins</span>
            <span className="text-[10px] font-bold">Rate this spot</span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((value) => (
              <button aria-label={`Rate this location ${value} out of 5`} key={value} onClick={() => onLocationRate(value)}>
                <Star
                  className={`size-[18px] ${
                    value <= locationRating ? 'fill-primary text-primary' : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CommentSection({
  comments,
  commentText,
  onChange,
  onSubmit,
  onOpen,
}: {
  comments: Look['comments'];
  commentText: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onOpen: () => void;
}) {
  return (
    <section className="rounded-[26px] border border-border bg-card p-5">
      <button className="mb-4 flex w-full items-center justify-between" onClick={onOpen}>
        <span className="flex items-center gap-2">
          <MessageCircle className="size-4" />
          <span className="text-sm font-bold">Conversation</span>
        </span>
        <span className="text-xs text-muted-foreground">{comments.length}</span>
      </button>
      <div className="space-y-4">
        {comments.slice(0, 2).map((comment, index) => (
          <div className="flex gap-3" key={`${comment.name}-${index}`}>
            <Avatar size="sm">
              {comment.avatar && <AvatarImage alt={comment.name} src={comment.avatar} />}
              <AvatarFallback>{comment.name[0]}</AvatarFallback>
            </Avatar>
            <p className="text-xs leading-relaxed">
              <strong>{comment.name}</strong>{' '}
              <span className="text-muted-foreground">{comment.text}</span>
            </p>
          </div>
        ))}
      </div>
      <form className="mt-5 flex items-center rounded-full bg-secondary pl-4" onSubmit={onSubmit}>
        <input
          aria-label="Add a comment"
          className="min-w-0 flex-1 bg-transparent py-2.5 text-xs outline-none placeholder:text-muted-foreground"
          onChange={(event) => onChange(event.target.value)}
          placeholder="Add a comment"
          value={commentText}
        />
        <button aria-label="Post comment" className="flex size-9 items-center justify-center" type="submit">
          <Send className="size-3.5" />
        </button>
      </form>
    </section>
  );
}
