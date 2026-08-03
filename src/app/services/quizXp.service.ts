export type QuizXpAwardBasis = "completion" | "performance" | "combined";

export type QuizXpRulesConfig = {
  enabled: boolean;
  basis: QuizXpAwardBasis;
  completionXp: number;
  passXp: number;
  perfectScoreXp: number;
  firstAttemptOnly: boolean;
  requirePassForXp: boolean;
};

export type XPGamificationConfig = {
  minimumQuizPassScore: number;
  quizXpRules: QuizXpRulesConfig;
};

export type QuizXpAwardResult = {
  earned: number;
  breakdown: string[];
  alreadyAwarded: boolean;
  enabled: boolean;
};

export const XP_GAMIFICATION_CONFIG_STORAGE_KEY = "learnos_xp_gamification_config";

export const QUIZ_XP_AWARD_LEDGER_STORAGE_KEY = "learnos_quiz_xp_award_ledger";

export const DEFAULT_QUIZ_XP_RULES: QuizXpRulesConfig = {
  enabled: true,
  basis: "combined",
  completionXp: 40,
  passXp: 80,
  perfectScoreXp: 150,
  firstAttemptOnly: true,
  requirePassForXp: true,
};

export const loadXpGamificationConfig = (): XPGamificationConfig => {
  const fallback: XPGamificationConfig = {
    minimumQuizPassScore: 70,
    quizXpRules: DEFAULT_QUIZ_XP_RULES,
  };

  if (typeof window === "undefined") return fallback;

  try {
    const stored = window.localStorage.getItem(XP_GAMIFICATION_CONFIG_STORAGE_KEY);
    if (!stored) return fallback;

    const parsed = JSON.parse(stored) as Partial<XPGamificationConfig>;
    const parsedBasis = parsed.quizXpRules?.basis;
    const safeBasis: QuizXpAwardBasis =
      parsedBasis === "completion" || parsedBasis === "performance" || parsedBasis === "combined"
        ? parsedBasis
        : DEFAULT_QUIZ_XP_RULES.basis;

    return {
      minimumQuizPassScore:
        typeof parsed.minimumQuizPassScore === "number"
          ? Math.max(0, Math.min(100, parsed.minimumQuizPassScore))
          : fallback.minimumQuizPassScore,
      quizXpRules: {
        ...DEFAULT_QUIZ_XP_RULES,
        ...(parsed.quizXpRules ?? {}),
        basis: safeBasis,
      },
    };
  } catch {
    return fallback;
  }
};

export const loadQuizXpAwardLedger = (): Record<string, number> => {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(
      window.localStorage.getItem(QUIZ_XP_AWARD_LEDGER_STORAGE_KEY) ?? "{}",
    ) as Record<string, number>;
  } catch {
    return {};
  }
};

export const calculateQuizXpAward = (
  quizId: string,
  scorePct: number,
  config = loadXpGamificationConfig(),
): QuizXpAwardResult => {
  const rules = config.quizXpRules;
  const alreadyAwarded = Boolean(loadQuizXpAwardLedger()[quizId]);
  if (!rules.enabled) return { earned: 0, breakdown: [], alreadyAwarded, enabled: false };
  if (rules.firstAttemptOnly && alreadyAwarded) {
    return {
      earned: 0,
      breakdown: ["XP already awarded for this quiz"],
      alreadyAwarded,
      enabled: true,
    };
  }

  const passed = scorePct >= config.minimumQuizPassScore;
  if (rules.requirePassForXp && !passed) {
    return {
      earned: 0,
      breakdown: [`No XP awarded until score reaches ${config.minimumQuizPassScore}%`],
      alreadyAwarded,
      enabled: true,
    };
  }

  const breakdown: string[] = [];
  let earned = 0;

  if (rules.basis === "completion" || rules.basis === "combined") {
    earned += rules.completionXp;
    breakdown.push(`Quiz completion +${rules.completionXp} XP`);
  }

  if ((rules.basis === "performance" || rules.basis === "combined") && passed) {
    earned += rules.passXp;
    breakdown.push(`Passing score +${rules.passXp} XP`);

    if (scorePct === 100) {
      earned += rules.perfectScoreXp;
      breakdown.push(`Perfect score bonus +${rules.perfectScoreXp} XP`);
    }
  }

  return { earned, breakdown, alreadyAwarded, enabled: true };
};

export const recordQuizXpAward = (quizId: string, award: QuizXpAwardResult) => {
  if (typeof window === "undefined" || award.earned <= 0) return;

  const ledger = loadQuizXpAwardLedger();
  ledger[quizId] = (ledger[quizId] ?? 0) + award.earned;
  window.localStorage.setItem(QUIZ_XP_AWARD_LEDGER_STORAGE_KEY, JSON.stringify(ledger));
};
