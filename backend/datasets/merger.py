import pandas as pd
import os

# Get the directory of the current file
current_dir = os.path.dirname(os.path.abspath(__file__))
# Set the current working directory to the directory of this file
os.chdir(current_dir)

# Read the CSV files
curator_count_df = pd.read_csv("morpho_curator_count.csv")
market_count_df = pd.read_csv("morpho_market_count.csv")
vault_count_df = pd.read_csv("morpho_vault_count.csv")

# Ensure the date column is consistent across all dataframes
# Assuming the date column is named 'block_time_day' in all files
date_column = "block_time_day"

# Merge the dataframes on the date column
merged_df = pd.merge(curator_count_df, market_count_df, on=date_column, how="outer")
merged_df = pd.merge(merged_df, vault_count_df, on=date_column, how="outer")

# Sort by date
merged_df = merged_df.sort_values(by=date_column)

# Fill missing values with 0
merged_df = merged_df.fillna(0)

# Turn curator, market, and vault columns into integers
merged_df["curator_count"] = merged_df["curator_count"].astype(int)
merged_df["market_count"] = merged_df["market_count"].astype(int)
merged_df["vault_count"] = merged_df["vault_count"].astype(int)

# Save the merged dataframe to a new CSV file
merged_df.to_csv("curators_vaults_markets_counts.csv", index=False)

print("Merged data saved to curators_vaults_markets_counts.csv")
