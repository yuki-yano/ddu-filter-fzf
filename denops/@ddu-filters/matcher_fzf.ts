import {
  BaseFilter,
  DduItem,
  SourceOptions,
} from "https://deno.land/x/ddu_vim@v0.1.0/types.ts";
import { Denops } from "https://deno.land/x/ddu_vim@v0.1.0/deps.ts";
import { extendedMatch, Fzf } from "https://esm.sh/fzf@0.4.1";

type Params = Record<never, never>;

export class Filter extends BaseFilter<Params> {
  filter(args: {
    denops: Denops;
    sourceOptions: SourceOptions;
    input: string;
    items: DduItem[];
  }): Promise<DduItem[]> {
    const input = args.input;

    const fzf = new Fzf(args.items, {
      selector: (item) => item.word,
      match: extendedMatch,
    });

    return Promise.resolve(fzf.find(input).map((v) => v.item));
  }

  params(): Params {
    return {};
  }
}
