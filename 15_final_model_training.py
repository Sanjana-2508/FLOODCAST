import pandas as pd
import numpy as np
import os
import joblib

from sklearn.ensemble import RandomForestRegressor

print("=" * 60)
print("FLOODCAST - FINAL MODEL TRAINING")
print("=" * 60)

# Load original engineered datasets
train = pd.read_csv(
    "outputs/features/train_features.csv"
)

test = pd.read_csv(
    "outputs/features/test_features.csv"
)

print("\nTraining dataset:", train.shape)
print("Testing dataset:", test.shape)

# Select features
excluded = ["discharge_cfs", "station_id", "date"]

features = [
    col for col in train.select_dtypes(include=np.number).columns
    if col not in excluded
]

X_train = train[features].copy()
y_train = train["discharge_cfs"]

X_test = test[features].copy()

print("\nNumber of features:", len(features))

# Handle missing values using full training data medians
medians = X_train.median()

X_train = X_train.fillna(medians)
X_test = X_test.fillna(medians)

# Train final Random Forest
print("\nTraining final Random Forest...")

model = RandomForestRegressor(
    n_estimators=300,
    max_depth=20,
    min_samples_leaf=2,
    max_features=0.8,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

print("\nFinal model trained successfully!")

# Save model
os.makedirs("outputs/final", exist_ok=True)

joblib.dump(
    model,
    "outputs/final/final_random_forest.pkl"
)

# Save feature information
joblib.dump(
    {
        "features": features,
        "medians": medians
    },
    "outputs/final/model_preprocessing.pkl"
)

print("\nModel saved successfully!")

print("\nTraining records used:", len(X_train))
print("Testing records ready:", len(X_test))

print("\nFinal model training completed!")