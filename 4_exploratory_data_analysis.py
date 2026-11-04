import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Load actual competition data
train = pd.read_csv("data/train.csv")

train["date"] = pd.to_datetime(train["date"])

# Create output folder
os.makedirs("outputs/eda", exist_ok=True)

# 1. Discharge distribution
plt.figure(figsize=(10, 5))
sns.histplot(train["discharge_cfs"], bins=100)
plt.title("Distribution of River Discharge")
plt.xlabel("Discharge (CFS)")
plt.savefig("outputs/eda/discharge_distribution.png")
plt.close()

# 2. Discharge distribution using log scale
plt.figure(figsize=(10, 5))
sns.histplot(train["discharge_cfs"], bins=100)
plt.yscale("log")
plt.title("River Discharge - Log Frequency")
plt.savefig("outputs/eda/discharge_log_distribution.png")
plt.close()

# 3. Average discharge by station
station_avg = train.groupby("station_id")["discharge_cfs"].mean()

plt.figure(figsize=(12, 5))
station_avg.plot(kind="bar")
plt.title("Average Discharge by Station")
plt.ylabel("Average Discharge (CFS)")
plt.tight_layout()
plt.savefig("outputs/eda/station_discharge.png")
plt.close()

# 4. Rainfall vs discharge
plt.figure(figsize=(10, 5))
sns.scatterplot(
    data=train,
    x="precipitation_mm",
    y="discharge_cfs",
    alpha=0.3
)
plt.title("Rainfall vs River Discharge")
plt.savefig("outputs/eda/rainfall_discharge.png")
plt.close()

# 5. Correlation heatmap
numeric_data = train.select_dtypes(include="number")

plt.figure(figsize=(12, 8))
sns.heatmap(numeric_data.corr(), annot=True, cmap="coolwarm")
plt.title("Feature Correlation Heatmap")
plt.tight_layout()
plt.savefig("outputs/eda/correlation_heatmap.png")
plt.close()

print("EDA completed successfully!")
print("Charts saved inside outputs/eda/")