import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { site } from "@/lib/site";

export function RentalRequestForm({
  defaultEquipment = "",
}: {
  defaultEquipment?: string;
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    equipment: defaultEquipment,
    startDate: "",
    duration: "Daily",
    operator: "Not needed",
    message: "",
  });

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name || !form.phone || !form.equipment) {
      toast.error("Please add your name, phone number and the equipment you need.");
      return;
    }
    const body = [
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `Email: ${form.email}`,
      `Equipment needed: ${form.equipment}`,
      `Rental start date: ${form.startDate}`,
      `Rental duration: ${form.duration}`,
      `Driver/operator needed: ${form.operator}`,
      "",
      form.message,
    ].join("\n");

    window.location.href = `${site.emailHref}?subject=${encodeURIComponent(
      `Rental request — ${form.equipment}`,
    )}&body=${encodeURIComponent(body)}`;

    toast.success("Your rental request is ready to send", {
      description: `You can also call ${site.phone} to confirm availability right away.`,
    });
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Full Name" required>
        <input
          className={inputClass}
          value={form.name}
          onChange={(e) => update("name")(e.target.value)}
          placeholder="Your full name"
        />
      </Field>
      <Field label="Phone" required>
        <input
          className={inputClass}
          value={form.phone}
          onChange={(e) => update("phone")(e.target.value)}
          placeholder="(281) 000-0000"
          inputMode="tel"
        />
      </Field>
      <Field label="Email">
        <input
          className={inputClass}
          type="email"
          value={form.email}
          onChange={(e) => update("email")(e.target.value)}
          placeholder="you@email.com"
        />
      </Field>
      <Field label="Equipment Needed" required>
        <input
          className={inputClass}
          value={form.equipment}
          onChange={(e) => update("equipment")(e.target.value)}
          placeholder="e.g. 2025 Toyota Tundra or Skid Steer"
        />
      </Field>
      <Field label="Rental Start Date">
        <input
          className={inputClass}
          type="date"
          value={form.startDate}
          onChange={(e) => update("startDate")(e.target.value)}
        />
      </Field>
      <Field label="Rental Duration">
        <select
          className={inputClass}
          value={form.duration}
          onChange={(e) => update("duration")(e.target.value)}
        >
          <option>Daily</option>
          <option>Multiple days</option>
          <option>Weekly</option>
          <option>Monthly</option>
        </select>
      </Field>
      <Field label="Driver / Operator Needed?">
        <select
          className={inputClass}
          value={form.operator}
          onChange={(e) => update("operator")(e.target.value)}
        >
          <option>Not needed (Self-Operated)</option>
          <option>Yes, need certified operator</option>
          <option>Not sure yet</option>
        </select>
      </Field>
      <Field label="Additional Project Details" className="sm:col-span-2">
        <textarea
          className={`${inputClass} min-h-28 resize-y`}
          value={form.message}
          onChange={(e) => update("message")(e.target.value)}
          placeholder="Tell us about job location, dates, delivery questions, or equipment attachments required."
        />
      </Field>
      <div className="sm:col-span-2 pt-2">
        <button type="submit" className="btn-base btn-primary w-full sm:w-auto font-bold shadow-md hover:shadow-lg">
          <Send className="size-4" />
          <span>Send Rental Request</span>
        </button>
        <p className="mt-3 text-xs font-semibold text-slate-500">
          Need faster confirmation? Call us directly at{" "}
          <a href={site.phoneHref} className="font-extrabold text-[#0040DD] hover:underline">
            {site.phone}
          </a>
          .
        </p>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#0040DD] focus:bg-white focus:ring-2 focus:ring-[#0040DD]/15";

function Field({
  label,
  children,
  required,
  className,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
        {label}
        {required && <span className="text-[#F59E0B]"> *</span>}
      </span>
      {children}
    </label>
  );
}
