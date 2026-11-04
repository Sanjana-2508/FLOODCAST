import pandas as pd
import numpy as np
import os
import joblib

from sklearn.model_selection import GroupShuffleSplit
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import (
    mean_squared_error,
    mean_absolute_error,
    r2_score
)

from xgboost import XGBRegressor
from lightgbm import LGBMRegressor

print("=" * 60)
print("FLOODCAST - ENSEMBLE LEARNING")
print("=" * 60)


# 1. LOAD DATA

data = pd.read_csv("outputs/features/train_features.csv")

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

print("\nDataset:", data.shape)
print("Features:", len(features))


# 2. STATION-HOLDOUT SPLIT

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

val_groups = groups.iloc[val_idx]

print("\nTraining records:", len(X_train))
print("Validation records:", len(X_val))
print("Validation stations:", val_groups.unique())


# 3. HANDLE MISSING VALUES

imputer = SimpleImputer(strategy="median")

X_train = imputer.fit_transform(X_train)
X_val = imputer.transform(X_val)


# 4. DEFINE THREE MODELS

models = {

    "Random Forest": RandomForestRegressor(
        n_estimators=300,
        max_depth=20,
        min_samples_leaf=2,
        max_features=0.8,
        random_state=42,
        n_jobs=-1
    ),

    "XGBoost": XGBRegressor(
        n_estimators=500,
        learning_rate=0.03,
        max_depth=6,
        min_child_weight=2,
        subsample=0.8,
        colsample_bytree=0.8,
        reg_lambda=1.0,
        objective="reg:squarederror",
        random_state=42,
        n_jobs=-1,
        verbosity=0
    ),

    "LightGBM": LGBMRegressor(
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
}


# 5. TRAIN MODELS

predictions = {}
trained_models = {}

for name, model in models.items():

    print("\nTraining", name, "...")

    model.fit(X_train, y_train)

    pred = model.predict(X_val)
    pred = np.maximum(pred, 0)

    predictions[name] = pred
    trained_models[name] = model

    print(name, "training completed!")


# 6. DEFINE EVALUATION FUNCTION

def evaluate_model(name, pred):

    pred = np.maximum(pred, 0)

    rmse = np.sqrt(
        mean_squared_error(y_val, pred)
    )

    mae = mean_absolute_error(y_val, pred)

    r2 = r2_score(y_val, pred)

    validation_data = pd.DataFrame({
        "station_id": val_groups.values,
        "actual": y_val.values,
        "predicted": pred
    })

    thresholds = validation_data.groupby(
        "station_id"
    )["actual"].transform(
        lambda values: values.quantile(0.90)
    )

    extreme_mask = (
        validation_data["actual"] >= thresholds
    )

    extreme_rmse = np.sqrt(
        mean_squared_error(
            validation_data.loc[extreme_mask, "actual"],
            validation_data.loc[extreme_mask, "predicted"]
        )
    )

    return {
        "Model": name,
        "RMSE": rmse,
        "Extreme_RMSE": extreme_rmse,
        "MAE": mae,
        "R2": r2
    }


# 7. EVALUATE INDIVIDUAL MODELS

results = []

for name, pred in predictions.items():

    results.append(
        evaluate_model(name, pred)
    )


# 8. ENSEMBLE LEARNING

print("\nCreating ensemble predictions...")

# Random Forest + XGBoost
rf_xgb = (
    predictions["Random Forest"] +
    predictions["XGBoost"]
) / 2

# Random Forest + LightGBM
rf_lgbm = (
    predictions["Random Forest"] +
    predictions["LightGBM"]
) / 2

# XGBoost + LightGBM
xgb_lgbm = (
    predictions["XGBoost"] +
    predictions["LightGBM"]
) / 2

# All three models
all_ensemble = (
    predictions["Random Forest"] +
    predictions["XGBoost"] +
    predictions["LightGBM"]
) / 3


# 9. EVALUATE ENSEMBLES

results.append(
    evaluate_model("RF + XGBoost", rf_xgb)
)

results.append(
    evaluate_model("RF + LightGBM", rf_lgbm)
)

results.append(
    evaluate_model("XGBoost + LightGBM", xgb_lgbm)
)

results.append(
    evaluate_model("RF + XGBoost + LightGBM", all_ensemble)
)


# 10. DISPLAY COMPARISON

results_df = pd.DataFrame(results)

results_df = results_df.sort_values(
    by="RMSE"
)

print("\n" + "=" * 70)
print("FINAL MODEL COMPARISON")
print("=" * 70)

print(results_df.to_string(index=False))


# 11. SAVE MODELS AND RESULTS

os.makedirs("outputs/ensemble", exist_ok=True)

joblib.dump(
    trained_models,
    "outputs/ensemble/base_models.pkl"
)

joblib.dump(
    {
        "features": features,
        "imputer": imputer,
        "ensemble_weights": {
            "Random Forest": 1/3,
            "XGBoost": 1/3,
            "LightGBM": 1/3
        }
    },
    "outputs/ensemble/ensemble_preprocessing.pkl"
)

results_df.to_csv(
    "outputs/ensemble/ensemble_comparison.csv",
    index=False
)

print("\nModels saved successfully!")
print("Results saved successfully!")

print("\nOutput folder: outputs/ensemble/")

print("=" * 60)
print("ENSEMBLE LEARNING COMPLETED")
print("=" * 60)