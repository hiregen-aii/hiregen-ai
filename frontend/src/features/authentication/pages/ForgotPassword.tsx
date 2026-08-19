import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";

type ForgotPasswordForm = {
  email: string;
};

const ForgotPassword = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

  const onSubmit = (data: ForgotPasswordForm) => {
    console.log(data);

    // Future API
    // await axios.post("/auth/forgot-password", data);

    navigate("/reset-password");
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#f5f5fb] transition-colors duration-300 dark:bg-[#020617]">
      <div className="w-full max-w-[500px] rounded-[36px] border border-slate-200 bg-white p-10 shadow-2xl transition-colors duration-300 dark:border-slate-700 dark:bg-[#111827]">

        {/* Back Button */}

        <Link
          to="/login"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:underline"
        >
          <ArrowLeft size={18} />
          Back to Login
        </Link>

        {/* Icon */}

        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600">
          <Mail className="h-10 w-10 text-white" />
        </div>

        {/* Heading */}

        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Forgot Password?
        </h1>

        <p className="mt-3 text-slate-500 dark:text-slate-400">
          Enter your registered email address and we'll send you a password reset link.
        </p>

        {/* Form */}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-6"
        >
          <div>
            <label className="mb-2 block font-medium text-slate-700 dark:text-slate-200">
              Email Address
            </label>

            <Input
              type="email"
              placeholder="Enter your email"
              className="h-14 rounded-2xl"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Enter a valid email address",
                },
              })}
            />

            {errors.email && (
              <p className="mt-2 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="h-14 w-full rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-base font-semibold hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700"
          >
            <Send className="mr-2 h-5 w-5" />
            Send Reset Link
          </Button>
        </form>

        {/* Footer */}

        <div className="mt-10 border-t border-slate-200 pt-6 text-center dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-semibold text-violet-600 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;