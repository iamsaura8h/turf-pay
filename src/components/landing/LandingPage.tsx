import { useState } from "react";
import {
  Sparkles,
  Smartphone,
  Wallet,
  Clock,
  Users,
  Share2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/types/turf";

interface LandingPageProps {
  onOpenAuth: (mode: "in" | "up") => void;
  isAuthenticated: boolean;
  onGoToApp: () => void;
}

export function LandingPage({ onOpenAuth, isAuthenticated, onGoToApp }: LandingPageProps) {
  // Interactive Hero Calculator State
  const [calcCost, setCalcCost] = useState(2400);
  const [calcPlayers, setCalcPlayers] = useState(12);
  const [demoRows, setDemoRows] = useState([
    { name: "Rahul (You)", type: "upi", amt: 200 },
    { name: "Sameer", type: "upi", amt: 200 },
    { name: "Kabir", type: "cash", amt: 200 },
    { name: "Aditya", type: "cash", amt: 200 },
    { name: "Vikram", type: "later", amt: 0, owed: 200 },
    { name: "Faizan", type: "later", amt: 0, owed: 200 },
  ]);

  const perPerson = Math.round(calcCost / (calcPlayers || 1));
  const demoCollected = demoRows
    .filter((r) => r.type !== "later")
    .reduce((sum, r) => sum + r.amt, 0);
  const demoPending = demoRows
    .filter((r) => r.type === "later")
    .reduce((sum, r) => sum + (r.owed || perPerson), 0);

  const toggleDemoPay = (index: number) => {
    setDemoRows((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        if (r.type === "later") {
          return { ...r, type: "upi", amt: perPerson, owed: undefined };
        }
        return { ...r, type: "later", amt: 0, owed: perPerson };
      }),
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-foreground text-background text-base shadow-sm">
              ⚽
            </span>
            <span className="text-xl font-bold tracking-tight">Turf Split</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#calculator" className="hover:text-foreground transition-colors">
              Live Demo
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button onClick={onGoToApp} className="shadow-sm font-semibold">
                Go to Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => onOpenAuth("in")}
                  className="font-medium hover:text-foreground"
                >
                  Sign In
                </Button>
                <Button onClick={() => onOpenAuth("up")} className="shadow-sm font-semibold">
                  Get Started Free
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 text-left space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-3.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                <span>The #1 Game Dues Tracker for Weekend Organizers</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-[1.1]">
                Split the Turf. <br />
                <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-primary bg-clip-text text-transparent">
                  Collect Every Rupee.
                </span>
                <br />
                Zero Awkward Texts.
              </h1>

              <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
                Tired of losing money after every Sunday football or cricket game? Track cash in
                hand, UPI in bank, and settle that one friend who said{" "}
                <em>"Bhai baad me deta hoon"</em> in 1 click.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  size="lg"
                  onClick={() => (isAuthenticated ? onGoToApp() : onOpenAuth("up"))}
                  className="h-12 px-7 text-base font-semibold shadow-lg shadow-primary/20"
                >
                  {isAuthenticated ? "Open My Dashboard" : "Start Tracking Matches — Free"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <a href="#calculator">
                  <Button size="lg" variant="outline" className="h-12 px-6 text-base font-medium">
                    Try Interactive Calculator
                  </Button>
                </a>
              </div>

              {/* Social Proof Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t">
                <div>
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Free to use</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">&lt; 30s</div>
                  <div className="text-xs text-muted-foreground mt-0.5">To log a game</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">₹0</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Lost out of pocket</div>
                </div>
              </div>
            </div>

            {/* Right Interactive Hero Card (Live Calculator Preview) */}
            <div id="calculator" className="lg:col-span-5">
              <div className="rounded-3xl border bg-card/90 p-6 shadow-xl backdrop-blur-sm transition-all hover:border-foreground/20">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Sunday 7 AM Turf
                    </div>
                    <div className="text-xs text-muted-foreground">Interactive Live Preview</div>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Live Demo
                  </span>
                </div>

                {/* Match Adjusters */}
                <div className="mt-4 grid grid-cols-2 gap-3 bg-muted/40 p-3 rounded-2xl">
                  <div>
                    <label className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
                      Turf Fee
                    </label>
                    <div className="mt-1 flex items-center">
                      <Input
                        type="number"
                        value={calcCost}
                        onChange={(e) => setCalcCost(Number(e.target.value) || 0)}
                        className="h-8 font-semibold text-sm bg-background"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
                      Players
                    </label>
                    <div className="mt-1 flex items-center">
                      <Input
                        type="number"
                        value={calcPlayers}
                        onChange={(e) => setCalcPlayers(Number(e.target.value) || 1)}
                        className="h-8 font-semibold text-sm bg-background"
                      />
                    </div>
                  </div>
                </div>

                {/* Per Head Highlight */}
                <div className="mt-3 flex items-center justify-between rounded-xl bg-primary/10 px-4 py-2.5">
                  <span className="text-xs font-medium text-foreground">Calculated Share</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(perPerson)} / head
                  </span>
                </div>

                {/* Interactive Player List */}
                <div className="mt-4 space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                    <span>Click status to toggle payment:</span>
                    <span>Collected: {formatCurrency(demoCollected)}</span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {demoRows.map((r, i) => (
                      <div
                        key={i}
                        onClick={() => toggleDemoPay(i)}
                        className="cursor-pointer flex items-center justify-between p-2 rounded-xl border bg-background/50 hover:bg-muted/70 transition-all text-xs"
                      >
                        <div className="font-medium flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px]">
                            {i + 1}
                          </span>
                          {r.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 font-medium text-[10px] ${
                              r.type === "upi"
                                ? "bg-blue-500/15 text-blue-600"
                                : r.type === "cash"
                                  ? "bg-emerald-500/15 text-emerald-600"
                                  : "bg-amber-500/15 text-amber-600"
                            }`}
                          >
                            {r.type === "later" ? "Pending (Tap)" : `Paid ${r.type.toUpperCase()}`}
                          </span>
                          <span className="font-semibold w-12 text-right">
                            {formatCurrency(r.type === "later" ? r.owed || perPerson : r.amt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Breakdown Bar */}
                <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs">
                  <div className="text-muted-foreground">
                    Pending Dues:{" "}
                    <span className="font-bold text-amber-600">{formatCurrency(demoPending)}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => (isAuthenticated ? onGoToApp() : onOpenAuth("up"))}
                    className="h-8 text-xs font-medium"
                  >
                    Track My Game <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid: Features */}
      <section id="features" className="py-20 border-t bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
              Features Built For Sports
            </h2>
            <h3 className="mt-2 text-3xl font-extrabold sm:text-4xl tracking-tight">
              Everything Turf Organizers Need
            </h3>
            <p className="mt-3 text-muted-foreground">
              No complicated spreadsheets. No messy paper notes. Built strictly for the chaos of
              turf match days.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="rounded-3xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-5">
                <Smartphone className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold tracking-tight">Separate UPI vs Cash</h4>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Know exactly how much cash is sitting in your physical wallet vs what hit your
                Google Pay / PhonePe scanner.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-3xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-5">
                <Clock className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold tracking-tight">1-Click "Pay Later" Settle</h4>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Mark who didn't pay today with a single tap. When they send money on Tuesday, click
                "Paid UPI" and settle instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-3xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-5">
                <Users className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold tracking-tight">Smart 2-Player Split</h4>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Two friends sharing an hour or one player paying for their buddy? Split amounts
                equally between partners with one entry.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-3xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-5">
                <Share2 className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold tracking-tight">WhatsApp-Ready Dues Text</h4>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Generate and copy a formatted summary with 1 button. Paste it straight to your
                WhatsApp group so debtors know their dues.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-3xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center mb-5">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold tracking-tight">Organizer Cut Protection</h4>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Real-time math checks total collected against turf booking costs so you always know
                your surplus or shortfall.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-3xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold tracking-tight">Multi-Device Responsive</h4>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Tailored landscape dashboard when viewing on laptop/PC, and a clean, thumb-friendly
                app when entering dues on your phone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 border-t">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
              Simple Workflow
            </h2>
            <h3 className="mt-2 text-3xl font-extrabold sm:text-4xl tracking-tight">
              Ready in 3 Simple Steps
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative rounded-3xl border bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background font-bold text-lg">
                1
              </div>
              <h4 className="text-lg font-bold">Create Game</h4>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your match name (e.g. "Sunday 7v7 Football") and total booking cost from the
                turf manager.
              </p>
            </div>

            <div className="relative rounded-3xl border bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background font-bold text-lg">
                2
              </div>
              <h4 className="text-lg font-bold">Log Players & Payments</h4>
              <p className="mt-2 text-sm text-muted-foreground">
                Quick-add players with 1 tap. Mark whether they paid with Cash, UPI, or promised to
                Pay Later.
              </p>
            </div>

            <div className="relative rounded-3xl border bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background font-bold text-lg">
                3
              </div>
              <h4 className="text-lg font-bold">Settle & Share</h4>
              <p className="mt-2 text-sm text-muted-foreground">
                Check your total cut, copy the formatted WhatsApp reminder, and rest easy knowing
                nobody forgot to pay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 border-t bg-gradient-to-b from-muted/30 to-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold sm:text-5xl tracking-tight">
            Stop losing ₹500 every weekend.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join smart turf captains across football, box cricket, and badminton.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button
              size="lg"
              onClick={() => (isAuthenticated ? onGoToApp() : onOpenAuth("up"))}
              className="h-12 px-8 text-base font-semibold shadow-lg shadow-primary/20"
            >
              {isAuthenticated ? "Launch Dashboard" : "Get Started Now — It's Free"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>⚽</span>
            <span className="font-semibold text-foreground">Turf Split</span>
            <span>— The Game Dues Tracker</span>
          </div>
          <div>Built for organizers who love the game.</div>
        </div>
      </footer>
    </div>
  );
}
