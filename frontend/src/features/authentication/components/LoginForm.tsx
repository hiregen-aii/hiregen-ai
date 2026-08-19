import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-[500px] px-6">
      <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-2xl transition-all duration-300 dark:border-slate-700 dark:bg-[#111827]">

        {/* Heading */}

        <div className="mb-8">
          <h1 className="text-[36px] font-bold leading-none text-slate-900 dark:text-white">
            Welcome Back
          </h1>

          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
            Sign in to your recruitment dashboard
          </p>
        </div>

        {/* Email */}

        <div className="mb-6">
          <label className="mb-3 block text-base font-semibold text-slate-700 dark:text-slate-200">
            Email
          </label>

          <Input
            type="email"
            placeholder="Enter your email"
            className="h-14 rounded-2xl border-slate-300 bg-white text-base transition-all focus:border-violet-500 focus:ring-violet-500 dark:border-slate-700 dark:bg-[#1E293B] dark:text-white"
          />
        </div>

        {/* Password */}

        <div>
          <label className="mb-3 block text-base font-semibold text-slate-700 dark:text-slate-200">
            Password
          </label>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="h-16 rounded-2xl border-slate-300 bg-white pr-12 text-base transition-all focus:border-violet-500 focus:ring-violet-500 dark:border-slate-700 dark:bg-[#1E293B] dark:text-white"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-violet-600 dark:text-slate-300"
            >
              {showPassword ? (
                <EyeOff size={22} />
              ) : (
                <Eye size={22} />
              )}
            </button>
          </div>
        </div>

        {/* Remember */}

        <div className="mt-7 flex items-center justify-between">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              className="h-4 w-4 accent-violet-600"
            />

            <span className="text-sm text-slate-600 dark:text-slate-300">
              Remember me
            </span>
          </label>

          <Link
  to="/forgot-password"
  className="text-sm font-semibold text-violet-600 hover:underline"
>
  Forgot Password?
</Link>
        </div>

        {/* Login */}

        <Button
  type="button"
  onClick={() => navigate("/dashboard")}
  className="mt-10 h-16 w-full rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-lg font-semibold transition-all duration-300 hover:scale-[1.02] hover:from-violet-700 hover:to-fuchsia-700"
>
  Login to Dashboard
</Button>

        {/* Footer */}

        <div className="mt-8 border-t border-slate-200 pt-6 text-center dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © 2026 HireGen AI
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginForm;