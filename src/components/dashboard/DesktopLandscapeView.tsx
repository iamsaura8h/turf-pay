import { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  Wallet,
  Smartphone,
  Share2,
  Calendar,
  Users,
  Search,
  CheckCircle,
  AlertCircle,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatCurrency,
  PAYMENT_LABELS,
  PAYMENT_TONES,
  type Match,
  type Player,
  type PaymentType,
} from "@/types/turf";
import { WhatsAppShareModal } from "@/components/shared/WhatsAppShareModal";

interface DesktopLandscapeViewProps {
  matches: (Match & { collected: number; count: number })[];
  selectedMatchId: string | null;
  onSelectMatch: (id: string | null) => void;
  onCreateMatch: (title: string, cost: number) => Promise<void>;
  onDeleteMatch: (id: string) => Promise<void>;
  onUpdateMatch: (id: string, patch: { total_cost?: number; per_person?: number }) => Promise<void>;
  activeMatch: (Match & { per_person: number }) | null;
  players: Player[];
  onAddPlayer: (name: string, amt: number, type: PaymentType, partner?: string) => Promise<void>;
  onMarkPaid: (player: Player, how: "cash" | "upi") => Promise<void>;
  onRemovePlayer: (playerId: string) => Promise<void>;
}

export function DesktopLandscapeView({
  matches,
  selectedMatchId,
  onSelectMatch,
  onCreateMatch,
  onDeleteMatch,
  onUpdateMatch,
  activeMatch,
  players,
  onAddPlayer,
  onMarkPaid,
  onRemovePlayer,
}: DesktopLandscapeViewProps) {
  // New match form state
  const [newTitle, setNewTitle] = useState("");
  const [newCost, setNewCost] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Match search & filter state
  const [matchSearch, setMatchSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "pending" | "settled">("all");

  // Add player form state
  const [playerName, setPlayerName] = useState("");
  const [playerAmt, setPlayerAmt] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("cash");
  const [partnerName, setPartnerName] = useState("");
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

  // Player search in active match
  const [playerSearch, setPlayerSearch] = useState("");

  // WhatsApp share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const per = activeMatch?.per_person || 0;

  // Active match calculation stats
  const stats = useMemo(() => {
    const cash = players
      .filter((r) => r.pay_type === "cash" || r.pay_type === "split")
      .reduce((a, r) => a + r.amount, 0);
    const upi = players.filter((r) => r.pay_type === "upi").reduce((a, r) => a + r.amount, 0);
    const pending = players
      .filter((r) => r.pay_type === "later")
      .reduce((a, r) => a + (r.owed ?? per), 0);
    const paidCount = players.filter((r) => r.pay_type !== "later").length;
    const collected = cash + upi;
    const extra = Math.max(0, collected - paidCount * per);
    const due = players.length * per;
    return { cash, upi, pending, collected, extra, due };
  }, [players, per]);

  // Filtered match list
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const matchesText = m.title.toLowerCase().includes(matchSearch.toLowerCase());
      const diff = m.collected - m.total_cost;
      if (!matchesText) return false;
      if (filterMode === "settled") return diff >= 0;
      if (filterMode === "pending") return diff < 0;
      return true;
    });
  }, [matches, matchSearch, filterMode]);

  // Filtered players list
  const filteredPlayers = useMemo(() => {
    if (!playerSearch) return players;
    return players.filter((p) => p.name.toLowerCase().includes(playerSearch.toLowerCase()));
  }, [players, playerSearch]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) return;
    setIsCreating(true);
    await onCreateMatch(newTitle, Number(newCost) || 0);
    setNewTitle("");
    setNewCost("");
    setIsCreating(false);
  };

  const handleAddPlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || isAddingPlayer) return;
    setIsAddingPlayer(true);
    await onAddPlayer(
      playerName.trim(),
      Number(playerAmt) || 0,
      paymentType,
      partnerName.trim() || undefined,
    );
    setPlayerName("");
    setPlayerAmt("");
    setPartnerName("");
    setIsAddingPlayer(false);
  };

  const diff = activeMatch ? stats.collected - activeMatch.total_cost : 0;
  const progressPercent =
    activeMatch && activeMatch.total_cost > 0
      ? Math.min(100, Math.round((stats.collected / activeMatch.total_cost) * 100))
      : 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 2-Column Desktop Landscape Layout */}
      <div className="grid grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Matches Sidebar (4 cols) */}
        <aside className="col-span-12 lg:col-span-4 space-y-5">
          {/* Quick Create Card */}
          <div className="rounded-3xl border bg-card p-5 shadow-sm">
            <h2 className="text-base font-bold tracking-tight mb-3 flex items-center justify-between">
              <span>Create New Game</span>
              <span className="text-xs font-normal text-muted-foreground">Fast setup</span>
            </h2>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <Input
                  placeholder="Match title (e.g. Sunday 7am Turf)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  inputMode="decimal"
                  required
                  placeholder="Turf fee ₹"
                  value={newCost}
                  onChange={(e) => setNewCost(e.target.value)}
                  className="h-9 text-sm"
                />
                <Button disabled={isCreating} className="h-9 px-4 font-semibold shrink-0">
                  <Plus className="h-4 w-4 mr-1" /> Create
                </Button>
              </div>
            </form>
          </div>

          {/* Matches List Header & Filters */}
          <div className="rounded-3xl border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg tracking-tight">Match History</h3>
                <p className="text-xs text-muted-foreground">
                  {matches.length} total matches recorded
                </p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search games..."
                value={matchSearch}
                onChange={(e) => setMatchSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex gap-1.5 p-1 bg-muted/50 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  filterMode === "all"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({matches.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("pending")}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  filterMode === "pending"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Pending
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("settled")}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  filterMode === "settled"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Settled
              </button>
            </div>

            {/* Match Cards List */}
            <div className="space-y-2.5 max-h-[calc(100vh-420px)] overflow-y-auto pr-1">
              {filteredMatches.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <p className="text-sm">No matches found.</p>
                  <p className="text-xs mt-1">Create your first match above to get started.</p>
                </div>
              ) : (
                filteredMatches.map((m) => {
                  const matchDiff = m.collected - m.total_cost;
                  const isSelected = m.id === selectedMatchId;
                  const isSettled = matchDiff >= 0;

                  return (
                    <div
                      key={m.id}
                      onClick={() => onSelectMatch(m.id)}
                      className={`cursor-pointer rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                          : "bg-background/60 hover:bg-muted/50 hover:border-foreground/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm truncate text-foreground">
                            {m.title}
                          </h4>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(m.played_on).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {m.count} players
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-bold text-sm">
                            {formatCurrency(m.collected)}{" "}
                            <span className="text-xs font-normal text-muted-foreground">
                              / {formatCurrency(m.total_cost)}
                            </span>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold mt-1 px-2 py-0.5 rounded-full ${
                              isSettled
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {isSettled ? (
                              <>
                                <CheckCircle className="h-3 w-3" /> Settled
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3" /> Short{" "}
                                {formatCurrency(-matchDiff)}
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: Active Match Workspace (8 cols) */}
        <main className="col-span-12 lg:col-span-8">
          {!activeMatch ? (
            /* Empty State when no match is selected */
            <div className="rounded-3xl border bg-card p-12 text-center shadow-sm space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-3xl">
                ⚽
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-2xl font-bold tracking-tight">Select or Create a Game</h3>
                <p className="text-sm text-muted-foreground">
                  Pick a match from the sidebar to inspect dues, or launch one of these quick
                  presets:
                </p>
              </div>

              {/* Starter Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto pt-2">
                <button
                  type="button"
                  onClick={() => onCreateMatch("Sunday 7v7 Football", 2400)}
                  className="rounded-2xl border p-4 text-left hover:border-primary hover:bg-primary/5 transition-all text-xs"
                >
                  <div className="font-semibold text-sm">⚽ 7v7 Football</div>
                  <div className="text-muted-foreground mt-1">₹2,400 Turf Fee</div>
                  <div className="text-primary font-medium mt-2">1-Click Launch →</div>
                </button>

                <button
                  type="button"
                  onClick={() => onCreateMatch("Night Box Cricket", 1800)}
                  className="rounded-2xl border p-4 text-left hover:border-primary hover:bg-primary/5 transition-all text-xs"
                >
                  <div className="font-semibold text-sm">🏏 Box Cricket</div>
                  <div className="text-muted-foreground mt-1">₹1,800 Turf Fee</div>
                  <div className="text-primary font-medium mt-2">1-Click Launch →</div>
                </button>

                <button
                  type="button"
                  onClick={() => onCreateMatch("Badminton Doubles", 800)}
                  className="rounded-2xl border p-4 text-left hover:border-primary hover:bg-primary/5 transition-all text-xs"
                >
                  <div className="font-semibold text-sm">🏸 Badminton</div>
                  <div className="text-muted-foreground mt-1">₹800 Court Fee</div>
                  <div className="text-primary font-medium mt-2">1-Click Launch →</div>
                </button>
              </div>
            </div>
          ) : (
            /* Selected Match Workspace */
            <div className="space-y-6">
              {/* Match Header Bar */}
              <div className="rounded-3xl border bg-card p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                      {activeMatch.title}
                    </h2>
                    <span className="rounded-full bg-primary/10 text-primary px-3 py-0.5 text-xs font-semibold">
                      Active Workspace
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    Played on {new Date(activeMatch.played_on).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShareModalOpen(true)}
                    className="gap-2 font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                  >
                    <Share2 className="h-4 w-4" /> Share WhatsApp Summary
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm("Delete this match permanently?")) {
                        onDeleteMatch(activeMatch.id);
                      }
                    }}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* 4 Landscape Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl border bg-card p-4 shadow-sm">
                  <div className="text-xs font-medium text-muted-foreground">Total Collected</div>
                  <div className="mt-1 text-2xl font-bold text-foreground">
                    {formatCurrency(stats.collected)}
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    UPI: {formatCurrency(stats.upi)} · Cash: {formatCurrency(stats.cash)}
                  </div>
                </div>

                <div className="rounded-2xl border bg-card p-4 shadow-sm">
                  <div className="text-xs font-medium text-muted-foreground">Players Roster</div>
                  <div className="mt-1 text-2xl font-bold text-foreground">{players.length}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {players.filter((p) => p.pay_type !== "later").length} Paid ·{" "}
                    {players.filter((p) => p.pay_type === "later").length} Pending
                  </div>
                </div>

                <div className="rounded-2xl border bg-card p-4 shadow-sm">
                  <div className="text-xs font-medium text-muted-foreground">Pending Dues</div>
                  <div
                    className={`mt-1 text-2xl font-bold ${
                      stats.pending > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"
                    }`}
                  >
                    {formatCurrency(stats.pending)}
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {stats.pending > 0 ? "Follow up required" : "All players paid 🎉"}
                  </div>
                </div>

                <div className="rounded-2xl border bg-card p-4 shadow-sm">
                  <div className="text-xs font-medium text-muted-foreground">Organizer Cut</div>
                  <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(stats.extra)}
                  </div>
                  <div className="mt-1 text-[11px] text-emerald-600/80">Surplus collected</div>
                </div>
              </div>

              {/* Progress and Cost Setting Bar */}
              <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground uppercase tracking-wider">
                    Collection Progress
                  </span>
                  <span className="font-bold">
                    {formatCurrency(stats.collected)} of {formatCurrency(activeMatch.total_cost)} (
                    {progressPercent}%)
                  </span>
                </div>

                {/* Visual Progress Bar */}
                <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
                  <div
                    style={{ width: `${(stats.upi / (activeMatch.total_cost || 1)) * 100}%` }}
                    className="bg-blue-500 transition-all duration-500"
                    title={`UPI: ${formatCurrency(stats.upi)}`}
                  />
                  <div
                    style={{ width: `${(stats.cash / (activeMatch.total_cost || 1)) * 100}%` }}
                    className="bg-emerald-500 transition-all duration-500"
                    title={`Cash: ${formatCurrency(stats.cash)}`}
                  />
                  <div
                    style={{ width: `${(stats.pending / (activeMatch.total_cost || 1)) * 100}%` }}
                    className="bg-amber-400 transition-all duration-500"
                    title={`Pending: ${formatCurrency(stats.pending)}`}
                  />
                </div>

                {/* Inline Cost & Per-Head Adjusters */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t text-xs">
                  <div>
                    <label className="text-muted-foreground font-medium">Turf Booking Fee ₹</label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={activeMatch.total_cost}
                      onChange={(e) =>
                        onUpdateMatch(activeMatch.id, { total_cost: Number(e.target.value) || 0 })
                      }
                      className="h-8 mt-1 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-muted-foreground font-medium">Per Person Share ₹</label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={per}
                      onChange={(e) =>
                        onUpdateMatch(activeMatch.id, { per_person: Number(e.target.value) || 0 })
                      }
                      className="h-8 mt-1 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* 2-Column Match Action Workspace (Add Player vs Players Roster) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* SUB-COL 1: Add Player Card (5 cols) */}
                <div className="md:col-span-5 rounded-3xl border bg-card p-5 shadow-sm space-y-4">
                  <h3 className="font-bold text-base tracking-tight flex items-center justify-between">
                    <span>Add Player</span>
                    <span className="text-xs font-normal text-muted-foreground">Fast log</span>
                  </h3>

                  <form onSubmit={handleAddPlayerSubmit} className="space-y-3.5">
                    {/* Payment Mode Pills */}
                    <div>
                      <label className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
                        Payment Mode
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                        {(["cash", "upi", "later", "split"] as PaymentType[]).map((t) => (
                          <button
                            type="button"
                            key={t}
                            onClick={() => setPaymentType(t)}
                            className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                              paymentType === t
                                ? "bg-foreground text-background shadow-xs border-foreground"
                                : "bg-muted/40 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {PAYMENT_LABELS[t]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name Input */}
                    <div>
                      <label className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
                        Player Name
                      </label>
                      <Input
                        placeholder="Player full name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        required
                        className="mt-1 h-9 text-sm"
                      />
                    </div>

                    {/* Amount Input & Split Partner */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
                        {paymentType === "later"
                          ? "Amount Owed (default per-head)"
                          : paymentType === "split"
                            ? "Total Paid for Both"
                            : "Amount Paid (default per-head)"}
                      </label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        placeholder={`Default: ₹${per}`}
                        value={playerAmt}
                        onChange={(e) => setPlayerAmt(e.target.value)}
                        className="h-9 text-sm"
                      />

                      {paymentType === "split" && (
                        <div>
                          <label className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
                            Partner Name
                          </label>
                          <Input
                            placeholder="Partner's name"
                            value={partnerName}
                            onChange={(e) => setPartnerName(e.target.value)}
                            className="mt-1 h-9 text-sm"
                          />
                        </div>
                      )}
                    </div>

                    {/* Quick Amount Chips */}
                    <div>
                      <div className="text-[10px] text-muted-foreground mb-1">
                        Quick amount presets:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[per, 100, per * 2, 200]
                          .filter((v, i, a) => v > 0 && a.indexOf(v) === i)
                          .map((val) => (
                            <button
                              type="button"
                              key={val}
                              onClick={() => setPlayerAmt(String(val))}
                              className="rounded-lg bg-muted px-2 py-1 text-xs hover:bg-muted/80 font-medium"
                            >
                              ₹{val}
                            </button>
                          ))}
                      </div>
                    </div>

                    <Button
                      disabled={isAddingPlayer}
                      className="w-full h-10 font-semibold shadow-xs"
                    >
                      <Plus className="h-4 w-4 mr-1.5" /> Add Player
                    </Button>
                  </form>
                </div>

                {/* SUB-COL 2: Players Roster & Ledger (7 cols) */}
                <div className="md:col-span-7 rounded-3xl border bg-card p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base tracking-tight">Active Roster</h3>
                      <p className="text-xs text-muted-foreground">
                        {players.length} players recorded
                      </p>
                    </div>

                    <div className="w-40">
                      <Input
                        placeholder="Search player..."
                        value={playerSearch}
                        onChange={(e) => setPlayerSearch(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  {/* Player Entries */}
                  <div className="divide-y max-h-[460px] overflow-y-auto pr-1">
                    {filteredPlayers.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground text-xs">
                        No players added yet. Use the form on the left to add your first player.
                      </div>
                    ) : (
                      filteredPlayers.map((player, idx) => {
                        const isLater = player.pay_type === "later";

                        return (
                          <div
                            key={player.id}
                            className="py-3 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-4 text-muted-foreground font-mono text-[11px]">
                                {idx + 1}
                              </span>
                              <div className="min-w-0">
                                <div className="font-semibold text-sm truncate text-foreground">
                                  {player.name}
                                </div>
                                {player.pay_type === "split" && (
                                  <div className="text-[11px] text-muted-foreground">
                                    Split with {player.partner || "friend"}
                                  </div>
                                )}

                                {/* Quick Settle actions for Pay Later */}
                                {isLater && (
                                  <div className="mt-1.5 flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => onMarkPaid(player, "cash")}
                                      className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 hover:bg-emerald-500/20"
                                    >
                                      <Wallet className="h-3 w-3" /> Paid Cash
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onMarkPaid(player, "upi")}
                                      className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-600 hover:bg-blue-500/20"
                                    >
                                      <Smartphone className="h-3 w-3" /> Paid UPI
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                                  PAYMENT_TONES[player.pay_type]
                                }`}
                              >
                                {PAYMENT_LABELS[player.pay_type]}
                              </span>

                              <span
                                className={`w-14 text-right font-bold ${
                                  isLater ? "text-amber-600 dark:text-amber-400" : "text-foreground"
                                }`}
                              >
                                {isLater
                                  ? formatCurrency(player.owed ?? per)
                                  : formatCurrency(player.amount)}
                              </span>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onRemovePlayer(player.id)}
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Financial Receipt Summary */}
              {players.length > 0 && (
                <div className="rounded-3xl border bg-card p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b">
                    <h3 className="font-bold text-base tracking-tight flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-emerald-500" />
                      Final Settlement Breakdown
                    </h3>
                    <Button
                      size="sm"
                      onClick={() => setShareModalOpen(true)}
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                    >
                      <Share2 className="h-3.5 w-3.5" /> Copy WhatsApp Receipt
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Total Expected:</span>
                      <div className="font-semibold text-sm mt-0.5">
                        {formatCurrency(stats.due)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cash In Hand:</span>
                      <div className="font-semibold text-sm mt-0.5 text-emerald-600">
                        {formatCurrency(stats.cash)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">UPI in Bank:</span>
                      <div className="font-semibold text-sm mt-0.5 text-blue-600">
                        {formatCurrency(stats.upi)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pending in Market:</span>
                      <div className="font-semibold text-sm mt-0.5 text-amber-600">
                        {formatCurrency(stats.pending)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t text-sm font-semibold">
                    <span>Organizer Surplus / Extra Cut:</span>
                    <span className="text-xl font-bold text-emerald-600">
                      {formatCurrency(stats.extra)}
                    </span>
                  </div>
                </div>
              )}

              {/* WhatsApp Share Modal */}
              <WhatsAppShareModal
                open={shareModalOpen}
                onOpenChange={setShareModalOpen}
                match={activeMatch}
                players={players}
                stats={stats}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
