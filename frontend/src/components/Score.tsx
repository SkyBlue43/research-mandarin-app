export default function Score({ accuracy }: { accuracy: number }) {
  //   const calculateColor = (accuracy: number) => {
  //     if (accuracy > )
  //   }

  return (
    <div className="flex justify-center items-center">
      {accuracy !== 0.0 && (
        <div className="w-64 h-64 flex justify-center items-center rounded-lg border-4 border-[#4682B4] text-[#4682B4] font-bold text-xl">
          {accuracy}%
        </div>
      )}
    </div>
  );
}
