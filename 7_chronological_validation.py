import pandas as pd
import numpy as np
import os
import joblib

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

from xgboost import XGBRegressor

print("=" * 55)
print("FLOODCAST - CHRONOLOGICAL VALIDATION")
print("=" * 55)

# 1. Load actual training data
data = pd.read_csv("outputs/features/train_features.csv")

data["date"] = pd.to_datetime(data["date"])

print("\nDataset loaded:", data.shape)

# 2. Split chronologically
# Train: 2015-2022
# Validate: 2023-2024

train_data = data[data["date"] < "2023-01-01"].copy()

val_data = data[data["date"] >= "2023-01-01"].copy()

print("\nTraining period:")
print(train_data["date"].min(), "to", train_data["date"].max())

print("\nValidation period:")
print(val_data["date"].min(), "to", val_data["date"].max())

print("\nTraining records:", len(train_data))
print("Validation records:", len(val_data))

# 3. Select numerical features
excluded = ["discharge_cfs", "station_id", "date"]

feature_columns = [
    col for col in data.select_dtypes(include=np.number).columns
    if col not in excluded
]

X_train = train_data[feature_columns].copy()
X_val = val_data[feature_columns].copy()

y_train = train_data["discharge_cfs"]
y_val = val_data["discharge_cfs"]

# 4. Handle missing values using training medians only
medians = X_train.median()

X_train = X_train.fillna(medians)
X_val = X_val.fillna(medians)

print("\nNumber of features:", len(feature_columns))

# 5. Evaluation function
def evaluate_model(name, model):

    predictions = model.predict(X_val)

    predictions = np.maximum(predictions, 0)

    rmse = np.sqrt(mean_squared_error(y_val, predictions))

    mae = mean_absolute_error(y_val, predictions)

    r2 = r2_score(y_val, predictions)

    # Extreme events: top 10% discharge per station
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


# 6. Train Random Forest
print("\nTraining Random Forest...")

rf_model = RandomForestRegressor(
    n_estimators=300,
    max_depth=20,
    min_samples_leaf=2,
    max_features=0.8,
    random_state=42,
    n_jobs=-1
)

rf_model.fit(X_train, y_train)

rf_results = evaluate_model("Random Forest", rf_model)


# 7. Train XGBoost
print("\nTraining XGBoost...")

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

xgb_model.fit(X_train, y_train)

xgb_results = evaluate_model("XGBoost", xgb_model)


# 8. Compare results
comparison = pd.DataFrame([rf_results, xgb_results])

print("\n" + "=" * 55)
print("CHRONOLOGICAL MODEL COMPARISON")
print("=" * 55)

print(comparison.to_string(index=False))


# 9. Save results
os.makedirs("outputs/models", exist_ok=True)

comparison.to_csv(
    "outputs/models/chronological_comparison.csv",
    index=False
)

joblib.dump(
    medians,
    "outputs/models/chronological_imputation_medians.pkl"
)

print("\nChronological validation completed!")
print("Results saved inside outputs/models/")