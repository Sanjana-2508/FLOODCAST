import pandas as pd
import matplotlib.pyplot as plt
import joblib
import os

print("=" * 55)
print("FLOODCAST - FEATURE IMPORTANCE ANALYSIS")
print("=" * 55)

# Load trained model
model = joblib.load(
    "outputs/final/final_random_forest.pkl"
)

# Load preprocessing information
preprocessing = joblib.load(
    "outputs/final/model_preprocessing.pkl"
)

features = preprocessing["features"]

# Extract feature importance
importance = pd.DataFrame({
    "Feature": features,
    "Importance": model.feature_importances_
})

# Sort by importance
importance = importance.sort_values(
    by="Importance",
    ascending=False
)

print("\nTOP 15 IMPORTANT FEATURES")
print(importance.head(15).to_string(index=False))

# Save results
os.makedirs("outputs/analysis", exist_ok=True)

importance.to_csv(
    "outputs/analysis/feature_importance.csv",
    index=False
)

# Plot top 15 features
plt.figure(figsize=(10, 7))

top_features = importance.head(15).sort_values(
    by="Importance"
)

plt.barh(
    top_features["Feature"],
    top_features["Importance"]
)

plt.xlabel("Feature Importance")
plt.ylabel("Features")

plt.title(
    "FLOODCAST - Random Forest Feature Importance"
)

plt.tight_layout()

plt.savefig(
    "outputs/analysis/feature_importance.png",
    dpi=300
)

plt.show()

print("\nFeature importance analysis completed!")
print("Results saved in outputs/analysis/")