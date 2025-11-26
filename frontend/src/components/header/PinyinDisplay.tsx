type Props = {
  currentPinyin: string;
  currentHint: string;
};

export default function PinyinDisplay(props: Props) {
  return (
    <div className="flex flex-row justify-center items-center">
      <div className="text-[60px]">({props.currentPinyin})</div>
      <button
        className="border rounded-full w-6 h-6 ml-4"
        title={props.currentHint}
      >
        ?
      </button>
    </div>
  );
}
