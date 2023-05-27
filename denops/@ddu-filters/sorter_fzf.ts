import {
  BaseFilter,
  DduItem,
} from "https://deno.land/x/ddu_vim@v2.8.6/types.ts";

type Params = Record<never, never>;

function getFzfScore(item: DduItem): number | undefined {
  if (
    typeof item.data === "object" &&
    item.data != null &&
    "fzfScore" in item.data &&
    typeof item.data.fzfScore === "number"
  ) {
    return item.data.fzfScore;
  }
}

export class Filter extends BaseFilter<Params> {
  filter(args: {
    items: DduItem[];
  }): Promise<DduItem[]> {
    return Promise.resolve(args.items.sort((a, b) => {
      const aScore = getFzfScore(a);
      const bScore = getFzfScore(b);
      if (aScore === undefined || bScore === undefined) {
        return 0;
      }
      // Sort by score in descending order.
      return bScore - aScore;
    }));
  }

  params(): Params {
    return {};
  }
}
