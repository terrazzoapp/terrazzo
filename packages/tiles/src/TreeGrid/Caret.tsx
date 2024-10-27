export function Caret({ isExpanded = false }: { isExpanded?: boolean }) {
  return (
    <span className='tz-treegrid-caret' aria-hidden='true' data-expanded={isExpanded}>
      ▸
    </span>
  );
}
