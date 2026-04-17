export const POSITION_OPTIONS = [
  { value: "BACKEND", label: "백엔드" },
  { value: "FRONTEND", label: "프론트엔드" },
  { value: "FULLSTACK", label: "풀스택" },
  { value: "DEVOPS", label: "DevOps/인프라" },
  { value: "AI_ML", label: "AI/ML" },
  { value: "MOBILE", label: "모바일" },
  { value: "OTHER", label: "기타" },
] as const;

export const POSITION_LABELS: Record<string, string> = POSITION_OPTIONS.reduce(
  (acc, item) => ({ ...acc, [item.value]: item.label }),
  {} as Record<string, string>,
);
