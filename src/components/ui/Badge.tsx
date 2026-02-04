import type { ProcessType } from '../../types';

interface BadgeProps {
  type: ProcessType;
}

export function Badge({ type }: BadgeProps) {
  return (
    <span className="type-badge">
      {type}
    </span>
  );
}
