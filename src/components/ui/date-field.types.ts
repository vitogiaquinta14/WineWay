export type DateFieldProps = {
  label: string;
  hint?: string;
  minimumDate?: string;
  maximumDate?: string;
  value: string;
  onChange: (fecha: string) => void;
  onBlur: () => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
};
