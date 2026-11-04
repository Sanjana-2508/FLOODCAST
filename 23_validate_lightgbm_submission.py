import pandas as pd
import numpy as np

print("=" * 60)
print("FLOODCAST - LIGHTGBM SUBMISSION VALIDATION")
print("=" * 60)

# Load files
sample = pd.read_csv("data/sample_submission.csv")
test = pd.read_csv("data/test.csv")

submission = pd.read_csv(
    "outputs/submission/predictions_lightgbm.csv"
)

checks = []

def check(name, condition):
    status = bool(condition)
    checks.append(status)

    print(
        ("PASS" if status else "FAIL")
        + " - " + name
    )


# 1. Check shape
check(
    "Correct submission shape",
    submission.shape == (len(sample), 3)
)

# 2. Check columns
check(
    "Correct column names",
    submission.columns.tolist()
    == ["station_id", "date", "discharge_cfs"]
)

# 3. Check station and date alignment
check(
    "Station IDs match sample submission",
    submission["station_id"].astype(str).equals(
        sample["station_id"].astype(str)
    )
)

check(
    "Dates match sample submission",
    pd.to_datetime(submission["date"]).equals(
        pd.to_datetime(sample["date"])
    )
)

# 4. Check missing values
check(
    "No missing values",
    not submission.isnull().any().any()
)

# 5. Check negative predictions
check(
    "No negative predictions",
    (submission["discharge_cfs"] >= 0).all()
)

# 6. Check infinite values
check(
    "No infinite predictions",
    np.isfinite(submission["discharge_cfs"]).all()
)

# 7. Check predictions are not constant
check(
    "Predictions are not constant",
    submission["discharge_cfs"].nunique() > 1
)

# 8. Check station coverage
test_stations = set(test["station_id"].astype(str))
submission_stations = set(submission["station_id"].astype(str))

check(
    "All test stations included",
    test_stations == submission_stations
)

print("\n" + "=" * 60)

passed = sum(checks)

print(f"VALIDATION RESULT: {passed}/{len(checks)} CHECKS PASSED")

if all(checks):
    print("\nLIGHTGBM SUBMISSION IS STRUCTURALLY VALID!")
else:
    print("\nPLEASE CHECK FAILED VALIDATION ITEMS.")

print("\nStation prediction counts:")
print(submission.groupby("station_id").size())

print("=" * 60)