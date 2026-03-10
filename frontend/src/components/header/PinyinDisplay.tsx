type Props = {
  currentPinyin: string;
  currentHint: string;
};

export default function PinyinDisplay(props: Props) {
  return (
    <div className="surface flex flex-row justify-center items-center gap-3 px-4 py-2 md:px-6 md:py-3">
      <div className="text-[1.75rem] sm:text-[2.4rem] md:text-[3rem] font-semibold text-stone-700">
        ({props.currentPinyin})
      </div>
      <button
        className="w-8 h-8 rounded-full border border-stone-300 text-stone-700 font-bold bg-stone-100 hover:bg-stone-200"
        title={props.currentHint}
        aria-label="Show pronunciation hint"
      >
        ?
      </button>
    </div>
  );
}
