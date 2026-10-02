import { useState, useEffect } from "react";
import { Sparkles, RefreshCw } from "lucide-react";

interface FootballPlayer {
  id: string;
  name: string;
  imageFile: string;
  number: number | string;
  club: string;
  countryEmoji: string;
  phrase: string;
  kitColor: string;
}

const FOOTBALL_PLAYERS: FootballPlayer[] = [
  {
    id: "haaland",
    name: "Erling Haaland",
    imageFile: "haaland.png",
    number: 9,
    club: "Man City",
    countryEmoji: "🇳🇴",
    phrase: "Haaland smashing through the turf numbers...",
    kitColor: "#6CABDD",
  },
  {
    id: "bellingham",
    name: "Jude Bellingham",
    imageFile: "bellingham.png",
    number: 5,
    club: "Real Madrid",
    countryEmoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    phrase: "Bellingham opening his arms for dues...",
    kitColor: "#FFFFFF",
  },
  {
    id: "mbappe",
    name: "Kylian Mbappé",
    imageFile: "mbappe.png",
    number: 9,
    club: "Real Madrid",
    countryEmoji: "🇫🇷",
    phrase: "Sprinting to collect pending UPI payments...",
    kitColor: "#001A4E",
  },
  {
    id: "yamal",
    name: "Lamine Yamal",
    imageFile: "yamal.png",
    number: 19,
    club: "Barcelona",
    countryEmoji: "🇪🇸",
    phrase: "Lamine Yamal nutmegging the spreadsheets...",
    kitColor: "#A50044",
  },
  {
    id: "olise",
    name: "Michael Olise",
    imageFile: "olise.png",
    number: 17,
    club: "Bayern Munich",
    countryEmoji: "🇫🇷",
    phrase: "Olise with the icy calm calculations...",
    kitColor: "#DC052D",
  },
  {
    id: "fermin",
    name: "Fermín López",
    imageFile: "fermin.png",
    number: 16,
    club: "Barcelona",
    countryEmoji: "🇪🇸",
    phrase: "Fermín pressing everyone for cash...",
    kitColor: "#004D98",
  },
  {
    id: "palmer",
    name: "Cole Palmer",
    imageFile: "palmer.png",
    number: 20,
    club: "Chelsea",
    countryEmoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    phrase: "Cold Palmer freezing out unpaid dues 🥶...",
    kitColor: "#034694",
  },
  {
    id: "pedri",
    name: "Pedri",
    imageFile: "pedri.png",
    number: 8,
    club: "Barcelona",
    countryEmoji: "🇪🇸",
    phrase: "Pedri conducting the midfield and dues...",
    kitColor: "#A50044",
  },
  {
    id: "vini",
    name: "Vinícius Júnior",
    imageFile: "vini.png",
    number: 7,
    club: "Real Madrid",
    countryEmoji: "🇧🇷",
    phrase: "Vini Jr dancing past the pending debts...",
    kitColor: "#FFFFFF",
  },
  {
    id: "messi",
    name: "Lionel Messi",
    imageFile: "messi.png",
    number: 10,
    club: "Inter Miami",
    countryEmoji: "🇦🇷",
    phrase: "The GOAT settling the pitch...",
    kitColor: "#F7B5CD",
  },
  {
    id: "ronaldo",
    name: "Cristiano Ronaldo",
    imageFile: "ronaldo.png",
    number: 7,
    club: "Al Nassr",
    countryEmoji: "🇵🇹",
    phrase: "SIUUU! All dues accounted for...",
    kitColor: "#FCE300",
  },
  {
    id: "de-jong",
    name: "Frenkie de Jong",
    imageFile: "de-jong.png",
    number: 21,
    club: "Barcelona",
    countryEmoji: "🇳🇱",
    phrase: "De Jong gliding through the turf ledger...",
    kitColor: "#004D98",
  },
  {
    id: "fede",
    name: "Federico Valverde",
    imageFile: "fede.png",
    number: 8,
    club: "Real Madrid",
    countryEmoji: "🇺🇾",
    phrase: "Valverde sprinting box-to-box for cash...",
    kitColor: "#FFFFFF",
  },
  {
    id: "oodegard",
    name: "Martin Ødegaard",
    imageFile: "oodegard.png",
    number: 8,
    club: "Arsenal",
    countryEmoji: "🇳🇴",
    phrase: "Ødegaard picking out the exact share...",
    kitColor: "#EF0107",
  },
  {
    id: "trent",
    name: "Trent Alexander-Arnold",
    imageFile: "trent.png",
    number: 66,
    club: "Liverpool",
    countryEmoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    phrase: "Trent crossing in the match totals...",
    kitColor: "#C8102E",
  },
  {
    id: "neymar",
    name: "Neymar Jr",
    imageFile: "neymar.png",
    number: 10,
    club: "Al Hilal",
    countryEmoji: "🇧🇷",
    phrase: "Neymar bringing Brazilian joga bonito...",
    kitColor: "#0045A5",
  },
  {
    id: "courtois",
    name: "Thibaut Courtois",
    imageFile: "courtois.png",
    number: 1,
    club: "Real Madrid",
    countryEmoji: "🇧🇪",
    phrase: "Courtois making giant saves on unpaid dues...",
    kitColor: "#1B2631",
  },
  {
    id: "huijsen",
    name: "Dean Huijsen",
    imageFile: "huijsen.png",
    number: 2,
    club: "Bournemouth",
    countryEmoji: "🇪🇸",
    phrase: "Huijsen defending the turf fee...",
    kitColor: "#DA020E",
  },
];

