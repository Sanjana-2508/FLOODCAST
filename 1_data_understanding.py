import pandas as pd
import os

# Dataset location
DATA_PATH = "data"

# Expected dataset files
files = [
    "train.csv",
    "test.csv",
    "sample_submission.csv",
    "station_metadata.csv"
]

print("FLOODCAST - DATASET CHECK")
print("-" * 40)

for file in files:
    path = os.path.join(DATA_PATH, file)

    if os.path.exists(path):
        print(f"Found: {file}")
    else:
        print(f"Waiting for: {file}")


def understand_data(file_path):
    if not os.path.exists(file_path):
        print("Dataset not received yet.")
        return

    df = pd.read_csv(file_path)

    print("\nDataset shape:", df.shape)

    print("\nColumn names:")
    print(df.columns.tolist())

    print("\nData types:")
    print(df.dtypes)

    print("\nMissing values:")
    print(df.isnull().sum())

    print("\nFirst five rows:")
    print(df.head())


# Analyse training data when available
understand_data("data/train.csv")