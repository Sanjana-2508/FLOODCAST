import pandas as pd
import numpy as np
import os

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

from xgboost import XGBRegressor

print("=" * 55)
print("FLOODCAST - LOG TARGET EXPERIMENT")
print("=" * 55)

# 1. Load actual training data
data = pd.read_csv("outputs/features/train_features.csv")
data["date"] = pd.to_datetime(data["date"])

# 2. Chronological split
train_data = data[data["date"] < "2023-01-01"].copy()
val_data = data[data["date"] >= "2023-01-01"].copy()

excluded = ["discharge_cfs", "station_id", "date"]

features = [
    col for col in data.select_dtypes(include=np.number).columns
    if col not in excluded
]

X_train = train_data[features].copy()
X_val = val_data[features].copy()

y_train = train_data["discharge_cfs"]
y_val = val_data["discharge_cfs"]

# 3. Missing-value handling
medians = X_train.median()

X_train = X_train.fillna(medians)
X_val = X_val.fillna(medians)

# 4. Transform target using log1p
y_train_log = np.log1p(y_train)

print("\nTarget transformation completed!")
print("Original target range:", y_train.min(), "to", y_train.max())
print("Log target range:", y_train_log.min(), "to", y_train_log.max())

# 5. Evaluation function
def evaluate_model(name, model):

    model.fit(X_train, y_train_log)

    log_predictions = model.predict(X_val)

    # Convert predictions back to original CFS scale
    predictions = np.expm1(log_predictions)

    predictions = np.maximum(predictions, 0)

    actual = y_val.to_numpy()

    rmse = np.sqrt(mean_squared_error(actual, predictions))
    mae = mean_absolute_error(actual, predictions)
    r2 = r2_score(actual, predictions)

    # Extreme events: top 10% per station
    stations = val_data["station_id"].to_numpy()

    extreme_mask = np.zeros(len(val_data), dtype=bool)

    for station in np.unique(stations):

        station_mask = stations == station

        threshold = np.percentile(actual[station_mask], 90)

        extreme_mask |= station_mask & (actual >= threshold)

    extreme_rmse = np.sqrt(
        mean_squared_error(
            actual[extreme_mask],
            predictions[extreme_mask]
        )
    )

    print("\n" + "-" * 45)
    print(name)
    print("-" * 45)

    print(f"Overall RMSE: {rmse:.2f}")
    print(f"Extreme-event RMSE: {extreme_rmse:.2f}")
    print(f"MAE: {mae:.2f}")
    print(f"R2 Score: {r2:.4f}")

    return {
        "Model": name,
        "RMSE": rmse,
        "Extreme_RMSE": extreme_rmse,
        "MAE": mae,
        "R2": r2
    }


# 6. Random Forest
print("\nTraining Log-Target Random Forest...")

rf_model = RandomForestRegressor(
    n_estimators=300,
    max_depth=20,
    min_samples_leaf=2,
    max_features=0.8,
    random_state=42,
    n_jobs=-1
)

rf_results = evaluate_model(
    "Log Random Forest",
    rf_model
)


# 7. XGBoost
print("\nTraining Log-Target XGBoost...")

xgb_model = XGBRegressor(
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
    "Log XGBoost",
    xgb_model
)


# 8. Compare models
comparison = pd.DataFrame([
    rf_results,
    xgb_results
])

print("\n" + "=" * 55)
print("LOG TARGET MODEL COMPARISON")
print("=" * 55)

print(comparison.to_string(index=False))


# 9. Save results
os.makedirs("outputs/models", exist_ok=True)

comparison.to_csv(
    "outputs/models/log_target_comparison.csv",
    index=False
)

print("\nLog-target experiment completed!")
print("Results saved inside outputs/models/")