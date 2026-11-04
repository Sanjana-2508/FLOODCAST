import pandas as pd
import numpy as np
import os

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

from xgboost import XGBRegressor

print("=" * 55)
print("FLOODCAST - ADVANCED MODEL TRAINING")
print("=" * 55)

# Load advanced training dataset
data = pd.read_csv(
    "outputs/features/train_features_advanced.csv"
)

data["date"] = pd.to_datetime(data["date"])

# Chronological split
train_data = data[data["date"] < "2023-01-01"].copy()
val_data = data[data["date"] >= "2023-01-01"].copy()

print("\nTraining records:", len(train_data))
print("Validation records:", len(val_data))

# Select features
excluded = ["discharge_cfs", "station_id", "date"]

features = [
    col for col in data.select_dtypes(include=np.number).columns
    if col not in excluded
]

X_train = train_data[features].copy()
X_val = val_data[features].copy()

y_train = train_data["discharge_cfs"]
y_val = val_data["discharge_cfs"]

# Missing value handling
medians = X_train.median()

X_train = X_train.fillna(medians)
X_val = X_val.fillna(medians)

print("\nNumber of features:", len(features))

# Evaluation function
def evaluate_model(name, model):

    model.fit(X_train, y_train)

    predictions = np.maximum(model.predict(X_val), 0)

    actual = y_val.to_numpy()

    rmse = np.sqrt(mean_squared_error(actual, predictions))
    mae = mean_absolute_error(actual, predictions)
    r2 = r2_score(actual, predictions)

    # Extreme event evaluation
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
print("\nTraining Advanced Random Forest...")

rf = RandomForestRegressor(
    n_estimators=300,
    max_depth=20,
    min_samples_leaf=2,
    max_features=0.8,
    random_state=42,
    n_jobs=-1
)

rf_results = evaluate_model("Advanced Random Forest", rf)


# XGBoost
print("\nTraining Advanced XGBoost...")

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

xgb_results = evaluate_model("Advanced XGBoost", xgb)


# Compare results
comparison = pd.DataFrame([
    rf_results,
    xgb_results
])

print("\n" + "=" * 55)
print("ADVANCED MODEL COMPARISON")
print("=" * 55)

print(comparison.to_string(index=False))

# Save results
os.makedirs("outputs/models", exist_ok=True)

comparison.to_csv(
    "outputs/models/advanced_model_comparison.csv",
    index=False
)

print("\nAdvanced model training completed!")
print("Results saved inside outputs/models/")