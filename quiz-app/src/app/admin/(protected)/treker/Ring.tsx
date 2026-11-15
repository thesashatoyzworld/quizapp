import styles from './treker.module.css';

type Props = {
  progress: number;
  size: number;
  stroke?: number;
  /** Подпись в центре; без неё рисуется только круг. */
  label?: React.ReactNode;
  sub?: React.ReactNode;
};

/** Круг-«зарядка»: дуга заполняется по доле сделанных шагов, на 100% становится зелёной. */
export default function Ring({ progress, size, stroke = Math.max(3, size / 14), label, sub }: Props) {
  const p = Math.min(1, Math.max(0, progress));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const full = p >= 1;
  const charging = p > 0 && !full;
  // Искра бежит по заполненной части от начала к краю, как зарядка.
  const spark = Math.min(c * p, c * 0.08);
  const state = full ? styles.ringFull : charging ? styles.ringCharging : styles.ringEmpty;
  return (
    <div className={`${styles.ring} ${state}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className={styles.ringTrack} cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        <circle
          className={styles.ringArc}
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p)}
        />
        {charging && (
          <circle
            className={styles.ringSpark}
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            strokeDasharray={`${spark} ${c}`}
            style={{ ['--arc' as string]: `${-(c * p - spark)}px` }}
          />
        )}
      </svg>
      {label !== undefined && (
        <div className={styles.ringCenter}>
          <div className={styles.ringLabel}>{label}</div>
          {sub !== undefined && <div className={styles.ringSub}>{sub}</div>}
        </div>
      )}
    </div>
  );
}
