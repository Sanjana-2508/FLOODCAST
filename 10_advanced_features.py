import pandas as pd
import os

print("=" * 55)
print("FLOODCAST - ADVANCED FEATURE ENGINEERING")
print("=" * 55)

# 1. Load existing engineered datasets
train = pd.read_csv("outputs/features/train_features.csv")
test = pd.read_csv("outputs/features/test_features.csv")

train["date"] = pd.to_datetime(train["date"])
test["date"] = pd.to_datetime(test["date"])

print("\nDatasets loaded successfully!")
print("Training:", train.shape)
print("Testing:", test.shape)

# 2. Preserve original row order
train["_original_order"] = range(len(train))
test["_original_order"] = range(len(test))

train["is_train"] = 1
test["is_train"] = 0

# 3. Combine datasets
combined = pd.concat(
    [train, test],
    ignore_index=True
)

# 4. Sort by station and date
combined = combined.sort_values(
    ["station_id", "date"]
).reset_index(drop=True)

# 5. Previous rainfall only
previous_rain = combined.groupby(
    "station_id"
)["precipitation_mm"].shift(1)

# 6. Previous 5-day rainfall accumulation
combined["rain_sum_prev_5d"] = (
    previous_rain.groupby(combined["station_id"])
    .transform(
        lambda x: x.rolling(5, min_periods=1).sum()
    )
)

# 7. Previous 14-day rainfall accumulation
combined["rain_sum_prev_14d"] = (
    previous_rain.groupby(combined["station_id"])
    .transform(
        lambda x: x.rolling(14, min_periods=1).sum()
    )
)

# 8. Separate training and testing datasets
train_new = combined[
    combined["is_train"] == 1
].copy()

test_new = combined[
    combined["is_train"] == 0
].copy()

# 9. Restore original row order
train_new = train_new.sort_values("_original_order")
test_new = test_new.sort_values("_original_order")

# 10. Remove temporary columns
train_new = train_new.drop(
    columns=["_original_order", "is_train"]
)

test_new = test_new.drop(
    columns=["_original_order", "is_train", "discharge_cfs"],
    errors="ignore"
)

# 11. Validate datasets
assert len(train_new) == 58448
assert len(test_new) == 2924

assert train_new["discharge_cfs"].notna().all()

assert "discharge_cfs" not in test_new.columns

print("Target alignment verified!")
print("Testing target leakage check passed!")

# 12. Save datasets
os.makedirs("outputs/features", exist_ok=True)

train_new.to_csv(
    "outputs/features/train_features_advanced.csv",
    index=False
)

test_new.to_csv(
    "outputs/features/test_features_advanced.csv",
    index=False
)

print("\nFinal training shape:", train_new.shape)
print("Final testing shape:", test_new.shape)

print("\nAdvanced feature engineering completed!")