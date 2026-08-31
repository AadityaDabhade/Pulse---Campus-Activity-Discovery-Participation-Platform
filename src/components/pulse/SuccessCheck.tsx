export function SuccessCheck() {
  return (
    <div className="relative flex items-center justify-center">
      <span className="absolute h-24 w-24 rounded-full bg-primary/20 animate-ring" />
      <span className="absolute h-24 w-24 rounded-full bg-primary/10 animate-ring [animation-delay:0.3s]" />
      <div className="relative h-20 w-20 rounded-full bg-primary flex items-center justify-center shadow-green animate-pop">
        <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none">
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="white"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-draw"
          />
        </svg>
      </div>
    </div>
  );
}