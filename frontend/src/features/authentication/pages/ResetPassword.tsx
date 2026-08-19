import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ResetPasswordForm = {
  password: string;
  confirmPassword: string;
};

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const password = watch("password");

  const onSubmit = (data: ResetPasswordForm) => {
    console.log(data);

    // Future API
    // axios.post("/auth/reset-password", data);

    alert("Password updated successfully!");
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#f5f5fb] transition-colors duration-300 dark:bg-[#020617]">
      <div className="w-full max-w-[500px] rounded-[36px] border border-slate-200 bg-white p-10 shadow-2xl transition-colors duration-300 dark:border-slate-700 dark:bg-[#111827]">

        {/* Back */}

        <Link
          to="/login"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:underline"
        >
          <ArrowLeft size={18} />
          Back to Login
        </Link>

        {/* Icon */}

        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-600">
          <Lock className="h-10 w-10 text-white" />
        </div>

        {/* Heading */}

        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Reset Password
        </h1>

        <p className="mt-3 text-slate-500 dark:text-slate-400">
          Create a new secure password for your account.
        </p>

        {/* Form */}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-6"
        >
          {/* New Password */}

          <div>
            <label className="mb-2 block font-medium text-slate-700 dark:text-slate-200">
              New Password
            </label>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="h-14 rounded-2xl pr-12"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Minimum 8 characters",
                  },
                })}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="mt-2 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}

          <div>
            <label className="mb-2 block font-medium text-slate-700 dark:text-slate-200">
              Confirm Password
            </label>

            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                className="h-14 rounded-2xl pr-12"
                {...register("confirmPassword", {
                  required: "Confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showConfirm ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit */}

          <Button
            type="submit"
            className="h-14 w-full rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-base font-semibold hover:from-violet-700 hover:to-fuchsia-700"
          >
            Update Password
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

export default ResetPassword;