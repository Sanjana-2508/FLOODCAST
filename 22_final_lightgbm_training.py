import pandas as pd
import numpy as np
import os
import joblib

from lightgbm import LGBMRegressor
from sklearn.impute import SimpleImputer

print("=" * 60)
print("FLOODCAST - FINAL LIGHTGBM MODEL TRAINING")
print("=" * 60)

# 1. Load competition feature datasets

train = pd.read_csv("outputs/features/train_features.csv")
test = pd.read_csv("outputs/features/test_features.csv")
sample = pd.read_csv("data/sample_submission.csv")

print("\nTraining dataset:", train.shape)
print("Testing dataset:", test.shape)

# 2. Select the same 24 features

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

X_train = train[features]
y_train = train["discharge_cfs"]
X_test = test[features]

print("\nNumber of features:", len(features))

# 3. Handle missing values

imputer = SimpleImputer(strategy="median")

X_train = imputer.fit_transform(X_train)
X_test = imputer.transform(X_test)

print("Missing values handled.")

# 4. Train LightGBM on all training records

print("\nTraining final LightGBM model...")

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

print("\nFinal LightGBM training completed!")

# 5. Generate competition predictions

print("\nGenerating test predictions...")

predictions = model.predict(X_test)

# Discharge cannot be negative
predictions = np.maximum(predictions, 0)

# 6. Match predictions with sample submission

sample["_row_order"] = np.arange(len(sample))

sample["_date_key"] = pd.to_datetime(
    sample["date"]
).dt.strftime("%Y-%m-%d")

prediction_data = test[["station_id", "date"]].copy()

prediction_data["_date_key"] = pd.to_datetime(
    prediction_data["date"]
).dt.strftime("%Y-%m-%d")

prediction_data["_prediction"] = predictions

submission = sample.merge(
    prediction_data[
        ["station_id", "_date_key", "_prediction"]
    ],
    on=["station_id", "_date_key"],
    how="left",
    validate="one_to_one"
)

if submission["_prediction"].isna().any():
    raise ValueError("Some test records did not receive predictions.")

submission = submission.sort_values("_row_order")

submission["discharge_cfs"] = submission["_prediction"]

submission = submission[
    ["station_id", "date", "discharge_cfs"]
]

# 7. Save model and preprocessing

os.makedirs("outputs/final_lightgbm", exist_ok=True)
os.makedirs("outputs/submission", exist_ok=True)

joblib.dump(
    model,
    "outputs/final_lightgbm/lightgbm_final_model.pkl"
)

joblib.dump(
    {
        "features": features,
        "imputer": imputer
    },
    "outputs/final_lightgbm/lightgbm_preprocessing.pkl"
)

# 8. Save separate LightGBM submission

output_path = "outputs/submission/predictions_lightgbm.csv"

submission.to_csv(output_path, index=False)

# 9. Display prediction information

print("\nPrediction statistics:")
print(submission["discharge_cfs"].describe())

print("\nSubmission shape:", submission.shape)
print("\nSubmission columns:")
print(submission.columns.tolist())

print("\nFinal LightGBM model saved.")
print("Preprocessing saved.")
print("LightGBM predictions saved.")

print("\nPrediction file:", output_path)

print("=" * 60)
print("FINAL LIGHTGBM TRAINING COMPLETED")
print("=" * 60)