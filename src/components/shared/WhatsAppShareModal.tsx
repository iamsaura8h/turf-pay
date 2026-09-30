import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatCurrency, type Match, type Player } from "@/types/turf";

interface WhatsAppShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: Match & { per_person?: number };
  players: Player[];
  stats: {
    collected: number;
    pending: number;
    cash: number;
    upi: number;
  };
}

export function WhatsAppShareModal({
  open,
  onOpenChange,
  match,
  players,
  stats,
}: WhatsAppShareModalProps) {
  const [copied, setCopied] = useState(false);

  const per = match.per_person || 0;
  const pendingPlayers = players.filter((p) => p.pay_type === "later");
  const paidPlayers = players.filter((p) => p.pay_type !== "later");

  const messageText = `⚽ *${match.title} — Turf Dues Summary*
📅 *Date:* ${new Date(match.played_on).toLocaleDateString()}
💰 *Turf Booking Fee:* ${formatCurrency(match.total_cost)} (Expected: ${formatCurrency(per)}/head)

✅ *Collected:* ${formatCurrency(stats.collected)} (${paidPlayers.length} players)
• UPI: ${formatCurrency(stats.upi)}
• Cash: ${formatCurrency(stats.cash)}

⏳ *Pending Dues:* ${formatCurrency(stats.pending)} (${pendingPlayers.length} players)
${
  pendingPlayers.length > 0
    ? pendingPlayers
        .map((p) => `• ${p.name}: ${formatCurrency(p.owed ?? per)} (Pending)`)
        .join("\n")
    : "• All players settled! 🎉"
}

_Tracked via Turf Split_ ⚽`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      toast.success("WhatsApp message copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const openWhatsApp = () => {
    const encoded = encodeURIComponent(messageText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Share2 className="h-5 w-5 text-emerald-600" />
            Share Summary to WhatsApp
          </DialogTitle>
          <DialogDescription>
            Copy this pre-formatted summary to paste into your turf WhatsApp group.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 rounded-xl border bg-muted/40 p-4 font-mono text-xs whitespace-pre-wrap leading-relaxed select-all">
          {messageText}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button onClick={copyToClipboard} variant="outline" className="flex-1 gap-2">
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" /> Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copy Message
              </>
            )}
          </Button>
          <Button
            onClick={openWhatsApp}
            className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Share2 className="h-4 w-4" /> Open WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
