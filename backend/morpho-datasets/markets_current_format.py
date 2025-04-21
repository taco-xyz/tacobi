"""
markets_table_today.csv

market_key,block_time_day,market_pair_symbol,market_supply_assets_USD,market_borrow_assets_USD,market_liquidity_assets_USD,market_utilization,MORPHO_tokens,MORPHO_tokens_cumulative
0x000c918917765555eade0947e9f5ad0dac5782214436ed159ef36a4c164ff306,2025-04-20T00:00:00.000000,MT / wstETH,0.0,0.0,0.0,0.0,0.0,0.0
0x008cbf30b3a54f2ba03bed5f6d27cca523fa5b80b8324c4aa6806a1f05a89b9b,2025-04-20T00:00:00.000000,PT-LBTC-27MAR2025 / cbBTC,0.0,0.0,0.0,0.0,0.0,0.0
0x00f00245cf0061f5a75b0ed737dce5a90e67e69f7a4649e7c2badd4e641958e4,2025-04-20T00:00:00.000000,stUSD / EURA,177195.3990013503,159142.46802733678,18052.93097401352,0.8981220366431119,0.547777350018518,7358.440670967074
0x0103cbcd14c690f68a91ec7c84607153311e9954c94ac6eac06c9462db3fabb6,2025-04-20T00:00:00.000000,rETH / EURC,198444.71318919075,177383.32643523207,21061.38675395868,0.8584749968730159,0.6245888718181335,488.83753218697854
0x015bffbe12c95a0fe61001440bf9e9b2040cb181f9bcfb680ee268e7cb6c7d2f,2025-04-20T00:00:00.000000,mBTC / WBTC,9.062497904384548,4.53422807707866,4.528269827305889,0.5003287310979622,0.0,0.0
0x0188775134d3541a13801c090658734743bcfe54662b045644f8e19d31958dfa,2025-04-20T00:00:00.000000,rsETH / wstETH,552.5016794824058,0.6771116885578868,551.8245677938479,0.00014410527838199031,2.503533634134331,8.612259436076918
0x02386ede2a39dc5f374cb6b22477838ffaa9a63075e8f7dd6a4bfd8b82083b28,2025-04-20T00:00:00.000000,wBLT / USDC,1.00959622584,0.90960422584,0.09999199999999997,0.9009631497938325,0.0,0.0

"""

import os
import pandas as pd

current_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(current_dir)

df = pd.read_csv("markets_table_today.csv")

# Split market_pair_symbol into borrow_asset_symbol and supply_asset_symbol
df[["borrow_asset_symbol", "supply_asset_symbol"]] = df["market_pair_symbol"].str.split(
    " / ", expand=True
)

# Handle None values in the split
df["borrow_asset_symbol"] = df["borrow_asset_symbol"].fillna("")
df["supply_asset_symbol"] = df["supply_asset_symbol"].fillna("")

# Drop the original market_pair_symbol column
df = df.drop(columns=["market_pair_symbol"])

# Rename the columns
df = df.rename(
    columns={
        "market_supply_assets_USD": "supply_assets_USD",
        "market_borrow_assets_USD": "borrow_assets_USD",
        "market_liquidity_assets_USD": "liquidity_assets_USD",
        "market_utilization": "utilization",
        "MORPHO_tokens": "morpho_tokens",
        "MORPHO_tokens_cumulative": "morpho_tokens_cumulative",
        "market_key": "market_address",
    }
)

# Drop the block_time_day column
df = df.drop(columns=["block_time_day"])

print(df.columns)

df.to_csv("markets_current.csv", index=False)
