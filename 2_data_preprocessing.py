import pandas as pd
import os

TRAIN_PATH = "data/train.csv"


def preprocess_data():

    if not os.path.exists(TRAIN_PATH):
        print("Official training dataset not available yet.")
        return

    df = pd.read_csv(TRAIN_PATH)

    print("Original dataset shape:", df.shape)

    # Convert date column
    df["date"] = pd.to_datetime(df["date"], errors="coerce")

    # Check duplicate records
    print("\nDuplicate records:", df.duplicated().sum())

    # Check missing values
    print("\nMissing values:")
    print(df.isnull().sum())

    # Check invalid negative discharge values
    print("\nNegative discharge values:",
          (df["discharge_cfs"] < 0).sum())

    print("\nData types:")
    print(df.dtypes)

    print("\nPreprocessing inspection completed.")


if __name__ == "__main__":
    preprocess_data()