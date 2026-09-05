import type { ChangeEvent } from "react";

import FormInput from "./FormInput";
import FormSelect from "./FormSelect";

interface LeadFormData {
  company: string;
  contact: string;
  designation: string;
  email: string;
  phone: string;
  website: string;
  source: string;
  type: string;
  score: number;
  status: string;
}

interface LeadFormProps {
  form: LeadFormData;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

const LeadForm = ({
  form,
  onChange,
}: LeadFormProps) => {
  return (
    <div className="grid grid-cols-2 gap-5">

      <FormInput
        label="Company"
        name="company"
        value={form.company}
        onChange={onChange}
        required
      />

      <FormInput
        label="HR Contact"
        name="contact"
        value={form.contact}
        onChange={onChange}
        required
      />

      <FormInput
        label="Designation"
        name="designation"
        value={form.designation}
        onChange={onChange}
      />

      <FormInput
        label="Email"
        name="email"
        value={form.email}
        onChange={onChange}
        required
      />

      <FormInput
        label="Phone"
        name="phone"
        value={form.phone}
        onChange={onChange}
        required
      />

      <FormInput
        label="Website"
        name="website"
        value={form.website}
        onChange={onChange}
      />

      <FormSelect
        label="Lead Source"
        name="source"
        value={form.source}
        onChange={onChange}
        options={[
          "LinkedIn",
          "Naukri",
          "Indeed",
          "Referral",
        ]}
      />

      <FormSelect
        label="Job Type"
        name="type"
        value={form.type}
        onChange={onChange}
        options={[
          "Internship",
          "Full Time",
          "Contract",
        ]}
      />

      <FormInput
        label="Lead Score"
        name="score"
        type="number"
        value={form.score}
        onChange={onChange}
      />

      <FormSelect
        label="Status"
        name="status"
        value={form.status}
        onChange={onChange}
        options={[
          "Contacted",
          "Replied",
          "Meeting",
          "Proposal Sent",
          "Client Won",
        ]}
      />

    </div>
  );
};

export default LeadForm;