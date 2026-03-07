import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import useAuth from "@/hooks/useAuth";
import { Loader2, Mail } from "lucide-react";

type Mode = "signin" | "signup" | "check-email";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (mode === "signup") {
      if (password.length < 6) {
        setError("Parola trebuie să aibă minim 6 caractere");
        setIsLoading(false);
        return;
      }
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/dashboard" },
      });
      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
      } else {
        setMode("check-email");
        setIsLoading(false);
      }
    } else {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        setError(authError.message);
        setIsLoading(false);
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  if (mode === "check-email") {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center px-4">
        <div className="fixed inset-0 z-0 pointer-events-none bg-grid-pattern opacity-[0.03]" />
        <div className="relative z-10 w-full max-w-[400px]">
          <div className="bg-card border border-border-subtle rounded-xl p-8 shadow-lg shadow-black/20 text-center">
            <Mail className="w-12 h-12 text-accent mx-auto mb-4" />
            <h2 className="font-heading text-lg font-semibold mb-2">Verifică emailul</h2>
            <p className="text-sm text-muted-foreground mb-1">
              Am trimis un link de confirmare la:
            </p>
            <p className="text-sm text-accent font-mono mb-6">{email}</p>
            <p className="text-xs text-muted-foreground mb-6">
              Dă click pe linkul din email pentru a-ți activa contul. Verifică și folderul Spam.
            </p>
            <button
              onClick={() => { setMode("signin"); setError(""); }}
              className="text-xs text-accent hover:underline"
            >
              ← Înapoi la Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center px-4">
      <div className="fixed inset-0 z-0 pointer-events-none bg-grid-pattern opacity-[0.03]" />

      <div className="relative z-10 w-full max-w-[400px]">
        <div className="bg-card border border-border-subtle rounded-xl p-8 shadow-lg shadow-black/20">
          {/* Logo */}
          <div className="text-center mb-6">
            <span className="text-4xl mb-3 block">🤖</span>
            <h1 className="font-heading text-xl font-bold tracking-tight">
              Neuro<span className="text-accent">SS</span>ociety
            </h1>
            <p className="text-[12px] text-muted-foreground mt-1 font-body">
              AI Trading. Automated. 24/7.
            </p>
          </div>

          {/* Tab toggle */}
          <div className="flex mb-6 bg-secondary rounded-lg p-1">
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                mode === "signin"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                mode === "signup"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-body">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border-subtle text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent transition-colors duration-150"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-body">
                {mode === "signup" ? "Parolă (minim 6 caractere)" : "Password"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === "signup" ? 6 : undefined}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border-subtle text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent transition-colors duration-150"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "signup"
                ? isLoading ? "Se creează..." : "Creează cont"
                : isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}