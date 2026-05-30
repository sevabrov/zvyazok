import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Heart, HelpCircle, WandSparkles, X, Zap } from "lucide-react";
import { CardType } from "./cards";
import { languages } from "./i18n";
import { getRandomItem } from "./utils";

type ActiveCard = {
  type: CardType;
  text: string;
} | null;

export function App() {
  const { t, i18n } = useTranslation();
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<ActiveCard>(null);

  const openCard = useCallback(() => {
    setActiveCard(null);
    setIsCardOpen(true);
  }, []);

  const closeCard = useCallback(() => {
    setIsCardOpen(false);
    setActiveCard(null);
  }, []);

  const revealCard = useCallback(
    (type: CardType) => {
      const cards = t(type === "truth" ? "truthCards" : "dareCards", {
        returnObjects: true,
      }) as string[];

      setActiveCard({
        type,
        text: getRandomItem(cards),
      });
    },
    [t],
  );

  const nextCard = useCallback(() => {
    setActiveCard(null);
  }, []);

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-[#080610] px-6 py-8 text-white">
      <BackgroundBlobs />

      <div className="absolute right-4 top-4 z-1 flex gap-1 rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur">
        {languages.map((lng) => (
          <button
            key={lng}
            type="button"
            onClick={() => i18n.changeLanguage(lng)}
            aria-pressed={i18n.resolvedLanguage === lng}
            className={`rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wide transition ${
              i18n.resolvedLanguage === lng
                ? "bg-white/90 text-[#080610]"
                : "text-white/70 hover:text-white"
            }`}
          >
            {lng}
          </button>
        ))}
      </div>

      <section className="relative z-10 w-full max-w-md text-center">
        <h1 className="text-[clamp(2.3rem,10vw,4rem)] leading-[0.9] font-black tracking-[-0.07em]">
          {t("ui.titleLine1")}
          <br />
          {t("ui.titleLine2")}
        </h1>

        <p className="mx-auto mt-5 max-w-xs text-sm leading-6 text-white/70">
          {t("ui.subtitle")}
        </p>

        <button
          type="button"
          onClick={openCard}
          className="group relative mt-9 h-52 w-52 rounded-full bg-linear-to-br from-fuchsia-500 to-violet-500 p-7 text-2xl leading-none font-black shadow-[0_30px_90px_rgba(217,70,239,0.3)] transition hover:-translate-y-1 hover:scale-[1.03] active:translate-y-0 active:scale-95"
        >
          <span className="absolute -inset-3 rounded-full border border-white/15 opacity-50 transition group-hover:scale-105 group-hover:opacity-25" />
          <span className="absolute inset-0 rounded-full bg-radial-[circle_at_35%_25%] from-white/35 via-transparent to-transparent" />
          <span className="relative flex h-full flex-col items-center justify-center gap-3">
            <WandSparkles className="h-9 w-9" aria-hidden="true" />
            {t("ui.pickCardLine1")}
            <br />
            {t("ui.pickCardLine2")}
          </span>
        </button>

        <p className="mt-5 text-xs text-white/45">{t("ui.hint")}</p>
      </section>

      {isCardOpen && (
        <section
          className="fixed inset-0 z-20 grid place-items-center bg-black/55 px-6 py-8 backdrop-blur-xl"
          aria-modal="true"
          role="dialog"
        >
          <button
            type="button"
            onClick={closeCard}
            className="absolute right-5 top-5 rounded-full border border-white/10 bg-white/10 p-3 text-white/80 backdrop-blur transition hover:bg-white/15"
            aria-label={t("ui.closeCard")}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          <article className="animate-card-in relative flex h-[min(540px,78dvh)] w-full max-w-[380px] flex-col justify-between overflow-hidden rounded-[34px] border border-white/20 bg-white/10 p-7 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/20 via-white/5 to-transparent" />
            <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-fuchsia-400/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-violet-500/45 blur-3xl" />
            <div className="pointer-events-none absolute inset-[1px] rounded-[33px] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:34px_34px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />

            <div className="relative z-10 grid flex-1 place-items-center text-center">
              {!activeCard ? (
                <div className="animate-question-float grid h-40 w-40 place-items-center rounded-[42px] bg-linear-to-br from-fuchsia-500 to-violet-500 shadow-[0_20px_70px_rgba(139,92,246,0.35)]">
                  <HelpCircle
                    className="h-24 w-24"
                    strokeWidth={2.4}
                    aria-hidden="true"
                  />
                </div>
              ) : (
                <div className="animate-text-in">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white/70">
                    {activeCard.type === "truth" ? (
                      <Heart
                        className="h-4 w-4 text-fuchsia-200"
                        aria-hidden="true"
                      />
                    ) : (
                      <Zap
                        className="h-4 w-4 text-violet-200"
                        aria-hidden="true"
                      />
                    )}
                    {t(`ui.${activeCard.type}`)}
                  </div>

                  <p className="text-[clamp(1.65rem,7vw,2.25rem)] leading-[1.08] font-black tracking-[-0.055em]">
                    {activeCard.text}
                  </p>
                </div>
              )}
            </div>

            <div className="relative z-10">
              {!activeCard ? (
                <>
                  <p className="mb-4 text-center text-sm leading-6 text-white/70">
                    {t("ui.choosePrompt")}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => revealCard("truth")}
                      className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 text-base font-black backdrop-blur transition hover:bg-white/15"
                    >
                      <Heart
                        className="h-5 w-5 text-fuchsia-200"
                        aria-hidden="true"
                      />
                      {t("ui.truth")}
                    </button>

                    <button
                      type="button"
                      onClick={() => revealCard("dare")}
                      className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 text-base font-black backdrop-blur transition hover:bg-white/15"
                    >
                      <Zap
                        className="h-5 w-5 text-violet-200"
                        aria-hidden="true"
                      />
                      {t("ui.dare")}
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={nextCard}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-br from-fuchsia-500 to-violet-500 text-base font-black shadow-[0_18px_42px_rgba(217,70,239,0.22)] transition hover:-translate-y-0.5 active:translate-y-0"
                >
                  {t("ui.nextCard")}
                </button>
              )}
            </div>
          </article>
        </section>
      )}
    </main>
  );
}

function BackgroundBlobs() {
  return (
    <>
      <div className="animate-blob pointer-events-none absolute -left-28 -top-24 h-[420px] w-[420px] rounded-full bg-fuchsia-500/55 blur-[80px]" />
      <div className="animate-blob-delayed pointer-events-none absolute -bottom-32 -right-28 h-[420px] w-[420px] rounded-full bg-violet-500/55 blur-[80px]" />
      <div className="animate-blob-slow pointer-events-none absolute left-[52%] top-[42%] h-80 w-80 rounded-full bg-indigo-600/25 blur-[80px]" />
    </>
  );
}
