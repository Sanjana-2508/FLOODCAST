import pandas as pd
import numpy as np

print("=" * 60)
print("FLOODCAST - COMPETITION MODEL SELECTION")
print("=" * 60)

# Load validation results
chronological = pd.read_csv(
    "outputs/models/chronological_comparison.csv"
)

station = pd.read_csv(
    "outputs/models/original_station_comparison_clean.csv"
)

advanced_station = pd.read_csv(
    "outputs/models/advanced_station_comparison.csv"
)

# Display chronological results
print("\nCHRONOLOGICAL VALIDATION")
print(chronological.to_string(index=False))

# Display original station results
print("\nORIGINAL STATION VALIDATION")
print(station.to_string(index=False))

# Display advanced station results
print("\nADVANCED STATION VALIDATION")
print(advanced_station.to_string(index=False))

print("\n" + "=" * 60)
print("MODEL SELECTION ANALYSIS")
print("=" * 60)

print("""
Important observations:

1. Random Forest performs better on unseen-station validation.

2. XGBoost performs better on chronological validation.

3. Advanced rainfall features provide very little improvement.

4. Competition test data contains completely unseen stations.

5. Extreme-event RMSE contributes 30% of the competition score.
""")

# Compare models using unseen-station validation
print("\nPRIMARY VALIDATION: UNSEEN STATIONS")

results = station.copy()

best_rmse = results.loc[results["RMSE"].idxmin()]
best_extreme = results.loc[
    results["Extreme_RMSE"].idxmin()
]
best_mae = results.loc[results["MAE"].idxmin()]
best_r2 = results.loc[results["R2"].idxmax()]

print("\nBest overall RMSE:", best_rmse["Model"])
print("Best extreme RMSE:", best_extreme["Model"])
print("Best MAE:", best_mae["Model"])
print("Best R2:", best_r2["Model"])

print("\n" + "=" * 60)
print("CURRENT RECOMMENDATION")
print("=" * 60)

print("""
MAIN MODEL: Original Random Forest

Reason:
- Better unseen-station RMSE than XGBoost.
- Better unseen-station extreme-event RMSE.
- Better unseen-station R2.
- Competition test stations are unseen during training.

We will retain XGBoost as a secondary candidate.
""")

print("Model selection analysis completed!")