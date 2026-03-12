type Props = {
  currentPinyin: string;
  currentHint: string;
};

export default function PinyinDisplay(props: Props) {
  return (
    <div className="surface flex flex-row justify-center items-center gap-[clamp(0.4rem,2vw,0.75rem)] px-[clamp(0.5rem,2.5vw,1rem)] py-[clamp(0.35rem,1.6vw,0.65rem)]">
      <div className="text-[clamp(1rem,4.8vw,2.2rem)] font-semibold text-stone-700">
        ({props.currentPinyin})
      </div>
      <button
        className="w-[clamp(1.5rem,5vw,2rem)] h-[clamp(1.5rem,5vw,2rem)] rounded-full border border-stone-300 text-stone-700 text-[clamp(0.7rem,2.6vw,0.95rem)] font-bold bg-stone-100 hover:bg-stone-200"
        title={props.currentHint}
        aria-label="Show pronunciation hint"
      >
        ?
      </button>
    </div>
  );
}
