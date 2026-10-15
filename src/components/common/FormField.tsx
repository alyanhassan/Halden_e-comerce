import React from 'react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  label: string;
  error?: string;
  touched?: boolean;
  helpText?: string;
  as?: 'input' | 'textarea' | 'select';
  rows?: number;
  options?: Array<{ value: string; label: string }>;
  onValueChange?: (value: string) => void;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  name,
  label,
  error,
  touched,
  helpText,
  as = 'input',
  rows = 4,
  options = [],
  className = '',
  required,
  ...rest
}) => {
  const showError = Boolean(error && touched);
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  const baseInputStyles = `w-full px-3.5 py-2.5 text-xs font-body text-[#111111] bg-[#FEFAE0] border transition-colors focus:outline-none ${
    showError
      ? 'border-red-600 bg-red-50/20 focus:border-red-700'
      : 'border-[#111111] focus:bg-[#FAEDCD]'
  } ${className}`;

  return (
    <div className="space-y-1 w-full text-left">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block font-cta text-[11px] uppercase tracking-wider text-[#111111]">
          {label} {required && <span className="text-red-700" aria-hidden="true">*</span>}
        </label>
      </div>

      {as === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          required={required}
          aria-invalid={showError ? 'true' : 'false'}
          aria-describedby={showError ? errorId : helpText ? helpId : undefined}
          className={baseInputStyles}
          {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : as === 'select' ? (
        <select
          id={id}
          name={name}
          required={required}
          aria-invalid={showError ? 'true' : 'false'}
          aria-describedby={showError ? errorId : helpText ? helpId : undefined}
          className={`${baseInputStyles} cursor-pointer`}
          {...(rest as React.SelectHTMLAttributes<HTMLSelectElement>)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={name}
          required={required}
          aria-invalid={showError ? 'true' : 'false'}
          aria-describedby={showError ? errorId : helpText ? helpId : undefined}
          className={baseInputStyles}
          {...rest}
        />
      )}

      {/* Help text */}
      {helpText && !showError && (
        <p id={helpId} className="text-[11px] font-mono text-[#111111]/70">
          {helpText}
        </p>
      )}

      {/* Error text under the field */}
      {showError && (
        <p id={errorId} role="alert" className="text-[11px] font-mono text-red-700 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};
