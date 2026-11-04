import pandas as pd
import numpy as np
import joblib
import os

print("=" * 60)
print("FLOODCAST - GENERATING COMPETITION PREDICTIONS")
print("=" * 60)

# Load test data
test = pd.read_csv(
    "outputs/features/test_features.csv"
)

# Load trained model
model = joblib.load(
    "outputs/final/final_random_forest.pkl"
)

# Load preprocessing information
preprocessing = joblib.load(
    "outputs/final/model_preprocessing.pkl"
)

features = preprocessing["features"]
medians = preprocessing["medians"]

# Prepare test features
X_test = test[features].copy()
X_test = X_test.fillna(medians)

print("\nTest records:", len(X_test))
print("Features:", len(features))

# Generate predictions
predictions = model.predict(X_test)

# Discharge cannot be negative
predictions = np.maximum(predictions, 0)

# Load sample submission
sample = pd.read_csv(
    "data/sample_submission.csv"
)

print("\nSample submission columns:")
print(sample.columns.tolist())

print("\nSample submission shape:", sample.shape)

# Check row count
assert len(predictions) == len(sample), \
    "Prediction count does not match sample submission!"

# Preserve sample submission structure and row order
submission = sample.copy()

# Identify target column
target_column = "discharge_cfs"

assert target_column in submission.columns, \
    "Target column missing from sample submission!"

submission[target_column] = predictions

# Final checks
assert submission.shape == sample.shape
assert submission[target_column].notna().all()
assert (submission[target_column] >= 0).all()

# Save predictions
os.makedirs("outputs/submission", exist_ok=True)

submission.to_csv(
    "outputs/submission/predictions.csv",
    index=False
)

print("\n" + "=" * 60)
print("PREDICTIONS GENERATED SUCCESSFULLY!")
print("=" * 60)

print("\nSubmission shape:", submission.shape)

print("\nFirst five predictions:")
print(submission.head())

print("\nPrediction statistics:")
print(submission[target_column].describe())

print("\nSaved file:")
print("outputs/submission/predictions.csv")