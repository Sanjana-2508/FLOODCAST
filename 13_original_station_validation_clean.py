import pandas as pd
import numpy as np
import os

from sklearn.model_selection import GroupShuffleSplit
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

from xgboost import XGBRegressor

print("=" * 55)
print("FLOODCAST - CLEAN ORIGINAL STATION VALIDATION")
print("=" * 55)

# Load original features
data = pd.read_csv(
    "outputs/features/train_features.csv"
)

print("\nDataset loaded:", data.shape)

# Select features
excluded = ["discharge_cfs", "station_id", "date"]

features = [
    col for col in data.select_dtypes(include=np.number).columns
    if col not in excluded
]

X = data[features].copy()
y = data["discharge_cfs"]
groups = data["station_id"]

# Split by station
splitter = GroupShuffleSplit(
    n_splits=1,
    test_size=0.25,
    random_state=42
)

train_idx, val_idx = next(
    splitter.split(X, y, groups)
)

X_train = X.iloc[train_idx].copy()
X_val = X.iloc[val_idx].copy()

y_train = y.iloc[train_idx]
y_val = y.iloc[val_idx]

val_data = data.iloc[val_idx].copy()

# Impute using training data only
medians = X_train.median()

X_train = X_train.fillna(medians)
X_val = X_val.fillna(medians)

print("\nFeatures:", len(features))
print("Training records:", len(X_train))
print("Validation records:", len(X_val))

print("\nValidation stations:")
print(sorted(val_data["station_id"].unique()))


def evaluate_model(name, model):

    model.fit(X_train, y_train)

    predictions = np.maximum(
        model.predict(X_val), 0
    )

    actual = y_val.to_numpy()

    rmse = np.sqrt(
        mean_squared_error(actual, predictions)
    )

    mae = mean_absolute_error(actual, predictions)

    r2 = r2_score(actual, predictions)

    # Top 10% discharge days per station
    stations = val_data["station_id"].to_numpy()

    extreme_mask = np.zeros(len(val_data), dtype=bool)

    for station in np.unique(stations):

        mask = stations == station

        threshold = np.percentile(actual[mask], 90)

        extreme_mask |= mask & (actual >= threshold)

    extreme_rmse = np.sqrt(
        mean_squared_error(
            actual[extreme_mask],
            predictions[extreme_mask]
        )
    )

    print("\n" + "-" * 45)
    print(name)
    print("-" * 45)

    print(f"RMSE: {rmse:.2f}")
    print(f"Extreme RMSE: {extreme_rmse:.2f}")
    print(f"MAE: {mae:.2f}")
    print(f"R2: {r2:.4f}")

    return {
        "Model": name,
        "RMSE": rmse,
        "Extreme_RMSE": extreme_rmse,
        "MAE": mae,
        "R2": r2
    }


# Random Forest
print("\nTraining Random Forest...")

rf = RandomForestRegressor(
    n_estimators=300,
    max_depth=20,
    min_samples_leaf=2,
    max_features=0.8,
    random_state=42,
    n_jobs=-1
)

rf_results = evaluate_model(
    "Original Random Forest", rf
)

# XGBoost
print("\nTraining XGBoost...")

xgb = XGBRegressor(
    n_estimators=500,
    learning_rate=0.03,
    max_depth=6,
    subsample=0.8,
    colsample_bytree=0.8,
    reg_lambda=5,
    objective="reg:squarederror",
    eval_metric="rmse",
    random_state=42,
    n_jobs=-1
)

xgb_results = evaluate_model(
    "Original XGBoost", xgb
)

# Save comparison
comparison = pd.DataFrame([
    rf_results,
    xgb_results
])

print("\n" + "=" * 55)
print("CLEAN ORIGINAL MODEL COMPARISON")
print("=" * 55)

print(comparison.to_string(index=False))

os.makedirs("outputs/models", exist_ok=True)

comparison.to_csv(
    "outputs/models/original_station_comparison_clean.csv",
    index=False
)

print("\nClean station validation completed!")
print("Results saved in outputs/models/")