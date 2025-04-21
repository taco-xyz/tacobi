import { createTacoBI } from "@/tacobi";
import type { TacoBISpec } from "@/tacobi";

const spec = {
  datasets: [
    {
      id: "market-stats",
      route: "/market-stats",
      dataset_schema: {
        columns: [
          { name: "market_key", valueType: "string" },
          { name: "block_time_day", valueType: "string" },
          { name: "market_supply_assets_USD", valueType: "number" },
          { name: "market_borrow_assets_USD", valueType: "number" },
          { name: "MORPHO_tokens_supply", valueType: "number" },
          { name: "MORPHO_tokens_borrow", valueType: "number" },
          { name: "MORPHO_dollars_supply", valueType: "number" },
          { name: "MORPHO_dollars_borrow", valueType: "number" },
        ],
      },
    },
    {
      id: "protocol-stats",
      route: "/protocol-stats",
      dataset_schema: {
        columns: [
          { name: "block_time_day", valueType: "string" },
          { name: "market_supply_assets_USD", valueType: "number" },
          { name: "market_borrow_assets_USD", valueType: "number" },
          { name: "MORPHO_tokens_supply", valueType: "number" },
          { name: "MORPHO_tokens_borrow", valueType: "number" },
          { name: "MORPHO_dollars_supply", valueType: "number" },
          { name: "MORPHO_dollars_borrow", valueType: "number" },
          { name: "vaults_revenue", valueType: "number" },
        ],
      },
    },
    {
      id: "markets-current",
      route: "/markets-current",
      dataset_schema: {
        columns: [
          { name: "market_address", valueType: "string" },
          { name: "supply_assets_USD", valueType: "number" },
          { name: "borrow_assets_USD", valueType: "number" },
          { name: "liquidity_assets_USD", valueType: "number" },
          { name: "utilization", valueType: "number" },
          { name: "morpho_tokens", valueType: "number" },
          { name: "morpho_tokens_cumulative", valueType: "number" },
          { name: "borrow_asset_symbol", valueType: "string" },
          { name: "supply_asset_symbol", valueType: "string" },
        ],
      },
    }
  ],
} as const satisfies TacoBISpec;

export type Spec = typeof spec;

const { state, useTacoBI } = createTacoBI({
  spec,
  url: "http://localhost:8000",
});

export { state, useTacoBI };
