import pandas as pd
import numpy as np
import os

print("=" * 60)
print("FLOODCAST - FINAL SUBMISSION VALIDATION")
print("=" * 60)

# Load files
submission = pd.read_csv(
    "outputs/submission/predictions.csv"
)

sample = pd.read_csv(
    "data/sample_submission.csv"
)

test = pd.read_csv(
    "data/test.csv"
)

# 1. Check shape
print("\n1. Checking submission shape...")

assert submission.shape == sample.shape
assert len(submission) == 2924

print("PASSED: Correct number of rows and columns.")

# 2. Check column names
print("\n2. Checking column names...")

assert submission.columns.tolist() == sample.columns.tolist()

print("PASSED: Column names match.")

# 3. Check station IDs and dates
print("\n3. Checking station IDs and dates...")

assert submission["station_id"].equals(sample["station_id"])
assert submission["date"].equals(sample["date"])

assert submission["station_id"].equals(test["station_id"])
assert submission["date"].equals(test["date"])

print("PASSED: Station IDs, dates and row order match.")

# 4. Check missing values
print("\n4. Checking missing values...")

assert submission.isnull().sum().sum() == 0

print("PASSED: No missing values.")

# 5. Check negative predictions
print("\n5. Checking negative predictions...")

assert (submission["discharge_cfs"] >= 0).all()

print("PASSED: No negative predictions.")

# 6. Check infinite values
print("\n6. Checking infinite values...")

assert np.isfinite(
    submission["discharge_cfs"]
).all()

print("PASSED: All predictions are finite.")

# 7. Check prediction variation
print("\n7. Checking prediction variation...")

assert submission["discharge_cfs"].nunique() > 1

print("PASSED: Predictions are not constant.")

# 8. Check station coverage
print("\n8. Checking station coverage...")

print(
    submission.groupby("station_id")[
        "discharge_cfs"
    ].agg(["count", "mean", "max"])
)

assert submission["station_id"].nunique() == 4

print("\nPASSED: All four test stations are included.")

# Final result
print("\n" + "=" * 60)
print("ALL SUBMISSION VALIDATION CHECKS PASSED!")
print("=" * 60)

print("\nFinal submission:")
print("outputs/submission/predictions.csv")

print("\nYour predictions.csv is structurally ready!")