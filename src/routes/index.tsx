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
    if (error) { toast.error(error.message); return; }
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
    const { data: p } = await supabase.from("players").select("match_id,amount");
    setMatches(
      (m ?? []).map((x) => {
        const ps = (p ?? []).filter((y) => y.match_id === x.id);
        return { ...x, total_cost: Number(x.total_cost), count: ps.length, collected: ps.reduce((a, y) => a + Number(y.amount), 0) };
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
    if (error) { toast.error(error.message); return; }
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

type PT = "cash" | "upi" | "later" | "split";
type Row = { id: string; name: string; pay_type: PT; amount: number; partner: string | null; owed: number | null };
const LABELS: Record<PT, string> = { cash: "Cash", upi: "UPI", later: "Pay later", split: "Split" };
const TONE: Record<PT, string> = {
  cash: "bg-success/15 text-success",
  upi: "bg-primary/10 text-primary",
  later: "bg-destructive/10 text-destructive",
  split: "bg-muted text-foreground",
};

function MatchView({ id, onBack }: { id: string; onBack: () => void }) {
  const [match, setMatch] = useState<(Match & { per_person: number }) | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [type, setType] = useState<PT>("cash");
  const [name, setName] = useState("");
  const [amt, setAmt] = useState("");
  const [partner, setPartner] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data: m } = await supabase.from("matches").select("*").eq("id", id).single();
    const { data: p } = await supabase.from("players").select("*").eq("match_id", id).order("created_at");
    if (m) setMatch({ ...m, total_cost: Number(m.total_cost), per_person: Number(m.per_person) });
    setRows((p ?? []).map((x) => ({ id: x.id, name: x.name, pay_type: x.pay_type as PT, amount: Number(x.amount), partner: x.partner, owed: x.owed == null ? null : Number(x.owed) })));
  };
  useEffect(() => { load(); }, [id]);

  const per = match?.per_person || 0;
  const s = useMemo(() => {
    const cash = rows.filter((r) => r.pay_type === "cash" || r.pay_type === "split").reduce((a, r) => a + r.amount, 0);
    const upi = rows.filter((r) => r.pay_type === "upi").reduce((a, r) => a + r.amount, 0);
    const pending = rows.filter((r) => r.pay_type === "later").reduce((a, r) => a + (r.owed ?? per), 0);
    const paidCount = rows.filter((r) => r.pay_type !== "later").length;
    const collected = cash + upi;
    return { cash, upi, pending, collected, extra: Math.max(0, collected - paidCount * per), due: rows.length * per };
  }, [rows, per]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim().slice(0, 60);
    if (!n) return;
    const raw = Number(amt) || 0;
    const base = { match_id: id, cash: 0, upi: 0 };
    let ins: Array<Record<string, unknown>>;
    if (type === "split") {
      const pt = partner.trim().slice(0, 60);
      const each = raw / 2;
      ins = [{ ...base, name: n, pay_type: "split", amount: each, partner: pt || "?" }];
      if (pt) ins.push({ ...base, name: pt, pay_type: "split", amount: each, partner: n });
    } else if (type === "later") {
      ins = [{ ...base, name: n, pay_type: "later", amount: 0, owed: raw || per }];
    } else {
      ins = [{ ...base, name: n, pay_type: type, amount: raw || per }];
    }
    setBusy(true);
    const { error } = await supabase.from("players").insert(ins as never);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setName(""); setAmt(""); setPartner("");
    load();
  };

  const markPaid = async (r: Row, how: "cash" | "upi") => {
    const { error } = await supabase.from("players").update({ pay_type: how, amount: r.owed ?? per, owed: null }).eq("id", r.id);
    if (error) toast.error(error.message); else load();
  };
  const remove = async (pid: string) => {
    setRows((ps) => ps.filter((p) => p.id !== pid));
    await supabase.from("players").delete().eq("id", pid);
  };
  const updateMatch = async (patch: { total_cost?: number; per_person?: number }) => {
    setMatch((m) => (m ? { ...m, ...patch } : m));
    await supabase.from("matches").update(patch).eq("id", id);
  };
  const delMatch = async () => {
    if (!confirm("Delete this game?")) return;
    await supabase.from("matches").delete().eq("id", id);
    onBack();
  };

  if (!match) return null;
  const diff = s.collected - match.total_cost;
  const amtLabel = type === "later" ? "Amount owed ₹" : type === "split" ? "Total paid for both ₹" : "Amount paid ₹";

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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Collected" value={rs(s.collected)} />
          <Stat label="Players" value={String(rows.length)} />
          <Stat label="Pending" value={rs(s.pending)} tone={s.pending > 0 ? "text-destructive" : undefined} />
          <Stat label="My cut" value={rs(s.extra)} tone="text-success" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="text-sm text-muted-foreground">Per person ₹
            <NumField value={per} onSave={(v) => updateMatch({ per_person: v })} />
          </label>
          <label className="text-sm text-muted-foreground">Turf fee ₹
            <NumField value={match.total_cost} onSave={(v) => updateMatch({ total_cost: v })} />
          </label>
        </div>
      </div>

      <form onSubmit={add} className="mt-6 space-y-3 rounded-2xl border bg-card p-4 shadow-sm">
        <div className="text-sm font-medium">Add player</div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(LABELS) as PT[]).map((t) => (
            <button type="button" key={t} onClick={() => setType(t)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${t === type ? "border-foreground bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
              {LABELS[t]}
            </button>
          ))}
        </div>
        <Input placeholder="Player name" value={name} onChange={(e) => setName(e.target.value)} required />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input type="number" inputMode="decimal" min={0} placeholder={`${amtLabel} (default ${per})`} value={amt} onChange={(e) => setAmt(e.target.value)} />
          {type === "split" && <Input placeholder="Partner's name" value={partner} onChange={(e) => setPartner(e.target.value)} />}
        </div>
        <div className="flex flex-wrap gap-2">
          {[per, 100, per * 2, 200].filter((v, i, a) => v > 0 && a.indexOf(v) === i).map((v) => (
            <button type="button" key={v} onClick={() => setAmt(String(v))} className="rounded-md bg-muted px-2.5 py-1 text-xs hover:bg-muted/70">₹{v}</button>
          ))}
        </div>
        <Button className="w-full" disabled={busy}><Plus className="h-4 w-4" /> Add</Button>
      </form>

      <div className="mt-4 divide-y rounded-2xl border bg-card">
        {rows.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No players yet.</p>}
        {rows.map((r, i) => {
          const later = r.pay_type === "later";
          return (
            <div key={r.id} className="flex items-center gap-3 p-3">
              <span className="w-5 text-xs text-muted-foreground">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{r.name}</div>
                {r.pay_type === "split" && <div className="text-xs text-muted-foreground">with {r.partner}</div>}
                {later && (
                  <div className="mt-1 flex gap-2 text-xs">
                    <button onClick={() => markPaid(r, "cash")} className="flex items-center gap-1 text-muted-foreground hover:text-foreground"><Wallet className="h-3 w-3" /> Paid cash</button>
                    <button onClick={() => markPaid(r, "upi")} className="flex items-center gap-1 text-muted-foreground hover:text-foreground"><Smartphone className="h-3 w-3" /> Paid UPI</button>
                  </div>
                )}
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs ${TONE[r.pay_type]}`}>{LABELS[r.pay_type]}</span>
              <span className={`w-16 text-right font-medium ${later ? "text-destructive" : r.amount > per ? "text-success" : ""}`}>
                {later ? rs(r.owed ?? per) : rs(r.amount)}
              </span>
              <Button variant="ghost" size="icon" onClick={() => remove(r.id)} aria-label={`Remove ${r.name}`}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
            </div>
          );
        })}
      </div>

      {rows.length > 0 && (
        <div className="mt-6 space-y-2 rounded-2xl border bg-card p-5 text-sm shadow-sm">
          <div className="mb-2 font-medium">Summary</div>
          <SumRow k={`Total due (@ ${rs(per)}/head)`} v={rs(s.due)} />
          <SumRow k="Cash received" v={rs(s.cash)} />
          <SumRow k="UPI received" v={rs(s.upi)} />
          <SumRow k="Still to collect" v={s.pending > 0 ? rs(s.pending) : "—"} tone="text-destructive" />
          <SumRow k="Turf fee" v={match.total_cost > 0 ? rs(match.total_cost) : "—"} />
          <SumRow k="Vs turf fee" v={diff === 0 ? "Settled" : diff > 0 ? `+${rs(diff)}` : `${rs(-diff)} short`} tone={diff >= 0 ? "text-success" : "text-destructive"} />
          <div className="mt-3 flex items-center justify-between rounded-xl bg-success/10 p-3">
            <span className="font-medium text-success">Your extra cut</span>
            <span className="text-xl font-semibold text-success">{rs(s.extra)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function SumRow({ k, v, tone }: { k: string; v: string; tone?: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className={`font-medium ${tone ?? ""}`}>{v}</span></div>;
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string | undefined }) {
  return (
    <div className="rounded-xl bg-muted/60 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-semibold ${tone ?? ""}`}>{value}</div>
    </div>
  );
}

function NumField({ value, onSave }: { value: number; onSave: (v: number) => void }) {
  const [v, setV] = useState(String(value));
  useEffect(() => setV(String(value)), [value]);
  return (
    <Input type="number" inputMode="decimal" min={0} value={v} onChange={(e) => setV(e.target.value)}
      onBlur={() => Number(v || 0) !== value && onSave(Number(v) || 0)} className="mt-1 h-9 text-foreground" />
  );
}
