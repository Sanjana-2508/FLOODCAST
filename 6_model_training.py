
import pandas as pd
import numpy as np
import os
import joblib

from sklearn.model_selection import GroupShuffleSplit
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import (
    mean_squared_error,
    mean_absolute_error,
    r2_score
)

from xgboost import XGBRegressor

print("=" * 55)
print("FLOODCAST - MODEL TRAINING")
print("=" * 55)

# --------------------------------------------------
# 1. LOAD FEATURE-ENGINEERED DATA
# --------------------------------------------------

train = pd.read_csv(
    "outputs/features/train_features.csv"
)

print("\nTraining dataset loaded:", train.shape)

# --------------------------------------------------
# 2. SELECT NUMERIC FEATURES
# --------------------------------------------------

target = "discharge_cfs"

excluded_columns = [
    "discharge_cfs",
    "station_id",
    "date"
]

feature_columns = [
    col for col in train.select_dtypes(
        include=np.number
    ).columns
    if col not in excluded_columns
]

X = train[feature_columns].copy()
y = train[target].copy()

groups = train["station_id"]

# Fill missing values using training medians
medians = X.median()

X = X.fillna(medians)

print("\nNumber of features:", len(feature_columns))
print("Number of records:", len(X))

# --------------------------------------------------
# 3. STATION-HOLDOUT VALIDATION
# --------------------------------------------------

splitter = GroupShuffleSplit(
    n_splits=1,
    test_size=0.25,
    random_state=42
)

train_idx, val_idx = next(
    splitter.split(X, y, groups=groups)
)

X_train = X.iloc[train_idx]
X_val = X.iloc[val_idx]

y_train = y.iloc[train_idx]
y_val = y.iloc[val_idx]

val_stations = groups.iloc[val_idx].unique()

print("\nTraining records:", len(X_train))
print("Validation records:", len(X_val))

print("Validation stations:", val_stations)

# --------------------------------------------------
# 4. EVALUATION FUNCTION
# --------------------------------------------------

def evaluate_model(name, actual, predicted, stations):

    rmse = np.sqrt(
        mean_squared_error(actual, predicted)
    )

    mae = mean_absolute_error(
        actual, predicted
    )

    r2 = r2_score(
        actual, predicted
    )

    # Top 10% discharge events per station
    evaluation = pd.DataFrame({
        "actual": np.asarray(actual),
        "predicted": np.asarray(predicted),
        "station_id": np.asarray(stations)
    })

    thresholds = evaluation.groupby(
        "station_id"
    )["actual"].transform(
        lambda s: s.quantile(0.90)
    )

    extreme = evaluation[
        evaluation["actual"] >= thresholds
    ]

    extreme_rmse = np.sqrt(
        mean_squared_error(
            extreme["actual"],
            extreme["predicted"]
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

results = []

# --------------------------------------------------
# 5. RANDOM FOREST MODEL
# --------------------------------------------------

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

rf_predictions = rf_model.predict(X_val)

rf_predictions = np.maximum(
    rf_predictions, 0
)

rf_result = evaluate_model(
    "Random Forest",
    y_val,
    rf_predictions,
    groups.iloc[val_idx]
)

results.append(rf_result)

# --------------------------------------------------
# 6. XGBOOST MODEL
# --------------------------------------------------

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

xgb_predictions = xgb_model.predict(X_val)

xgb_predictions = np.maximum(
    xgb_predictions, 0
)

xgb_result = evaluate_model(
    "XGBoost",
    y_val,
    xgb_predictions,
    groups.iloc[val_idx]
)

results.append(xgb_result)

# --------------------------------------------------
# 7. COMPARE MODELS
# --------------------------------------------------

comparison = pd.DataFrame(results)

os.makedirs("outputs/models", exist_ok=True)

comparison.to_csv(
    "outputs/models/model_comparison.csv",
    index=False
)

print("\n" + "=" * 55)
print("MODEL COMPARISON")
print("=" * 55)

print(comparison.to_string(index=False))

# --------------------------------------------------
# 8. FEATURE IMPORTANCE
# --------------------------------------------------

importance = pd.DataFrame({
    "Feature": feature_columns,
    "RandomForest_Importance": rf_model.feature_importances_,
    "XGBoost_Importance": xgb_model.feature_importances_
})

importance = importance.sort_values(
    "XGBoost_Importance",
    ascending=False
)

importance.to_csv(
    "outputs/models/feature_importance.csv",
    index=False
)

print("\nTop 10 important features:")

print(
    importance.head(10).to_string(index=False)
)

# --------------------------------------------------
# 9. SAVE VALIDATION MODELS
# --------------------------------------------------

joblib.dump(
    rf_model,
    "outputs/models/random_forest_validation.pkl"
)

joblib.dump(
    xgb_model,
    "outputs/models/xgboost_validation.pkl"
)

print("\nModels and results saved successfully!")

print("\nFiles saved inside outputs/models/")


