import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login({ email, password });
      navigate(redirectTo, { replace: true });
    } catch {
      // error is already set in the store; nothing else to do here
    }
  };

  return (
    <div className="w-full max-w-[460px] px-6 py-6">
      <form
        onSubmit={handleSubmit}
        className="w-full"
      >
        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-[36px] font-bold leading-tight text-slate-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="mt-3 text-base text-slate-500 dark:text-violet-200/75">
            Sign in to your recruitment dashboard
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800/40 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="mb-6">
          <label className="mb-2.5 block text-sm font-semibold text-slate-700 dark:text-violet-200">
            Email
          </label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
            className="h-14 rounded-2xl border-slate-300 bg-white text-base transition-all focus:border-violet-500 focus:ring-violet-500 dark:border-violet-500/25 dark:bg-[#1E1145] dark:text-white dark:placeholder:text-violet-300/40"
          />
        </div>

        {/* Password */}
        <div>
          <label className="mb-2.5 block text-sm font-semibold text-slate-700 dark:text-violet-200">
            Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="h-14 rounded-2xl border-slate-300 bg-white pr-12 text-base transition-all focus:border-violet-500 focus:ring-violet-500 dark:border-violet-500/25 dark:bg-[#1E1145] dark:text-white dark:placeholder:text-violet-300/40"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-violet-600 dark:text-violet-300 dark:hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Remember */}
        <div className="mt-6 flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" className="h-4 w-4 rounded accent-violet-600" />
            <span className="text-sm text-slate-600 dark:text-violet-200/80">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-sm font-semibold text-violet-600 hover:underline dark:text-violet-400 dark:hover:text-violet-300">
            Forgot Password?
          </Link>
        </div>

        {/* Login */}
        <Button
          type="submit"
          disabled={isLoading}
          className="mt-8 h-14 w-full rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-base font-semibold shadow-lg shadow-violet-600/25 transition-all duration-300 hover:scale-[1.01] hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-60 disabled:hover:scale-100"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              Signing in...
            </span>
          ) : (
            "Login to Dashboard"
          )}
        </Button>

        {/* Footer */}
        <div className="mt-8 border-t border-slate-200 pt-6 text-center dark:border-violet-500/20">
          <p className="text-xs text-slate-500 dark:text-violet-300/50">© 2026 HireGen AI</p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;