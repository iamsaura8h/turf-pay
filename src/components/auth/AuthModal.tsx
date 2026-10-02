import { useState } from "react";
import { toast } from "sonner";
import { LogIn, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "in" | "up";
}

export function AuthModal({ open, onOpenChange, defaultMode = "in" }: AuthModalProps) {
  const [mode, setMode] = useState<"in" | "up">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    const { data, error } =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin },
          });

    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (mode === "up" && !data.session) {
      toast.success("Check your email to confirm your account!");
      onOpenChange(false);
    } else {
      toast.success("Welcome back!");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex items-center justify-center">
            <img src="/logo1.png" alt="Turf Split" className="h-10 w-auto object-contain" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold tracking-tight">
            {mode === "in" ? "Sign in to Turf Split" : "Create an Account"}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            {mode === "in"
              ? "Access your matches, track payments, and settle dues in seconds."
              : "Start organizing football, cricket & badminton turf games with ease."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Email
            </label>
            <Input
              type="email"
              required
              placeholder="organizer@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Password
            </label>
            <Input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>

          <Button className="w-full mt-2 font-semibold shadow-md" disabled={busy}>
            {busy ? (
              "Please wait..."
            ) : mode === "in" ? (
              <>
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" /> Create Account
              </>
            )}
          </Button>

          <div className="pt-2 text-center text-sm">
            <button
              type="button"
              onClick={() => setMode(mode === "in" ? "up" : "in")}
              className="text-muted-foreground hover:text-foreground font-medium underline-offset-4 hover:underline"
            >
              {mode === "in"
                ? "New organizer? Create your free account"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
