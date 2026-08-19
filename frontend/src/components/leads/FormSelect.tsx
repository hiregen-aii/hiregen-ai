import type { ChangeEvent } from "react";

interface FormSelectProps {
  label: string;
  name: string;
  value: string;
  options: string[];

  onChange: (
    e: ChangeEvent<HTMLSelectElement>
  ) => void;
}

const FormSelect = ({
  label,
  options,
  ...props
}: FormSelectProps) => {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium dark:text-white">
        {label}
      </label>

      <select
        {...props}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      >

        {options.map((item) => (
          <option key={item}>
            {item}
          </option>
        ))}

      </select>

    </div>
  );
};

export default FormSelect;