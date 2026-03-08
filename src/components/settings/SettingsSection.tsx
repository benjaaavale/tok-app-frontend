"use client";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <div className="bg-bg-secondary rounded-2xl border border-border-secondary overflow-hidden">
      <div className="px-5 py-4 border-b border-border-secondary">
        <h3 className="text-[14px] font-semibold text-text-primary">
          {title}
        </h3>
        {description && (
          <p className="text-[12px] text-text-muted mt-0.5">{description}</p>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

interface FieldRowProps {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}

export function FieldRow({ label, htmlFor, children }: FieldRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 py-2">
      <label
        htmlFor={htmlFor}
        className="text-[12px] font-medium text-text-secondary sm:w-[140px] flex-shrink-0"
      >
        {label}
      </label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export function InputField({
  id,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3 py-2 rounded-xl bg-bg-primary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all disabled:opacity-50"
    />
  );
}
