export type DateFieldProps = {
  label: string;
  value: string;
  onChange: (fecha: string) => void;
  onBlur: () => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
};
