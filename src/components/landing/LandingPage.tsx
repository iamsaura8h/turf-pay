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
    <div className="min-h-[100dvh] flex flex-col justify-between bg-background text-foreground px-4 sm:px-6 lg:px-8 py-5 sm:py-8 max-w-5xl mx-auto selection:bg-primary/20">
      {/* Sleek Minimalist Navbar */}
      <header className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-foreground text-background text-base font-semibold shadow-xs">
            ⚽
          </span>
          <span className="text-xl font-bold tracking-tight">Turf Split</span>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button onClick={onGoToApp} size="sm" className="font-semibold rounded-xl text-xs h-9">
              Go to Dashboard <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenAuth("in")}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground h-9 rounded-xl"
            >
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Main Hero & Compact Preview (Single-Screen / No Long Scrolling) */}
      <main className="my-auto py-6 sm:py-10 text-center max-w-2xl mx-auto space-y-6 sm:space-y-8">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Zero-friction game dues tracker</span>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Split the turf fee. <br />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-primary bg-clip-text text-transparent">
              Track who paid.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Log cash & UPI, track pending dues, and share WhatsApp summaries in seconds. No
            spreadsheets, zero awkward follow-ups.
          </p>
        </div>

        {/* Primary CTA Button */}
        <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            onClick={handlePrimaryClick}
            className="w-full sm:w-auto h-12 px-8 text-base font-semibold rounded-2xl shadow-md shadow-primary/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isAuthenticated ? "Open Dashboard" : "Get Started"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          {!isAuthenticated && (
            <Button
              size="lg"
              variant="outline"
              onClick={() => onOpenAuth("in")}
              className="w-full sm:w-auto h-12 px-6 text-sm font-semibold rounded-2xl"
            >
              I have an account
            </Button>
          )}
        </div>

        {/* Compact Minimalist Preview Widget */}
        <div className="pt-2">
          <div className="rounded-2xl border bg-card/80 p-4 shadow-sm backdrop-blur-xs text-left text-xs max-w-md mx-auto space-y-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <span>⚽</span> Sunday 7am Match
              </span>
              <span>₹2,400 Turf Fee · ₹200/head</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-center">
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                  Collected
                </div>
                <div className="font-bold text-emerald-700 dark:text-emerald-400 text-sm mt-0.5">
                  ₹2,000
                </div>
              </div>
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-center">
                <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                  Pending Dues
                </div>
                <div className="font-bold text-amber-700 dark:text-amber-400 text-sm mt-0.5">
                  ₹400
                </div>
              </div>
              <div className="rounded-xl bg-muted/60 p-2.5 text-center">
                <div className="text-[10px] text-muted-foreground font-medium">Players</div>
                <div className="font-bold text-foreground text-sm mt-0.5">12</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" /> 10 Paid
              </span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                ⏳ 2 Paying Later
              </span>
              <span>1-Click Settle & Share</span>
            </div>
          </div>
        </div>

        {/* 3 Minimal Feature Chips */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1">
            <Wallet className="h-3.5 w-3.5 text-emerald-500" /> Cash & UPI Split
          </span>
          <span className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1">
            <Smartphone className="h-3.5 w-3.5 text-blue-500" /> 1-Click Settle
          </span>
          <span className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1">
            <Users className="h-3.5 w-3.5 text-purple-500" /> WhatsApp Ready
          </span>
        </div>
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="text-center text-xs text-muted-foreground/80 py-2">
        Turf Split · Simple dues tracker for football, cricket & badminton
      </footer>
    </div>
  );
}
