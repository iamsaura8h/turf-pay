import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { LogOut, Home, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { LandingPage } from "@/components/landing/LandingPage";
import { DesktopLandscapeView } from "@/components/dashboard/DesktopLandscapeView";
import { MobileView } from "@/components/dashboard/MobileView";
import { AuthModal } from "@/components/auth/AuthModal";
import { FootballStickerLoader } from "@/components/shared/FootballStickerLoader";
import type { Match, Player, PaymentType } from "@/types/turf";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  // View state: "landing" | "dashboard"
  const [currentView, setCurrentView] = useState<"landing" | "dashboard">("dashboard");

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"in" | "up">("in");

  // Matches & Active match state
  const [matches, setMatches] = useState<(Match & { collected: number; count: number })[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [activeMatch, setActiveMatch] = useState<(Match & { per_person: number }) | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isMatchLoading, setIsMatchLoading] = useState(false);

  // 1. Listen for Supabase session changes
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) {
        setCurrentView("dashboard");
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) {
        setCurrentView("landing");
      }
      setReady(true);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  // 2. Load all matches for current user
  const loadMatches = useCallback(async () => {
    if (!session) return;

    const { data: m, error: mErr } = await supabase
      .from("matches")
      .select("*")
      .order("played_on", { ascending: false })
      .order("created_at", { ascending: false });

    if (mErr) {
      console.error(mErr);
      return;
    }

    const { data: p, error: pErr } = await supabase.from("players").select("match_id,amount");
    if (pErr) console.error(pErr);

    const formattedMatches = (m ?? []).map((x) => {
      const ps = (p ?? []).filter((y) => y.match_id === x.id);
      return {
        ...x,
        total_cost: Number(x.total_cost),
        count: ps.length,
        collected: ps.reduce((a, y) => a + Number(y.amount), 0),
      };
    });

    setMatches(formattedMatches);

    // Auto-select first match on desktop if none selected yet
    if (!selectedMatchId && formattedMatches.length > 0 && window.innerWidth >= 1024) {
      setSelectedMatchId(formattedMatches[0]?.id ?? null);
    }
  }, [session, selectedMatchId]);

  useEffect(() => {
    if (session) {
      loadMatches();
    }
  }, [session, loadMatches]);

  // 3. Load active match & its players
  const loadActiveMatchData = useCallback(async () => {
    if (!selectedMatchId) {
      setActiveMatch(null);
      setPlayers([]);
      setIsMatchLoading(false);
      return;
    }

    setIsMatchLoading(true);

    try {
      const { data: m, error: mErr } = await supabase
        .from("matches")
        .select("*")
        .eq("id", selectedMatchId)
        .single();

      if (mErr) {
        console.error(mErr);
        return;
      }

      const { data: p, error: pErr } = await supabase
        .from("players")
        .select("*")
        .eq("match_id", selectedMatchId)
        .order("created_at");

      if (pErr) {
        console.error(pErr);
        return;
      }

      if (m) {
        setActiveMatch({
          ...m,
          total_cost: Number(m.total_cost),
          per_person: Number(m.per_person || 0),
        });
      }

      setPlayers(
        (p ?? []).map((x) => ({
          id: x.id,
          name: x.name,
          pay_type: x.pay_type as PaymentType,
          amount: Number(x.amount),
          cash: Number(x.cash || 0),
          upi: Number(x.upi || 0),
          partner: x.partner,
          owed: x.owed == null ? null : Number(x.owed),
        })),
      );
    } finally {
      setIsMatchLoading(false);
    }
  }, [selectedMatchId]);

  const handleSelectMatch = (id: string | null) => {
    setSelectedMatchId(id);
    if (id && id !== selectedMatchId) {
      setIsMatchLoading(true);
    }
  };

  useEffect(() => {
    loadActiveMatchData();
  }, [selectedMatchId, loadActiveMatchData]);

  // Actions
  const handleCreateMatch = async (title: string, cost: number) => {
    const { data, error } = await supabase
      .from("matches")
      .insert({
        title: title || "Turf Game",
        total_cost: cost || 0,
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(`Match "${data.title}" created!`);
    await loadMatches();
    setSelectedMatchId(data.id);
  };

  const handleDeleteMatch = async (id: string) => {
    const { error } = await supabase.from("matches").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Match deleted");
    if (selectedMatchId === id) {
      setSelectedMatchId(null);
    }
    await loadMatches();
  };

  const handleUpdateMatch = async (
    id: string,
    patch: { total_cost?: number; per_person?: number },
  ) => {
    setActiveMatch((m) => (m ? { ...m, ...patch } : m));
    const { error } = await supabase.from("matches").update(patch).eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      loadMatches();
    }
  };

  const handleAddPlayer = async (
    name: string,
    amt: number,
    type: PaymentType,
    partner?: string,
  ) => {
    if (!selectedMatchId) return;
    const per = activeMatch?.per_person || 0;
    const base = { match_id: selectedMatchId, cash: 0, upi: 0 };
    let ins: Array<Record<string, unknown>>;

    if (type === "split") {
      const pt = partner?.trim() || "?";
      const each = amt / 2;
      ins = [
        { ...base, name, pay_type: "split", amount: each, partner: pt },
        { ...base, name: pt, pay_type: "split", amount: each, partner: name },
      ];
    } else if (type === "later") {
      ins = [{ ...base, name, pay_type: "later", amount: 0, owed: amt || per }];
    } else {
      ins = [{ ...base, name, pay_type: type, amount: amt || per }];
    }

    const { error } = await supabase.from("players").insert(ins as never);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(`Added ${name}`);
    await loadActiveMatchData();
    await loadMatches();
  };

  const handleMarkPaid = async (player: Player, how: "cash" | "upi") => {
    const per = activeMatch?.per_person || 0;
    const finalAmt = player.owed ?? per;

    const { error } = await supabase
      .from("players")
      .update({ pay_type: how, amount: finalAmt, owed: null })
      .eq("id", player.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${player.name} settled via ${how.toUpperCase()}!`);
      await loadActiveMatchData();
      await loadMatches();
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    const { error } = await supabase.from("players").delete().eq("id", playerId);
    if (error) {
      toast.error(error.message);
    } else {
      await loadActiveMatchData();
      await loadMatches();
    }
  };

  const openAuth = (mode: "in" | "up") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  if (!ready) {
    return <FootballStickerLoader fullScreen message="Warming up the pitch..." />;
  }

  // If user is unauthenticated or has navigated to "landing"
  if (currentView === "landing" || !session) {
    return (
      <>
        <LandingPage
          onOpenAuth={openAuth}
          isAuthenticated={!!session}
          onGoToApp={() => setCurrentView("dashboard")}
        />
        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} defaultMode={authMode} />
        <Toaster position="top-center" />
      </>
    );
  }

  // Authenticated Dashboard View (Differentiated for Mobile vs Landscape Desktop/PC)
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedMatchId(null)}
              className="flex items-center gap-2.5 text-lg font-bold tracking-tight hover:opacity-90"
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-foreground text-background text-sm shadow-xs">
                ⚽
              </span>
              <span>Turf Split</span>
            </button>
            <span className="hidden sm:inline-block rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Dashboard
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView("landing")}
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Landing Page</span>
            </Button>

            <div className="hidden md:flex items-center text-xs text-muted-foreground px-2">
              {session.user.email}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => supabase.auth.signOut()}
              className="text-xs gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <div className="flex-1">
        {/* DESKTOP LANDSCAPE VIEW: Visible on screens >= 1024px (Laptops & PC) */}
        <div className="hidden lg:block">
          <DesktopLandscapeView
            matches={matches}
            selectedMatchId={selectedMatchId}
            onSelectMatch={handleSelectMatch}
            onCreateMatch={handleCreateMatch}
            onDeleteMatch={handleDeleteMatch}
            onUpdateMatch={handleUpdateMatch}
            activeMatch={activeMatch}
            players={players}
            onAddPlayer={handleAddPlayer}
            onMarkPaid={handleMarkPaid}
            onRemovePlayer={handleRemovePlayer}
            isMatchLoading={isMatchLoading}
          />
        </div>

        {/* MOBILE VIEW: Visible on screens < 1024px (Smartphones & Narrow Screens) */}
        <div className="block lg:hidden">
          <MobileView
            matches={matches}
            selectedMatchId={selectedMatchId}
            onSelectMatch={handleSelectMatch}
            onCreateMatch={handleCreateMatch}
            onDeleteMatch={handleDeleteMatch}
            onUpdateMatch={handleUpdateMatch}
            activeMatch={activeMatch}
            players={players}
            onAddPlayer={handleAddPlayer}
            onMarkPaid={handleMarkPaid}
            onRemovePlayer={handleRemovePlayer}
            isMatchLoading={isMatchLoading}
          />
        </div>
      </div>

      <Toaster position="top-center" />
    </div>
  );
}
