import { useState, useCallback, useRef } from 'react';

export type ValidatorFn<T> = (values: T) => Partial<Record<keyof T, string>>;

export interface UseFormOptions<T> {
  initialValues: T;
  validate?: ValidatorFn<T>;
  onSubmit: (values: T) => Promise<void> | void;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Set single field value
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      // If field was already touched and had an error, validate live
      if (validate && touched[field]) {
        const validationErrors = validate(next);
        setErrors((prevErr) => ({
          ...prevErr,
          [field]: validationErrors[field] || undefined,
        }));
      }
      return next;
    });
  }, [validate, touched]);

  // Handle blur: validate on blur
  const handleBlur = useCallback((field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (validate) {
      const validationErrors = validate(values);
      setErrors((prevErr) => ({
        ...prevErr,
        [field]: validationErrors[field] || undefined,
      }));
    }
  }, [validate, values]);

  // Standard input change handler
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFieldValue(name as keyof T, finalValue);
  }, [setFieldValue]);

  // Submit handler
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    // Validate all fields
    let validationErrors: Partial<Record<keyof T, string>> = {};
    if (validate) {
      validationErrors = validate(values);
    }

    const hasErrors = Object.values(validationErrors).some(Boolean);

    if (hasErrors) {
      setErrors(validationErrors);
      // Mark all fields with errors as touched
      const allTouched: Partial<Record<keyof T, boolean>> = {};
      Object.keys(values).forEach((k) => {
        allTouched[k as keyof T] = true;
      });
      setTouched(allTouched);

      // Focus the first invalid field on submit
      setTimeout(() => {
        if (formRef.current) {
          const firstInvalid = formRef.current.querySelector<HTMLElement>(
            '[aria-invalid="true"], :invalid'
          );
          if (firstInvalid) {
            firstInvalid.focus();
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 30);
      return;
    }

    // Trim string inputs before submitting
    const trimmedValues: any = { ...values };
    Object.keys(trimmedValues).forEach((key) => {
      if (typeof trimmedValues[key] === 'string') {
        trimmedValues[key] = trimmedValues[key].trim();
      }
    });

    try {
      setIsSubmitting(true);
      await onSubmit(trimmedValues);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, validate, values, onSubmit]);

  const resetForm = useCallback((newValues?: T) => {
    setValues(newValues || initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    formRef,
    setValues,
    setFieldValue,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  };
}