interface FootballStickerLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export function FootballStickerLoader({ message, fullScreen = false }: FootballStickerLoaderProps) {
  const [playerIndex, setPlayerIndex] = useState(() =>
    Math.floor(Math.random() * FOOTBALL_PLAYERS.length),
  );
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  const player = FOOTBALL_PLAYERS[playerIndex] || FOOTBALL_PLAYERS[0]!;
  const hasFailedImage = imageError[player.id];

  const nextPlayer = () => {
    setPlayerIndex((prev) => (prev + 1) % FOOTBALL_PLAYERS.length);
  };

  // Cycle player sticker every 3 seconds if loading persists
  useEffect(() => {
    const timer = setInterval(() => {
      setPlayerIndex((prev) => (prev + 1) % FOOTBALL_PLAYERS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const content = (
    <div className="flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in zoom-in-95 duration-200">
      {/* Free-Floating Die-Cut Sticker (Pure transparent cutout with shadow) */}
      <div
        onClick={nextPlayer}
        title="Tap sticker to switch player"
        className="group relative cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95 flex flex-col items-center"
      >
        <div className="relative flex items-center justify-center p-2">
          {!hasFailedImage ? (
            /* True Transparent PNG Sticker with Die-Cut Drop Shadow */
            <img
              src={`/stickers/${player.imageFile}`}
              alt={player.name}
              onError={() => setImageError((prev) => ({ ...prev, [player.id]: true }))}
              className="h-32 w-32 sm:h-40 sm:w-40 object-contain drop-shadow-[0_16px_22px_rgba(0,0,0,0.35)] dark:drop-shadow-[0_16px_24px_rgba(255,255,255,0.2)] transition-transform duration-300 group-hover:rotate-2 animate-pulse"
              style={{ animationDuration: "2.4s" }}
            />
          ) : (
            /* Fallback Avatar Badge */
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border-4 border-white dark:border-zinc-800 shadow-xl drop-shadow-[0_14px_22px_rgba(0,0,0,0.35)]">
              <span className="text-4xl">⚽</span>
              <span
                style={{ backgroundColor: player.kitColor }}
                className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full text-white font-black text-xs shadow-md border-2 border-white"
              >
                #{player.number}
              </span>
            </div>
          )}

          {/* Floating mini football badge */}
          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-black/10 text-sm animate-bounce">
            ⚽
          </div>
        </div>

        {/* Minimalist Player Badge Pill */}
        <div className="mt-3 flex items-center gap-1.5 rounded-full border border-border/80 bg-background/85 px-3 py-1 shadow-xs backdrop-blur-xs text-xs font-bold text-foreground">
          <span>{player.countryEmoji}</span>
          <span>{player.name}</span>
          <span className="text-[10px] text-muted-foreground font-normal">· {player.club}</span>
          <Sparkles className="h-3 w-3 text-amber-500 fill-amber-500 ml-0.5" />
        </div>

        {/* Tap to cycle hint */}
        <div className="mt-1 text-[10px] text-muted-foreground flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <RefreshCw className="h-2.5 w-2.5 animate-spin" style={{ animationDuration: "4s" }} />
          <span>Tap to switch player</span>
        </div>
      </div>

      {/* Dynamic Status Phrase */}
      <div className="mt-3 space-y-0.5 max-w-xs">
        <p className="font-semibold text-xs sm:text-sm text-foreground animate-pulse">
          {message || player.phrase}
        </p>
        <p className="text-[11px] text-muted-foreground">Fetching turf dues and payments...</p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background/95 backdrop-blur-xs z-50">
        {content}
      </div>
    );
  }

  return <div className="w-full flex items-center justify-center py-12 my-2">{content}</div>;
}
