import FloatingStats from "./FloatingStats";
import {
  Sparkles,
  Quote,
} from "lucide-react";

const LeftHero = () => {
  return (
    <section className="relative flex h-full min-h-screen overflow-hidden rounded-l-[32px] bg-gradient-to-br from-[#140B35] via-[#2A1262] to-[#431B8F]">

      {/* Background Glow */}
      <div className="absolute inset-0">

        <div className="absolute left-10 top-8 h-16 w-16 rounded-full bg-violet-500/40 blur-2xl" />
        <div className="absolute right-24 top-20 h-14 w-14 rounded-full bg-purple-300/50 blur-xl" />
        <div className="absolute left-1/2 top-20 h-10 w-10 rounded-full bg-cyan-400 blur-lg" />
        <div className="absolute right-60 top-40 h-6 w-6 rounded-full bg-white blur-sm" />

        <div className="absolute bottom-44 left-6 h-16 w-16 rounded-full bg-purple-500/40 blur-2xl" />
        <div className="absolute bottom-20 right-16 h-24 w-24 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="absolute left-14 bottom-40 h-5 w-5 rounded-full bg-cyan-400 blur-md" />
        <div className="absolute bottom-12 left-56 h-8 w-8 rounded-full bg-pink-500 blur-lg" />

      </div>

      <div className="relative z-10 flex w-full flex-col px-10 py-10">

        {/* Logo */}

        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-[0_0_40px_rgba(139,92,246,.55)]">

            <Sparkles className="h-8 w-8 text-white" />

          </div>

          <div>

            <h2 className="text-3xl font-bold text-white">

              HireGen <span className="text-violet-400">AI</span>

            </h2>

            <p className="text-lg text-violet-200">

              AI-Powered Recruitment

            </p>

          </div>

        </div>

        {/* Heading */}

        <div className="mt-20 max-w-2xl">

          <h1 className="leading-[1.05] text-[60px] font-black tracking-tight text-white">

            Hire Smarter,
            <br />
            Faster with{" "}
            <span className="text-violet-400">
              AI
            </span>

          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-violet-200">

            Find hiring signals, enrich leads,
            and manage outreach in one intelligent workspace.

          </p>

        </div>

        <FloatingStats />

        {/* Quote */}

        <div className="mt-25 flex justify-center">

          <div className="flex w-[420px] items-center gap-5 rounded-2xl border border-violet-400/30 bg-gradient-to-r from-violet-700/80 to-purple-700/80 px-7 py-5 backdrop-blur-xl">

            <div className="rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 p-4">

              <Quote className="h-8 w-8 text-white" />

            </div>

            <div>

              <p className="text-3xl font-bold text-white">

                AI doesn't replace recruiters.

              </p>

              <p className="text-3xl font-bold text-yellow-300">

                It empowers them.

              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};

export default LeftHero;