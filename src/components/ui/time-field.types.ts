export type TimeFieldProps = {
  label: string;
  /** Hora en formato HH:MM (24 h). */
  value: string;
  onChange: (hora: string) => void;
  /** Hora mínima aceptada por el control web (HH:MM). */
  minimo?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
};
