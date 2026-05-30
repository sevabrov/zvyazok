export const BackgroundBlobs = () => {
  return (
    <>
      <div className="animate-blob pointer-events-none absolute -left-28 -top-24 h-[420px] w-[420px] rounded-full bg-fuchsia-500/55 blur-[80px]" />
      <div className="animate-blob-delayed pointer-events-none absolute -bottom-32 -right-28 h-[420px] w-[420px] rounded-full bg-violet-500/55 blur-[80px]" />
      <div className="animate-blob-slow pointer-events-none absolute left-[52%] top-[42%] h-80 w-80 rounded-full bg-indigo-600/25 blur-[80px]" />
    </>
  );
};
