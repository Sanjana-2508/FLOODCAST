import pandas as pd
import os

DATA_FOLDER = "data"

files = {
    "train": "train.csv",
    "test": "test.csv",
    "submission": "sample_submission.csv",
    "metadata": "station_metadata.csv"
}

dataframes = {}

print("=" * 55)
print("         FLOODCAST - FULL DATA INSPECTION")
print("=" * 55)

# Load all four files
for name, filename in files.items():

    path = os.path.join(DATA_FOLDER, filename)

    if os.path.exists(path):
        df = pd.read_csv(path)
        dataframes[name] = df

        print(f"\n{name.upper()} LOADED")
        print("Shape:", df.shape)
        print("Columns:", df.columns.tolist())

    else:
        print(f"\nMISSING FILE: {filename}")


# Continue only if all files are available
if len(dataframes) == 4:

    train = dataframes["train"]
    test = dataframes["test"]
    submission = dataframes["submission"]
    metadata = dataframes["metadata"]

    # Training data inspection
    print("\n" + "=" * 55)
    print("TRAINING DATA INSPECTION")
    print("=" * 55)

    print("\nMissing values:")
    print(train.isnull().sum())

    print("\nDuplicate rows:", train.duplicated().sum())

    print("\nDate range:")
    print(pd.to_datetime(train["date"]).agg(["min", "max"]))

    print("\nNumber of stations:", train["station_id"].nunique())

    print("\nTarget statistics:")
    print(train["discharge_cfs"].describe())

    print("\nNegative discharge values:",
          (train["discharge_cfs"] < 0).sum())

    # Test data inspection
    print("\n" + "=" * 55)
    print("TEST DATA INSPECTION")
    print("=" * 55)

    print("\nMissing values:")
    print(test.isnull().sum())

    print("\nNumber of stations:", test["station_id"].nunique())

    print("\nDate range:")
    print(pd.to_datetime(test["date"]).agg(["min", "max"]))

    # Station ID comparison
    print("\n" + "=" * 55)
    print("STATION ID VALIDATION")
    print("=" * 55)

    train_ids = set(train["station_id"].unique())
    test_ids = set(test["station_id"].unique())
    metadata_ids = set(metadata["station_id"].unique())

    print("Train stations:", len(train_ids))
    print("Test stations:", len(test_ids))
    print("Metadata stations:", len(metadata_ids))

    print("Train IDs missing from metadata:",
          train_ids - metadata_ids)

    print("Test IDs missing from metadata:",
          test_ids - metadata_ids)

    # Submission structure
    print("\n" + "=" * 55)
    print("SUBMISSION FORMAT")
    print("=" * 55)

    print("Submission columns:", submission.columns.tolist())
    print("Test rows:", len(test))
    print("Submission rows:", len(submission))

    print("\nINSPECTION COMPLETED!")

else:
    print("\nPlease place all four CSV files inside the data folder.")