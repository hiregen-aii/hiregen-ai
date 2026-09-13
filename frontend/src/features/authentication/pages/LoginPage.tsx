import LeftHero from "../components/LeftHero";
import LoginForm from "../components/LoginForm";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const LoginPage = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex h-screen items-center justify-center bg-[#f5f5fb] dark:bg-[#0A0518]">
      <div className="mx-auto flex h-[92vh] w-[92vw] max-w-[1600px] overflow-hidden rounded-[36px] bg-white shadow-2xl transition-colors duration-300 dark:border dark:border-violet-900/30 dark:bg-[#140B35]">

        {/* Left Section */}
        <div className="hidden lg:block lg:w-[58%]">
          <LeftHero />
        </div>

        {/* Right Section */}
        <div className="relative flex w-full items-center justify-center bg-[#fafaff] dark:bg-[#140B35] lg:w-[42%]">

          {/* Theme Button */}
          <button
            onClick={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
            className="absolute right-6 top-8 rounded-2xl border border-slate-200 bg-white p-3 shadow-md transition-all duration-300 hover:scale-105 hover:bg-slate-100 dark:border-violet-500/20 dark:bg-[#1E1145] dark:hover:bg-[#271658]"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-700" />
            )}
          </button>

          <LoginForm />

        </div>

      </div>
    </div>
  );
};

export default LoginPage;