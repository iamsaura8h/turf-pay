import { ArrowRight, CheckCircle2, Smartphone, Wallet, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingPageProps {
  onOpenAuth: (mode: "in" | "up") => void;
  isAuthenticated: boolean;
  onGoToApp: () => void;
}

export function LandingPage({ onOpenAuth, isAuthenticated, onGoToApp }: LandingPageProps) {
  const handlePrimaryClick = () => {
    if (isAuthenticated) {
      onGoToApp();
    } else {
      onOpenAuth("up");
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden flex flex-col justify-between bg-background text-foreground px-4 sm:px-8 lg:px-12 py-3 sm:py-5 selection:bg-primary/20">
      {/* Sleek Minimalist Navbar */}
      <header className="flex items-center justify-between w-full max-w-7xl mx-auto">
        <div className="flex items-center">
          <img
            src="/logo1.png"
            alt="Turf Split"
            className="h-8 sm:h-9 w-auto object-contain cursor-pointer"
            onClick={onGoToApp}
          />
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button
              onClick={onGoToApp}
              size="sm"
              className="font-semibold rounded-xl text-xs h-9 px-4 shadow-xs"
            >
              Go to Dashboard <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenAuth("in")}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground h-9 rounded-xl px-4"
            >
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Main Hero & Showcase Workspace (Wide 2-Column on Web, Zero Scroll) */}
      <main className="flex-1 flex items-center my-auto py-2 sm:py-4 w-full max-w-7xl mx-auto min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center w-full">
          {/* LEFT COLUMN: Hero Copy & Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-4 lg:space-y-5 text-left">
            {/* Tag Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3.5 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Zero-friction game dues tracker</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-foreground leading-[1.08]">
              Split the turf fee. <br />
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-primary bg-clip-text text-transparent">
                Track who paid.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
              Log cash & UPI, track pending dues, and share WhatsApp summaries in seconds. No
              spreadsheets, zero awkward follow-ups.
            </p>

            {/* CTA Buttons */}
            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                size="lg"
                onClick={handlePrimaryClick}
                className="h-11 sm:h-12 px-7 text-sm sm:text-base font-semibold rounded-2xl shadow-md shadow-primary/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isAuthenticated ? "Open Dashboard" : "Get Started"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              {!isAuthenticated && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => onOpenAuth("in")}
                  className="h-11 sm:h-12 px-6 text-sm font-semibold rounded-2xl"
                >
                  I have an account
                </Button>
              )}
            </div>

            {/* Minimalist Feature Chips */}
            <div className="pt-1 flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 font-medium">
                <Wallet className="h-3.5 w-3.5 text-emerald-500" /> Cash & UPI Split
              </span>
              <span className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 font-medium">
                <Smartphone className="h-3.5 w-3.5 text-blue-500" /> 1-Click Settle
              </span>
              <span className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 font-medium">
                <Users className="h-3.5 w-3.5 text-purple-500" /> WhatsApp Ready
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive / Live Showcase Card (5 cols) */}
          <div className="lg:col-span-5 w-full">
            <div className="rounded-3xl border bg-card p-4 sm:p-5 shadow-md space-y-3.5 max-w-md mx-auto lg:max-w-none">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm sm:text-base text-foreground flex items-center gap-1.5">
                    <span>⚽</span> Sunday 7am Match
                  </div>
                  <div className="text-[11px] text-muted-foreground">Whitefield Turf Arena</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-foreground">₹2,400</div>
                  <div className="text-[11px] text-muted-foreground">₹200/head</div>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 sm:p-3 text-center">
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                    Collected
                  </div>
                  <div className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm sm:text-base mt-0.5">
                    ₹2,000
                  </div>
                </div>

                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-2.5 sm:p-3 text-center">
                  <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold uppercase tracking-wider">
                    Pending
                  </div>
                  <div className="font-extrabold text-amber-700 dark:text-amber-400 text-sm sm:text-base mt-0.5">
                    ₹400
                  </div>
                </div>

                <div className="rounded-2xl bg-muted/60 border p-2.5 sm:p-3 text-center">
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    Squad
                  </div>
                  <div className="font-extrabold text-foreground text-sm sm:text-base mt-0.5">
                    12
                  </div>
                </div>
              </div>

              {/* Mini Sample Roster */}
              <div className="divide-y border rounded-2xl bg-background/50 px-3 text-xs">
                <div className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-4 text-muted-foreground font-mono text-[10px]">1</span>
                    <span className="font-semibold text-foreground">Rahul M.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 text-[10px] font-semibold">
                      UPI
                    </span>
                    <span className="font-bold text-foreground">₹200</span>
                  </div>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-4 text-muted-foreground font-mono text-[10px]">2</span>
                    <div>
                      <span className="font-semibold text-foreground">Malay</span>
                      <div className="text-[10px] text-muted-foreground">Split with Harshil</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/20 px-2 py-0.5 text-[10px] font-semibold">
                      Split
                    </span>
                    <span className="font-bold text-foreground">₹100</span>
                  </div>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-4 text-muted-foreground font-mono text-[10px]">3</span>
                    <span className="font-semibold text-foreground">Lojeet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 text-[10px] font-semibold">
                      Pay Later
                    </span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">₹200</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Feature Strip */}
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 10 Paid
                </span>
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                  ⏳ 2 Pending
                </span>
                <span className="text-foreground font-medium">WhatsApp Settle ↗</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="text-center text-xs text-muted-foreground/75 py-2 w-full max-w-7xl mx-auto">
        Turf Split · Simple dues tracker for football, cricket & badminton
      </footer>
    </div>
  );
}
