import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Turf Tracker — who paid for the game" },
      { name: "description", content: "Log cash, UPI, split and pay-later players at the turf and see your extra cut." },
      { property: "og:title", content: "Turf Tracker — who paid for the game" },
      { property: "og:description", content: "Log cash, UPI, split and pay-later players at the turf and see your extra cut." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Inter:wght@400;500&display=swap" },
    ],
  }),
  component: Index,
});

type T = "cash" | "upi" | "later" | "split";
type P = { id: number; name: string; amount: number; type: T; partner?: string; owed?: number };
const KEY = "turf-tracker-v1";
const r = (n: number) => `₹${n.toFixed(0)}`;

function Index() {
  const [players, setPlayers] = useState<P[]>([]);
  const [per, setPer] = useState("86");
  const [turf, setTurf] = useState("0");
  const [type, setType] = useState<T>("cash");
  const [name, setName] = useState("");
  const [amt, setAmt] = useState("");
  const [partner, setPartner] = useState("");
  const [date, setDate] = useState("");
  const [loaded, setLoaded] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDate(new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }));
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || "null");
      if (s) { setPlayers(s.players ?? []); setPer(s.per ?? "86"); setTurf(s.turf ?? "0"); }
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify({ players, per, turf }));
  }, [players, per, turf, loaded]);

  const perPerson = parseFloat(per) || 86;
  const turfCost = parseFloat(turf) || 0;

  const add = () => {
    const n = name.trim();
    if (!n) { nameRef.current?.focus(); return; }
    const raw = parseFloat(amt) || 0;
    const id = Date.now();
    const next = [...players];
    if (type === "split") {
      const pt = partner.trim(), each = raw / 2;
      next.push({ id, name: n, amount: each, type, partner: pt || "?" });
      if (pt) next.push({ id: id + 1, name: pt, amount: each, type, partner: n });
      setPartner("");
    } else if (type === "later") {
      next.push({ id, name: n, amount: 0, type, owed: raw || perPerson });
    } else next.push({ id, name: n, amount: raw || perPerson, type });
    setPlayers(next); setName(""); setAmt(""); nameRef.current?.focus();
  };

  const remove = (id: number) => {
    const idx = players.findIndex((x) => x.id === id);
    const p = players[idx];
    if (!p) return;
    const nx = players[idx + 1];
    const cnt = p.type === "split" && nx && nx.type === "split" && nx.partner === p.name ? 2 : 1;
    setPlayers(players.filter((_, i) => i < idx || i >= idx + cnt));
  };

  const cash = players.filter((p) => p.type === "cash" || p.type === "split").reduce((s, p) => s + p.amount, 0);
  const upi = players.filter((p) => p.type === "upi").reduce((s, p) => s + p.amount, 0);
  const collected = cash + upi;
  const pending = players.filter((p) => p.type === "later").reduce((s, p) => s + (p.owed || perPerson), 0);
  const totalDue = players.length * perPerson;
  const extra = Math.max(0, collected - players.filter((p) => p.type !== "later").length * perPerson);

  const labels: Record<T, string> = { cash: "💵 Cash", upi: "📲 UPI", later: "⏳ Later", split: "🤝 Split" };
  const amtLabel = type === "later" ? "Amount owed (₹)" : type === "split" ? "Total paid for both (₹)" : "Amount paid (₹)";

  return (
    <div className="tt">
      <div className="scoreboard">
        <div className="sb-top">
          <div className="app-title">⚽ Turf Tracker</div>
          <div className="meta">{date}</div>
        </div>
        <div className="stats">
          <Stat c="lime" v={r(collected)} l="Collected" />
          <Stat c="" v={String(players.length)} l="Players" />
          <Stat c="later-c" v={r(pending)} l="Pending" />
          <Stat c="lime" v={r(extra)} l="My Cut" />
        </div>
      </div>

      <div className="main">
        <div className="setup">
          <div className="fg"><div className="fl">Per person (₹)</div><input type="number" inputMode="decimal" value={per} onChange={(e) => setPer(e.target.value)} placeholder="86" /></div>
          <div className="fg"><div className="fl">Turf cost (₹)</div><input type="number" inputMode="decimal" value={turf} onChange={(e) => setTurf(e.target.value)} placeholder="e.g. 1500" /></div>
        </div>

        <div className="card">
          <h3>Add Player</h3>
          <div className="row">
            <input ref={nameRef} type="text" placeholder="Player name…" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
            <button className="btn" onClick={add}>Add</button>
          </div>
          <div className="types">
            {(Object.keys(labels) as T[]).map((t) => (
              <button key={t} className={`chip ${t === type ? t : ""}`} onClick={() => { setType(t); if (t === "later") setAmt(""); }}>{labels[t]}</button>
            ))}
          </div>
          <div className="row" style={{ marginBottom: 0, alignItems: "flex-end" }}>
            <div className="fg"><div className="fl">{amtLabel}</div><input type="number" inputMode="decimal" value={amt} onChange={(e) => setAmt(e.target.value)} placeholder={type === "split" ? "e.g. 200" : type === "later" ? "Amount owed (₹)" : "e.g. 100"} /></div>
            {type === "split" && <div className="fg"><div className="fl">Split partner name</div><input type="text" value={partner} onChange={(e) => setPartner(e.target.value)} placeholder="Partner's name…" /></div>}
          </div>
          <div className="q">
            {[86, 100, 172, 200].map((v) => <button key={v} className="qc" onClick={() => setAmt(String(v))}>₹{v}</button>)}
          </div>
        </div>

        <div className="lh">
          <div style={{ fontSize: 16, fontWeight: 700 }}>Players {players.length > 0 && <span className="muted" style={{ fontWeight: 500 }}>({players.length})</span>}</div>
          {players.length > 0 && <button className="ghost" onClick={() => confirm("Clear all players?") && setPlayers([])}>Clear all</button>}
        </div>

        <div className="list">
          {players.length === 0 ? (
            <div className="empty"><div style={{ fontSize: 40, marginBottom: 8 }}>🏟️</div><div className="inter" style={{ fontSize: 15 }}>No players yet. Add your first player above.</div></div>
          ) : players.map((p, i) => {
            const later = p.type === "later";
            const color = later ? "var(--later)" : p.amount > perPerson ? "var(--lime)" : p.amount < perPerson ? "var(--muted)" : undefined;
            return (
              <div key={p.id} className={`pr ${p.type}`}>
                <div className="pn">{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="name">{p.name}</div>
                  {p.type === "split" && <div className="sn">with {p.partner}</div>}
                </div>
                <span className={`badge b-${p.type}`}>{p.type === "upi" ? "UPI" : p.type.charAt(0).toUpperCase() + p.type.slice(1)}</span>
                <div className="amt" style={{ color }}>{later ? `${r(p.owed || perPerson)} 🕐` : r(p.amount)}</div>
                <button className="del" onClick={() => remove(p.id)} aria-label={`Remove ${p.name}`}>✕</button>
              </div>
            );
          })}
        </div>

        {players.length > 0 && (
          <div className="sum">
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--lime)", marginBottom: 14 }}>Session Summary</div>
            <Row k="Players added" v={String(players.length)} />
            <Row k={`Total due (@ ₹${perPerson}/head)`} v={r(totalDue)} />
            <Row k="Cash received" v={r(cash)} c="lime" />
            <Row k="UPI received" v={r(upi)} c="upi-c" />
            <Row k="Still to collect" v={pending > 0 ? r(pending) : "—"} c="later-c" />
            <Row k="Turf cost" v={turfCost > 0 ? r(turfCost) : "—"} c="danger" />
            <div className="reward">
              <div style={{ fontSize: 14, color: "var(--lime)", fontWeight: 600 }}>🎉 Your reward (extra collected)</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--lime)" }}>{r(extra)}</div>
            </div>
          </div>
        )}
        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}

function Stat({ c, v, l }: { c: string; v: string; l: string }) {
  return <div className="stat"><div className={`stat-num ${c}`}>{v}</div><div className="lbl">{l}</div></div>;
}
function Row({ k, v, c = "" }: { k: string; v: string; c?: string }) {
  return <div className="sr"><span className="k">{k}</span><span className={`v ${c}`}>{v}</span></div>;
}
