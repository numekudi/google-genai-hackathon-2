export type TimePickerProps = {
  value: string; // "HH:mm"
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
};

export function TimePicker({
  value,
  onChange,
  className,
  disabled,
}: TimePickerProps) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      disabled={disabled}
      step={60} // 1分単位
    />
  );
}
