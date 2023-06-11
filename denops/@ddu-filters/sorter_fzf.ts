import {
  BaseFilter,
  DduItem,
} from "https://deno.land/x/ddu_vim@v2.8.6/types.ts";
import { isLike } from "https://deno.land/x/unknownutil@v2.1.1/mod.ts";

function getScore(item: DduItem) {
  if (isLike({ data: { fzfScore: 0 } }, item)) {
    return item.data.fzfScore;
  }
  return 0;
}

type Params = Record<never, never>;

export class Filter extends BaseFilter<Params> {
  filter(args: {
    items: DduItem[];
  }): Promise<DduItem[]> {
    return Promise.resolve(args.items.sort((a, b) => {
      // Sort by score in descending order.
      return getScore(b) - getScore(a);
    }));
  }

  params(): Params {
    return {};
  }
}
