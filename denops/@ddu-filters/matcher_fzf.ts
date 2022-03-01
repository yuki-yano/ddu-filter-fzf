import {
  BaseFilter,
  DduItem,
  ItemHighlight,
  SourceOptions,
} from "https://deno.land/x/ddu_vim@v0.13/types.ts";
import { Denops } from "https://deno.land/x/ddu_vim@v0.13/deps.ts";
import { extendedMatch, Fzf } from "https://esm.sh/fzf@0.5.1";

type Params = {
  highlightMatched: string;
};

export class Filter extends BaseFilter<Params> {
  filter(args: {
    denops: Denops;
    sourceOptions: SourceOptions;
    input: string;
    items: DduItem[];
    filterParams: Params;
  }): Promise<DduItem[]> {
    const input = args.input;

    const fzf = new Fzf(args.items, {
      selector: (item) => item.word,
      match: extendedMatch,
    });

    const items = fzf.find(input);
    if (args.filterParams.highlightMatched === "") {
      return Promise.resolve(items.map((v) => v.item));
    }

    return Promise.resolve(items.map((v) => {
      if (v.start >= 0) {
        const highlights: ItemHighlight[] = [];
        for (const position of v.positions) {
          highlights.push({
            name: "matched",
            "hl_group": args.filterParams.highlightMatched,
            col: position + 1,
            width: 1,
          });
        }
        return {
          ...v.item,
          highlights: highlights,
        };
      } else {
        return v.item;
      }
    }));
  }

  params(): Params {
    return { highlightMatched: "" };
  }
}
