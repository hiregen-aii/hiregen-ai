import type { ChangeEvent } from "react";

interface FormInputProps {
  label: string;
  name: string;
  value: string | number;
  type?: string;
  required?: boolean;
  onChange: (
    e: ChangeEvent<HTMLInputElement>
  ) => void;
}

const FormInput = ({
  label,
  required,
  ...props
}: FormInputProps) => {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium dark:text-white">

        {label}

        {required && (
          <span className="text-red-500"> *</span>
        )}

      </label>

      <input
        {...props}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />

    </div>
  );
};

export default FormInput;