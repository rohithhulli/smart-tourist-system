export default function ValidationMessage({ message, id }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-[11px] text-rose-400 font-medium flex items-center gap-1">
      <span aria-hidden="true">⚠</span> {message}
    </p>
  );
}
