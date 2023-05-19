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

const ENCODER = new TextEncoder();

// from https://github.com/Shougo/ddu-filter-matcher_substring/blob/c6d56f3548b546803ef336b8f0aa379971db8c9a/denops/%40ddu-filters/matcher_substring.ts#L13-L15
function charposToBytepos(input: string, pos: number): number {
  return ENCODER.encode(input.slice(0, pos)).length;
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
      selector: (item) => item.matcherKey || item.word,
      sort: args.filterParams.sort,
    });

    const items = fzf.find(input);
    if (args.filterParams.highlightMatched === "") {
      return Promise.resolve(items.map((v) => v.item));
    }

    return Promise.resolve(items.map((v) => {
      if (v.start >= 0) {
        const target = v.item.matcherKey || v.item.word;
        const positions = [...v.positions].sort((a, b) => a - b);
        const { highlights = [] } = v.item;
        const offset = v.item.display?.indexOf(target) ?? 0;

        if (offset === -1) {
          return v.item;
        }

        let cur = positions.shift();

        do {
          let len = 1;

          while (positions[0] === cur + len) {
            positions.shift();

            len++;
          }

          highlights.push({
            name: "matched",
            hl_group: args.filterParams.highlightMatched,
            col: offset + charposToBytepos(target, cur) + 1, // character position is 1-based
            width: len,
          });
        } while (cur = positions.shift());

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
