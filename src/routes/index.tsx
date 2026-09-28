import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { ArrowLeft, LogOut, Plus, Trash2, Wallet, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Turf Split — track who paid for the game" },
      { name: "description", content: "Split the turf fee, log cash and UPI payments, and see who still owes." },
      { property: "og:title", content: "Turf Split — track who paid for the game" },
      { property: "og:description", content: "Split the turf fee, log cash and UPI payments, and see who still owes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Match = { id: string; title: string; played_on: string; total_cost: number };
type Player = { id: string; name: string; cash: number; upi: number };

const rs = (n: number) => `₹${Math.round(n * 100) / 100}`;

function Index() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 pb-24 pt-6 sm:px-6">
      <header className="mb-10 flex items-center justify-between">
        <button onClick={() => setOpenId(null)} className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-foreground text-sm text-background">⚽</span>
          Turf Split
        </button>
        {session && (
          <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        )}
      </header>
      {!ready ? null : !session ? (
        <Auth />
      ) : openId ? (
        <MatchView id={openId} onBack={() => setOpenId(null)} />
      ) : (
        <MatchList onOpen={setOpenId} />
      )}
    </div>
  );
}

function Auth() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password: pw })
        : await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (mode === "up" && !data.session) toast.success("Check your email to confirm your account.");
  };
  return (
    <div className="pt-8 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Who paid for turf?</h1>
      <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
        Split the fee, log cash & UPI, and see exactly who still owes.
      </p>
      <form onSubmit={submit} className="mx-auto mt-10 max-w-sm space-y-3 rounded-2xl border bg-card p-5 text-left shadow-sm">
        <Input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" required minLength={6} placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <Button className="w-full" disabled={busy}>{mode === "in" ? "Sign in" : "Create account"}</Button>
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
          {mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}

function MatchList({ onOpen }: { onOpen: (id: string) => void }) {
  const [matches, setMatches] = useState<(Match & { collected: number; count: number })[] | null>(null);
  const [cost, setCost] = useState("");
  const [title, setTitle] = useState("");

  const load = async () => {
    const { data: m } = await supabase.from("matches").select("*").order("played_on", { ascending: false }).order("created_at", { ascending: false });
    const { data: p } = await supabase.from("players").select("match_id,cash,upi");
    setMatches(
      (m ?? []).map((x) => {
        const ps = (p ?? []).filter((y) => y.match_id === x.id);
        return { ...x, total_cost: Number(x.total_cost), count: ps.length, collected: ps.reduce((a, y) => a + Number(y.cash) + Number(y.upi), 0) };
      }),
    );
  };
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from("matches")
      .insert({ title: title || "Turf game", total_cost: Number(cost) || 0 })
      .select()
      .single();
    if (error) return toast.error(error.message);
    onOpen(data.id);
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Games</h1>
      <form onSubmit={create} className="mt-6 flex flex-col gap-2 rounded-2xl border bg-card p-3 shadow-sm sm:flex-row">
        <Input placeholder="Name (e.g. Sunday 7am)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input type="number" inputMode="decimal" required placeholder="Turf fee ₹" value={cost} onChange={(e) => setCost(e.target.value)} className="sm:w-36" />
        <Button><Plus className="h-4 w-4" /> New game</Button>
      </form>
      <div className="mt-6 space-y-2">
        {matches?.length === 0 && <p className="py-10 text-center text-muted-foreground">No games yet. Add your first one above.</p>}
        {matches?.map((m) => {
          const diff = m.collected - m.total_cost;
          return (
            <button key={m.id} onClick={() => onOpen(m.id)} className="flex w-full items-center justify-between rounded-2xl border bg-card p-4 text-left transition hover:border-foreground/30">
              <div>
                <div className="font-medium">{m.title}</div>
                <div className="text-sm text-muted-foreground">{new Date(m.played_on).toLocaleDateString()} · {m.count} players</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{rs(m.collected)} / {rs(m.total_cost)}</div>
                <div className={`text-sm ${diff >= 0 ? "text-success" : "text-destructive"}`}>
                  {diff === 0 ? "Settled" : diff > 0 ? `+${rs(diff)} extra` : `${rs(-diff)} short`}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MatchView({ id, onBack }: { id: string; onBack: () => void }) {
  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [names, setNames] = useState("");

  const load = async () => {
    const { data: m } = await supabase.from("matches").select("*").eq("id", id).single();
    const { data: p } = await supabase.from("players").select("*").eq("match_id", id).order("created_at");
    if (m) setMatch({ ...m, total_cost: Number(m.total_cost) });
    setPlayers((p ?? []).map((x) => ({ id: x.id, name: x.name, cash: Number(x.cash), upi: Number(x.upi) })));
  };
  useEffect(() => { load(); }, [id]);

  const s = useMemo(() => {
    const total = match?.total_cost ?? 0;
    const share = players.length ? total / players.length : 0;
    const cash = players.reduce((a, p) => a + p.cash, 0);
    const upi = players.reduce((a, p) => a + p.upi, 0);
    const extra = players.reduce((a, p) => a + Math.max(0, p.cash + p.upi - share), 0);
    const pending = players.reduce((a, p) => a + Math.max(0, share - p.cash - p.upi), 0);
    return { total, share, cash, upi, collected: cash + upi, extra, pending };
  }, [match, players]);

  const addPlayers = async (e: React.FormEvent) => {
    e.preventDefault();
    const list = names.split(/[,\n]/).map((n) => n.trim()).filter(Boolean);
    if (!list.length) return;
    const { error } = await supabase.from("players").insert(list.map((name) => ({ name, match_id: id })));
    if (error) return toast.error(error.message);
    setNames("");
    load();
  };

  const update = async (pid: string, patch: Partial<Player>) => {
    setPlayers((ps) => ps.map((p) => (p.id === pid ? { ...p, ...patch } : p)));
    const { error } = await supabase.from("players").update(patch).eq("id", pid);
    if (error) toast.error(error.message);
  };
  const remove = async (pid: string) => {
    setPlayers((ps) => ps.filter((p) => p.id !== pid));
    await supabase.from("players").delete().eq("id", pid);
  };
  const updateCost = async (v: number) => {
    setMatch((m) => (m ? { ...m, total_cost: v } : m));
    await supabase.from("matches").update({ total_cost: v }).eq("id", id);
  };
  const delMatch = async () => {
    if (!confirm("Delete this game?")) return;
    await supabase.from("matches").delete().eq("id", id);
    onBack();
  };

  if (!match) return null;
  const diff = s.collected - s.total;
  const unpaid = players.filter((p) => p.cash + p.upi < s.share - 0.001);

  return (
    <div>
      <button onClick={onBack} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All games
      </button>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{match.title}</h1>
          <p className="text-sm text-muted-foreground">{new Date(match.played_on).toLocaleDateString()}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={delMatch} aria-label="Delete game"><Trash2 className="h-4 w-4" /></Button>
      </div>

      <div className="mt-6 rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Collected</div>
            <div className="text-4xl font-semibold tracking-tight">{rs(s.collected)}</div>
          </div>
          <div className="text-right">
            <label className="text-sm text-muted-foreground">Turf fee</label>
            <Input type="number" inputMode="decimal" value={match.total_cost} onChange={(e) => updateCost(Number(e.target.value) || 0)} className="mt-1 h-9 w-28 text-right" />
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div className={`h-full ${diff >= 0 ? "bg-success" : "bg-foreground"}`} style={{ width: `${s.total ? Math.min(100, (s.collected / s.total) * 100) : 0}%` }} />
        </div>
        <div className={`mt-3 text-sm font-medium ${diff >= 0 ? "text-success" : "text-destructive"}`}>
          {diff === 0 ? "Exactly settled" : diff > 0 ? `You got ${rs(diff)} more than the fee` : `${rs(-diff)} short of the fee`}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Stat label="Per head" value={rs(s.share)} />
          <Stat label="Cash" value={rs(s.cash)} />
          <Stat label="UPI" value={rs(s.upi)} />
          <Stat label="Pending" value={rs(s.pending)} tone={s.pending > 0 ? "text-destructive" : undefined} />
        </div>
        {s.extra > 0 && <p className="mt-3 text-xs text-muted-foreground">Extra paid above per-head share: {rs(s.extra)}</p>}
      </div>

      <form onSubmit={addPlayers} className="mt-6 flex gap-2">
        <Input placeholder="Add players — comma separated" value={names} onChange={(e) => setNames(e.target.value)} />
        <Button><Plus className="h-4 w-4" /> Add</Button>
      </form>

      <div className="mt-4 divide-y rounded-2xl border bg-card">
        {players.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No players yet.</p>}
        {players.map((p) => {
          const paid = p.cash + p.upi;
          const bal = paid - s.share;
          return (
            <div key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center justify-between sm:block">
                <div className="font-medium">{p.name}</div>
                <div className={`text-xs ${Math.abs(bal) < 0.01 ? "text-success" : bal > 0 ? "text-success" : "text-destructive"}`}>
                  {Math.abs(bal) < 0.01 ? "Paid" : bal > 0 ? `+${rs(bal)} extra` : `Owes ${rs(-bal)}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AmountField icon={<Wallet className="h-3.5 w-3.5" />} label="Cash" value={p.cash} onSave={(v) => update(p.id, { cash: v })} />
                <AmountField icon={<Smartphone className="h-3.5 w-3.5" />} label="UPI" value={p.upi} onSave={(v) => update(p.id, { upi: v })} />
                <Button variant="ghost" size="icon" onClick={() => remove(p.id)} aria-label={`Remove ${p.name}`}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
              </div>
            </div>
          );
        })}
      </div>

      {unpaid.length > 0 && (
        <div className="mt-6 rounded-2xl border border-destructive/30 p-4">
          <div className="text-sm font-medium">Still to pay ({unpaid.length})</div>
          <ul className="mt-2 space-y-1 text-sm">
            {unpaid.map((p) => (
              <li key={p.id} className="flex justify-between"><span>{p.name}</span><span className="text-destructive">{rs(s.share - p.cash - p.upi)}</span></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl bg-muted/60 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-semibold ${tone ?? ""}`}>{value}</div>
    </div>
  );
}

function AmountField({ icon, label, value, onSave }: { icon: React.ReactNode; label: string; value: number; onSave: (v: number) => void }) {
  const [v, setV] = useState(value ? String(value) : "");
  useEffect(() => setV(value ? String(value) : ""), [value]);
  return (
    <label className="flex h-9 flex-1 items-center gap-1.5 rounded-md border bg-background px-2 text-sm sm:w-28 sm:flex-none">
      <span className="text-muted-foreground" title={label}>{icon}</span>
      <input
        type="number"
        inputMode="decimal"
        placeholder={label}
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => Number(v || 0) !== value && onSave(Number(v) || 0)}
        className="w-full bg-transparent outline-none"
      />
    </label>
  );
}
