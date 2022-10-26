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
  sort: boolean;
};

// from https://github.com/Shougo/ddu-filter-matcher_substring/blob/c6d56f3548b546803ef336b8f0aa379971db8c9a/denops/%40ddu-filters/matcher_substring.ts#L13-L15
function charposToBytepos(input: string, pos: number): number {
  return (new TextEncoder()).encode(input.slice(0, pos)).length;
}

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
      match: extendedMatch,
      selector: (item) => item.word,
      sort: args.filterParams.sort,
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
            col: charposToBytepos(v.item.word, position) + 1,
            width: new TextEncoder().encode(v.item.word[position]).length,
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
    return {
      highlightMatched: "",
      sort: true,
    };
  }
}
