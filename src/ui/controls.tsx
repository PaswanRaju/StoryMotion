import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';

type ToggleProps = {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: ReactNode;
  disabled?: boolean;
};

/** A chunky on/off switch: the knob springs across a glowing track. */
export function Toggle({
  label,
  checked,
  onChange,
  description,
  disabled,
}: ToggleProps) {
  const id = useId();
  return (
    <div className="ui-field ui-field--toggle">
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-desc` : undefined}
        disabled={disabled}
        data-sfx="toggle"
        className={`ui-toggle${checked ? ' is-on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="ui-toggle__track" aria-hidden="true">
          <span className="ui-toggle__knob" />
        </span>
        <span className="ui-toggle__label" id={`${id}-label`}>
          {label}
        </span>
      </button>
      {description && (
        <p className="ui-field__hint" id={`${id}-desc`}>
          {description}
        </p>
      )}
    </div>
  );
}

type SliderProps = {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  /** Visible value text, e.g. "80%". */
  format?: (value: number) => string;
  disabled?: boolean;
};

/** Native range input (keyboard + screen reader for free) dressed as candy. */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  disabled,
}: SliderProps) {
  const id = useId();
  const fill = max > min ? ((value - min) / (max - min)) * 100 : 0;
  const text = format?.(value);
  return (
    <div className="ui-field">
      <label className="ui-field__label" htmlFor={id}>
        <span>{label}</span>
        {text && <output htmlFor={id}>{text}</output>}
      </label>
      <input
        id={id}
        className="ui-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={text}
        style={{ ['--fill' as string]: `${fill}%` }}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> & {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
};

/** Native select with the candy frame (grown-up settings). */
export function Select({
  label,
  value,
  onChange,
  options,
  ...rest
}: SelectProps) {
  const id = useId();
  return (
    <div className="ui-field">
      <label className="ui-field__label" htmlFor={id}>
        {label}
      </label>
      <span className="ui-select">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </span>
    </div>
  );
}
