import pandas as pd
import numpy as np
import shap
import joblib
import matplotlib.pyplot as plt
import os

print("=" * 60)
print("FLOODCAST - SHAP EXPLAINABILITY")
print("=" * 60)

# Load training data
data = pd.read_csv(
    "outputs/features/train_features.csv"
)

# Load model
model = joblib.load(
    "outputs/final/final_random_forest.pkl"
)

# Load preprocessing information
preprocessing = joblib.load(
    "outputs/final/model_preprocessing.pkl"
)

features = preprocessing["features"]
medians = preprocessing["medians"]

# Prepare data
X = data[features].copy()
X = X.fillna(medians)

# Use a sample to reduce computation time
X_sample = X.sample(
    n=100,
    random_state=42
)

print("\nTotal training records:", len(X))
print("SHAP sample records:", len(X_sample))

# Create SHAP explainer
print("\nCreating SHAP explainer...")


explainer = shap.TreeExplainer(
    model,
    feature_perturbation="tree_path_dependent"
)
# Calculate SHAP values
print("Calculating SHAP values...")

shap_values = explainer.shap_values(X_sample)

print("\nSHAP calculation completed!")

# Create output directory
os.makedirs("outputs/analysis", exist_ok=True)

# Summary plot
print("\nGenerating SHAP summary plot...")

plt.figure()

shap.summary_plot(
    shap_values,
    X_sample,
    show=False,
    max_display=15
)

plt.tight_layout()

plt.savefig(
    "outputs/analysis/shap_summary.png",
    dpi=300,
    bbox_inches="tight"
)

plt.close()

# SHAP importance
print("\nGenerating SHAP feature importance...")

mean_importance = np.abs(shap_values).mean(axis=0)

importance = pd.DataFrame({
    "Feature": features,
    "Mean_SHAP_Importance": mean_importance
})

importance = importance.sort_values(
    by="Mean_SHAP_Importance",
    ascending=False
)

print("\nTOP 15 SHAP FEATURES")

print(
    importance.head(15).to_string(index=False)
)

importance.to_csv(
    "outputs/analysis/shap_feature_importance.csv",
    index=False
)

# Bar plot
plt.figure(figsize=(10, 7))

top_features = importance.head(15).sort_values(
    by="Mean_SHAP_Importance"
)

plt.barh(
    top_features["Feature"],
    top_features["Mean_SHAP_Importance"]
)

plt.xlabel("Mean Absolute SHAP Value")
plt.ylabel("Features")

plt.title("FLOODCAST - SHAP Feature Importance")

plt.tight_layout()

plt.savefig(
    "outputs/analysis/shap_importance.png",
    dpi=300
)

plt.close()

print("\nSHAP analysis completed successfully!")

print("\nGenerated files:")
print("1. outputs/analysis/shap_summary.png")
print("2. outputs/analysis/shap_importance.png")
print("3. outputs/analysis/shap_feature_importance.csv")