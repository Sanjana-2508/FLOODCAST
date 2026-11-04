
import pandas as pd
import numpy as np
import os

print("=" * 55)
print("FLOODCAST - FEATURE ENGINEERING")
print("=" * 55)

# --------------------------------------------------
# 1. LOAD ACTUAL COMPETITION DATASETS
# --------------------------------------------------

train = pd.read_csv("data/train.csv")
test = pd.read_csv("data/test.csv")
metadata = pd.read_csv("data/station_metadata.csv")

print("\nDatasets loaded successfully!")
print("Train:", train.shape)
print("Test:", test.shape)
print("Metadata:", metadata.shape)

# --------------------------------------------------
# 2. PRESERVE ORIGINAL ROW ORDER
# --------------------------------------------------

train["row_order"] = np.arange(len(train))
test["row_order"] = np.arange(len(test))

train["is_train"] = 1
test["is_train"] = 0

# Keep original target values attached to training rows
test["discharge_cfs"] = np.nan

# --------------------------------------------------
# 3. COMBINE TRAIN AND TEST
# --------------------------------------------------

combined = pd.concat(
    [train, test],
    ignore_index=True
)

combined["date"] = pd.to_datetime(combined["date"])

# Sort separately by station and date
combined = combined.sort_values(
    ["station_id", "date"]
).reset_index(drop=True)

# --------------------------------------------------
# 4. DATE FEATURES
# --------------------------------------------------

combined["month"] = combined["date"].dt.month

combined["day_of_year"] = (
    combined["date"].dt.day_of_year
)

combined["day_of_week"] = (
    combined["date"].dt.day_of_week
)

combined["year"] = combined["date"].dt.year

# Seasonal cyclical features
combined["month_sin"] = np.sin(
    2 * np.pi * combined["month"] / 12
)

combined["month_cos"] = np.cos(
    2 * np.pi * combined["month"] / 12
)

combined["day_sin"] = np.sin(
    2 * np.pi * combined["day_of_year"] / 365.25
)

combined["day_cos"] = np.cos(
    2 * np.pi * combined["day_of_year"] / 365.25
)

# --------------------------------------------------
# 5. RAINFALL LAG FEATURES
# --------------------------------------------------

rain = combined.groupby(
    "station_id"
)["precipitation_mm"]

combined["rain_lag_1"] = rain.shift(1)
combined["rain_lag_3"] = rain.shift(3)
combined["rain_lag_7"] = rain.shift(7)

# --------------------------------------------------
# 6. PREVIOUS RAINFALL ROLLING TOTALS
# --------------------------------------------------

combined["rain_sum_prev_3d"] = rain.transform(
    lambda s: s.shift(1).rolling(
        window=3,
        min_periods=1
    ).sum()
)

combined["rain_sum_prev_7d"] = rain.transform(
    lambda s: s.shift(1).rolling(
        window=7,
        min_periods=1
    ).sum()
)

# --------------------------------------------------
# 7. TEMPERATURE FEATURES
# --------------------------------------------------

combined["temperature_range"] = (
    combined["temp_max_c"] -
    combined["temp_min_c"]
)

# --------------------------------------------------
# 8. ADD STATION GEOGRAPHICAL INFORMATION
# --------------------------------------------------

combined = combined.merge(
    metadata,
    on="station_id",
    how="left",
    validate="many_to_one"
)

# Check metadata matching
if combined["latitude"].isna().any():
    raise ValueError(
        "Some station metadata is missing!"
    )

# --------------------------------------------------
# 9. SEPARATE TRAIN AND TEST
# --------------------------------------------------

train_result = (
    combined[combined["is_train"] == 1]
    .sort_values("row_order")
    .drop(columns=["row_order", "is_train"])
    .reset_index(drop=True)
)

test_result = (
    combined[combined["is_train"] == 0]
    .sort_values("row_order")
    .drop(columns=[
        "row_order",
        "is_train",
        "discharge_cfs"
    ])
    .reset_index(drop=True)
)

# --------------------------------------------------
# 10. VALIDATE DATA
# --------------------------------------------------

assert len(train_result) == len(train)
assert len(test_result) == len(test)

assert train_result["discharge_cfs"].notna().all()

assert train_result["station_id"].equals(
    train["station_id"]
)

assert test_result["station_id"].equals(
    test["station_id"]
)

assert train_result["date"].equals(
    pd.to_datetime(train["date"])
)

assert test_result["date"].equals(
    pd.to_datetime(test["date"])
)

# --------------------------------------------------
# 11. SAVE FEATURE DATASETS
# --------------------------------------------------

os.makedirs(
    "outputs/features",
    exist_ok=True
)

train_result.to_csv(
    "outputs/features/train_features.csv",
    index=False
)

test_result.to_csv(
    "outputs/features/test_features.csv",
    index=False
)

# --------------------------------------------------
# 12. DISPLAY RESULTS
# --------------------------------------------------

print("\n" + "=" * 55)
print("FEATURE ENGINEERING COMPLETED SUCCESSFULLY!")
print("=" * 55)

print("\nTraining shape:", train_result.shape)
print("Testing shape:", test_result.shape)

print("\nTarget alignment verified!")
print("Training target values:", len(
    train_result["discharge_cfs"]
))

print("\nNew features created:")

new_features = [
    "month",
    "day_of_year",
    "day_of_week",
    "year",
    "month_sin",
    "month_cos",
    "day_sin",
    "day_cos",
    "rain_lag_1",
    "rain_lag_3",
    "rain_lag_7",
    "rain_sum_prev_3d",
    "rain_sum_prev_7d",
    "temperature_range"
]

for feature in new_features:
    print("-", feature)

print("\nFiles saved:")
print("- outputs/features/train_features.csv")
print("- outputs/features/test_features.csv")

print("\nAll validation checks passed!")

