import type { TechStackItem } from "./types";

type TechStackContainer =
  | unknown[]
  | { techStacks?: unknown }
  | { data?: { techStacks?: unknown; data?: { techStacks?: unknown } } };

export function extractTechStacks(payload: TechStackContainer): TechStackItem[] {
  const candidates = [
    payload,
    (payload as any)?.techStacks,
    (payload as any)?.data?.techStacks,
    (payload as any)?.data?.data?.techStacks,
  ];

  const found = candidates.find(Array.isArray);
  if (!found) return [];

  return found
    .map((value) => {
      if (!value || typeof value !== "object") return null;
      const item = value as { techStackId?: unknown; id?: unknown; name?: unknown };
      const id =
        typeof item.techStackId === "number"
          ? item.techStackId
          : typeof item.techStackId === "string"
            ? Number(item.techStackId)
            : typeof item.id === "number"
              ? item.id
              : typeof item.id === "string"
                ? Number(item.id)
            : NaN;
      if (!Number.isFinite(id) || typeof item.name !== "string") return null;
      return { techStackId: id, name: item.name } satisfies TechStackItem;
    })
    .filter((value): value is TechStackItem => value !== null);
}
