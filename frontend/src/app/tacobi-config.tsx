import { createTacoBI } from "@/tacobi";
import type { TacoBISpec, DataSource } from "@/tacobi";

const sources: DataSource[] = [
  {
    name: "Morpho API",
    link: "https://morpho.org",
  },
  {
    name: "Dune",
    link: "https://dune.com",
  },
];
export const spec = {
  datasets: [
    {
      id: "morpho-daily-prices",
      route: "/morpho-daily-prices",
      dataset_schema: {
        columns: [
          { name: "asset_symbol", valueType: "string" },
          { name: "block_time_day", valueType: "string" },
          { name: "price", valueType: "number" },
          { name: "asset_chain", valueType: "number" },
        ],
      },
      sources,
    },
    {
      id: "morpho-tvl",
      route: "/morpho-tvl",
      dataset_schema: {
        columns: [
          { name: "block_time_day", valueType: "string" },
          { name: "tvl_usd", valueType: "number" },
        ],
      },
      sources,
    },
    {
      id: "morpho-rewards",
      route: "/morpho-rewards",
      dataset_schema: {
        columns: [
          { name: "block_time_day", valueType: "string" },
          { name: "MORPHO_tokens_supply", valueType: "number" },
          { name: "MORPHO_tokens_borrow", valueType: "number" },
          { name: "MORPHO_tokens_cumulative", valueType: "number" },
          { name: "MORPHO_dollars_cumulative", valueType: "number" },
        ],
      },
      sources,
    },
    {
      id: "borrow-supply-rewards",
      route: "/borrow-supply-rewards",
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
      sources,
    },
    {
      id: "curators-vaults-markets",
      route: "/curators-vaults-markets",
      dataset_schema: {
        columns: [
          { name: "block_time_day", valueType: "string" },
          { name: "curator_count", valueType: "number" },
          { name: "market_count", valueType: "number" },
          { name: "vault_count", valueType: "number" },
        ],
      },
      sources,
    },
    {
      id: "markets-utilization",
      route: "/markets-utilization",
      dataset_schema: {
        columns: [
          { name: "block_time_day", valueType: "string" },
          { name: "weighted_market_utilization", valueType: "number" },
        ],
      },
      sources,
    },
  ],
} as const satisfies TacoBISpec;

export type Spec = typeof spec;

const { state, useTacoBI } = createTacoBI({
  spec,
  url: "http://localhost:8000",
});

export { state, useTacoBI };
