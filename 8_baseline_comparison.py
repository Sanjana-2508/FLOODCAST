import pandas as pd
import numpy as np

from sklearn.dummy import DummyRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

print("=" * 55)
print("FLOODCAST - BASELINE MODEL")
print("=" * 55)

# Load actual dataset
data = pd.read_csv("outputs/features/train_features.csv")

data["date"] = pd.to_datetime(data["date"])

# Same chronological split as before
train_data = data[data["date"] < "2023-01-01"].copy()
val_data = data[data["date"] >= "2023-01-01"].copy()

X_train = train_data[["precipitation_mm"]].fillna(0)
X_val = val_data[["precipitation_mm"]].fillna(0)

y_train = train_data["discharge_cfs"]
y_val = val_data["discharge_cfs"]

# Baseline predicts the training median for every record
baseline = DummyRegressor(strategy="median")

baseline.fit(X_train, y_train)

predictions = baseline.predict(X_val)

predictions = np.maximum(predictions, 0)

# Metrics
rmse = np.sqrt(mean_squared_error(y_val, predictions))
mae = mean_absolute_error(y_val, predictions)
r2 = r2_score(y_val, predictions)

# Extreme-event RMSE
actual = val_data["discharge_cfs"].to_numpy()
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

print("\nBaseline Model Results")
print("-" * 40)

print(f"Overall RMSE: {rmse:.2f}")
print(f"Extreme-event RMSE: {extreme_rmse:.2f}")
print(f"MAE: {mae:.2f}")
print(f"R2 Score: {r2:.4f}")

# Save results
import os

os.makedirs("outputs/models", exist_ok=True)

results = pd.DataFrame([{
    "Model": "Median Baseline",
    "RMSE": rmse,
    "Extreme_RMSE": extreme_rmse,
    "MAE": mae,
    "R2": r2
}])

results.to_csv(
    "outputs/models/baseline_results.csv",
    index=False
)

print("\nBaseline results saved successfully!")