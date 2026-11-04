import pandas as pd
import numpy as np
import os
import joblib

from lightgbm import LGBMRegressor

from sklearn.model_selection import GroupShuffleSplit
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    mean_squared_error,
    mean_absolute_error,
    r2_score
)

print("=" * 60)
print("FLOODCAST - LIGHTGBM STATION-HOLDOUT VALIDATION")
print("=" * 60)


# 1. LOAD TRAINING DATA

data = pd.read_csv("outputs/features/train_features.csv")

print("\nDataset shape:", data.shape)


# 2. SELECT 24 FEATURES

features = [
    "precipitation_mm",
    "temp_max_c",
    "temp_min_c",
    "soil_moisture",
    "drainage_area_sqmi",
    "forest_cover_pct",
    "mean_elevation_ft",
    "slope_pct",
    "latitude",
    "longitude",
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

X = data[features]
y = data["discharge_cfs"]
groups = data["station_id"]

print("Number of features:", len(features))


# 3. STATION-HOLDOUT VALIDATION SPLIT

splitter = GroupShuffleSplit(
    n_splits=1,
    test_size=0.25,
    random_state=42
)

train_idx, val_idx = next(
    splitter.split(X, y, groups)
)

X_train = X.iloc[train_idx]
X_val = X.iloc[val_idx]

y_train = y.iloc[train_idx]
y_val = y.iloc[val_idx]

validation_stations = groups.iloc[val_idx].unique()

print("\nTraining records:", len(X_train))
print("Validation records:", len(X_val))

print("\nValidation stations:")
print(validation_stations)


# 4. HANDLE MISSING VALUES

imputer = SimpleImputer(strategy="median")

X_train = imputer.fit_transform(X_train)
X_val = imputer.transform(X_val)

print("\nMissing values handled using training medians.")


# 5. TRAIN LIGHTGBM MODEL

print("\nTraining LightGBM model...")

model = LGBMRegressor(
    objective="regression",
    n_estimators=500,
    learning_rate=0.03,
    num_leaves=31,
    max_depth=-1,
    subsample=0.8,
    subsample_freq=1,
    colsample_bytree=0.8,
    reg_lambda=1.0,
    random_state=42,
    n_jobs=-1,
    verbosity=-1
)

model.fit(X_train, y_train)

print("\nLightGBM training completed!")


# 6. GENERATE PREDICTIONS

predictions = model.predict(X_val)

# Discharge cannot be negative
predictions = np.maximum(predictions, 0)


# 7. CALCULATE EVALUATION METRICS

rmse = np.sqrt(
    mean_squared_error(y_val, predictions)
)

mae = mean_absolute_error(
    y_val, predictions
)

r2 = r2_score(
    y_val, predictions
)


# 8. CALCULATE EXTREME-EVENT RMSE

val_data = pd.DataFrame({
    "station_id": groups.iloc[val_idx].values,
    "actual": y_val.values,
    "predicted": predictions
})

# Top 10% discharge days for each station
thresholds = val_data.groupby("station_id")["actual"].transform(
    lambda values: values.quantile(0.90)
)

extreme_mask = val_data["actual"] >= thresholds

extreme_rmse = np.sqrt(
    mean_squared_error(
        val_data.loc[extreme_mask, "actual"],
        val_data.loc[extreme_mask, "predicted"]
    )
)


# 9. DISPLAY RESULTS

print("\n" + "=" * 50)
print("LIGHTGBM STATION-HOLDOUT RESULTS")
print("=" * 50)

print(f"RMSE:         {rmse:.2f}")
print(f"Extreme RMSE: {extreme_rmse:.2f}")
print(f"MAE:          {mae:.2f}")
print(f"R2:           {r2:.4f}")


# 10. SAVE MODEL AND PREPROCESSING

os.makedirs("outputs/lightgbm", exist_ok=True)

joblib.dump(
    model,
    "outputs/lightgbm/lightgbm_model.pkl"
)

joblib.dump(
    {
        "features": features,
        "imputer": imputer
    },
    "outputs/lightgbm/lightgbm_preprocessing.pkl"
)


# 11. SAVE VALIDATION RESULTS

results = pd.DataFrame([{
    "Model": "LightGBM",
    "RMSE": rmse,
    "Extreme_RMSE": extreme_rmse,
    "MAE": mae,
    "R2": r2
}])

results.to_csv(
    "outputs/lightgbm/lightgbm_validation_results.csv",
    index=False
)

print("\nModel saved successfully!")
print("Preprocessing saved successfully!")
print("Validation results saved successfully!")

print("\nOutput folder: outputs/lightgbm/")

print("=" * 60)
print("LIGHTGBM VALIDATION FINISHED")
print("=" * 60)