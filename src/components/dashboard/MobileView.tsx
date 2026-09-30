import { useState, useMemo } from "react";
import { ArrowLeft, Plus, Trash2, Wallet, Smartphone, Share2, Calendar, Users } from "lucide-react";
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

interface MobileViewProps {
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

export function MobileView({
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
}: MobileViewProps) {
  // New match form state
  const [newTitle, setNewTitle] = useState("");
  const [newCost, setNewCost] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Add player form state
  const [playerName, setPlayerName] = useState("");
  const [playerAmt, setPlayerAmt] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("cash");
  const [partnerName, setPartnerName] = useState("");
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

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

  // If viewing a specific match on mobile
  if (selectedMatchId && activeMatch) {
    const diff = stats.collected - activeMatch.total_cost;

    return (
      <div className="w-full px-4 py-4 pb-28 space-y-5">
        {/* Top Mobile Bar with Back button & WhatsApp Share */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onSelectMatch(null)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground py-1"
          >
            <ArrowLeft className="h-4 w-4" /> All Games
          </button>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShareModalOpen(true)}
              className="h-8 gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
            >
              <Share2 className="h-3.5 w-3.5" /> WhatsApp
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (confirm("Delete this match?")) {
                  onDeleteMatch(activeMatch.id);
                }
              }}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Match Title Card */}
        <div className="rounded-3xl border bg-card p-4 shadow-xs">
          <h2 className="text-xl font-bold tracking-tight text-foreground">{activeMatch.title}</h2>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(activeMatch.played_on).toLocaleDateString()} · {players.length} players
          </div>

          {/* Quick Metrics Grid */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-2xl bg-muted/60 p-3">
              <div className="text-[11px] text-muted-foreground">Collected</div>
              <div className="font-bold text-base mt-0.5">{formatCurrency(stats.collected)}</div>
              <div className="text-[10px] text-muted-foreground">
                UPI {formatCurrency(stats.upi)} · Cash {formatCurrency(stats.cash)}
              </div>
            </div>

            <div className="rounded-2xl bg-muted/60 p-3">
              <div className="text-[11px] text-muted-foreground">Pending</div>
              <div
                className={`font-bold text-base mt-0.5 ${
                  stats.pending > 0 ? "text-amber-600" : "text-foreground"
                }`}
              >
                {formatCurrency(stats.pending)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {stats.pending > 0 ? "Follow up" : "Settled 🎉"}
              </div>
            </div>
          </div>

          {/* Inline Cost Modifiers */}
          <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase">
                Turf Fee ₹
              </label>
              <Input
                type="number"
                inputMode="decimal"
                value={activeMatch.total_cost}
                onChange={(e) =>
                  onUpdateMatch(activeMatch.id, { total_cost: Number(e.target.value) || 0 })
                }
                className="h-8 mt-0.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase">
                Per Head ₹
              </label>
              <Input
                type="number"
                inputMode="decimal"
                value={per}
                onChange={(e) =>
                  onUpdateMatch(activeMatch.id, { per_person: Number(e.target.value) || 0 })
                }
                className="h-8 mt-0.5 text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Mobile Add Player Card */}
        <form
          onSubmit={handleAddPlayerSubmit}
          className="rounded-3xl border bg-card p-4 shadow-xs space-y-3"
        >
          <div className="font-bold text-sm">Add Player to Game</div>

          {/* Mode pills */}
          <div className="grid grid-cols-4 gap-1">
            {(["cash", "upi", "later", "split"] as PaymentType[]).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setPaymentType(t)}
                className={`rounded-xl border py-2 text-xs font-semibold transition ${
                  paymentType === t
                    ? "bg-foreground text-background shadow-xs border-foreground"
                    : "bg-muted/40 text-muted-foreground"
                }`}
              >
                {PAYMENT_LABELS[t]}
              </button>
            ))}
          </div>

          <Input
            placeholder="Player name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            required
            className="h-9 text-sm"
          />

          <div className="flex gap-2">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              placeholder={`Amount (₹${per})`}
              value={playerAmt}
              onChange={(e) => setPlayerAmt(e.target.value)}
              className="h-9 text-sm flex-1"
            />
            {paymentType === "split" && (
              <Input
                placeholder="Partner's name"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                className="h-9 text-sm flex-1"
              />
            )}
          </div>

          {/* Quick presets */}
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

          <Button disabled={isAddingPlayer} className="w-full h-10 font-semibold">
            <Plus className="h-4 w-4 mr-1" /> Add Player
          </Button>
        </form>

        {/* Players List */}
        <div className="rounded-3xl border bg-card p-4 shadow-xs space-y-2">
          <div className="font-bold text-sm flex items-center justify-between">
            <span>Roster ({players.length})</span>
            <span className="text-xs font-normal text-muted-foreground">
              {formatCurrency(stats.collected)} collected
            </span>
          </div>

          <div className="divide-y text-xs">
            {players.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No players added yet.</div>
            ) : (
              players.map((p, i) => {
                const isLater = p.pay_type === "later";

                return (
                  <div key={p.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex items-center gap-2">
                      <span className="text-muted-foreground w-4 text-[10px]">{i + 1}</span>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate">{p.name}</div>
                        {p.pay_type === "split" && (
                          <div className="text-[10px] text-muted-foreground">
                            with {p.partner || "friend"}
                          </div>
                        )}
                        {isLater && (
                          <div className="mt-1 flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => onMarkPaid(p, "cash")}
                              className="inline-flex items-center gap-0.5 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600"
                            >
                              <Wallet className="h-2.5 w-2.5" /> Cash
                            </button>
                            <button
                              type="button"
                              onClick={() => onMarkPaid(p, "upi")}
                              className="inline-flex items-center gap-0.5 rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600"
                            >
                              <Smartphone className="h-2.5 w-2.5" /> UPI
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                          PAYMENT_TONES[p.pay_type]
                        }`}
                      >
                        {PAYMENT_LABELS[p.pay_type]}
                      </span>
                      <span
                        className={`font-bold w-12 text-right ${
                          isLater ? "text-amber-600" : "text-foreground"
                        }`}
                      >
                        {isLater ? formatCurrency(p.owed ?? per) : formatCurrency(p.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemovePlayer(p.id)}
                        className="h-6 w-6 text-muted-foreground"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Mobile Summary Card */}
        {players.length > 0 && (
          <div className="rounded-3xl border bg-card p-4 shadow-xs space-y-2 text-xs">
            <div className="font-bold text-sm">Settlement Summary</div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">Collected</span>
              <span className="font-semibold">{formatCurrency(stats.collected)}</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">Turf Booking Fee</span>
              <span className="font-semibold">{formatCurrency(activeMatch.total_cost)}</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">Difference</span>
              <span
                className={`font-semibold ${diff >= 0 ? "text-emerald-600" : "text-destructive"}`}
              >
                {diff === 0
                  ? "Settled"
                  : diff > 0
                    ? `+${formatCurrency(diff)} surplus`
                    : `${formatCurrency(-diff)} short`}
              </span>
            </div>
            <div className="flex justify-between py-1 font-bold text-emerald-600">
              <span>Organizer Surplus</span>
              <span>{formatCurrency(stats.extra)}</span>
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
    );
  }

  // Matches List View (when no match is opened)
  return (
    <div className="w-full px-4 py-4 pb-28 space-y-5">
      {/* Create New Game Header Card */}
      <div className="rounded-3xl border bg-card p-4 shadow-xs space-y-3">
        <h2 className="text-lg font-bold tracking-tight">Create New Match</h2>
        <form onSubmit={handleCreateSubmit} className="space-y-2.5">
          <Input
            placeholder="Match name (e.g. Sunday 7am Turf)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="h-9 text-sm"
          />
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
              <Plus className="h-4 w-4 mr-1" /> New Game
            </Button>
          </div>
        </form>
      </div>

      {/* Match Cards List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-base tracking-tight">Your Matches</h3>
          <span className="text-xs text-muted-foreground">{matches.length} total</span>
        </div>

        {matches.length === 0 ? (
          <div className="rounded-3xl border bg-card p-8 text-center text-muted-foreground text-xs">
            No games recorded yet. Create your first match above.
          </div>
        ) : (
          matches.map((m) => {
            const diff = m.collected - m.total_cost;
            const isSettled = diff >= 0;

            return (
              <div
                key={m.id}
                onClick={() => onSelectMatch(m.id)}
                className="cursor-pointer rounded-3xl border bg-card p-4 shadow-xs hover:border-foreground/30 transition text-left space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-base">{m.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {new Date(m.played_on).toLocaleDateString()} · {m.count} players
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-sm">
                      {formatCurrency(m.collected)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        / {formatCurrency(m.total_cost)}
                      </span>
                    </div>
                    <span
                      className={`inline-block text-[11px] font-semibold mt-1 px-2 py-0.5 rounded-full ${
                        isSettled
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {isSettled ? "Settled" : `Short ${formatCurrency(-diff)}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
