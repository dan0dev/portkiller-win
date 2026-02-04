interface StatusDotProps {
  status: 'listening' | 'established' | 'inactive';
}

export function StatusDot({ status }: StatusDotProps) {
  const colors = {
    listening: 'bg-accent-green',
    established: 'bg-accent-blue',
    inactive: 'bg-text-muted',
  };

  return <div className={`w-2 h-2 rounded-full ${colors[status]}`} />;
}
