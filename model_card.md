# FLOODCAST – Machine Learning Model Card

## 1. Project Overview

**Project Name:** FLOODCAST – Predict the Surge Before It Strikes

**Category:** Disaster Risk Prediction and Early Warning Systems

**Task:** Regression – River Discharge Prediction

FLOODCAST is a machine learning-based flood prediction system designed to estimate river discharge using historical rainfall, environmental conditions, geographical characteristics and temporal features.

The objective is to develop a model that generalizes to previously unseen monitoring stations and supports better flood-risk assessment.

## 2. Dataset Information

The model uses the official competition dataset.

| Dataset                         | Records |
| ------------------------------- | ------: |
| Training dataset                |  58,448 |
| Testing dataset                 |   2,924 |
| Monitoring stations in training |      16 |
| Unseen testing stations         |       4 |

**Training period:** January 2015 – December 2024

**Testing period:** January 2023 – December 2024

**Target variable:** `discharge_cfs`

The target represents river discharge measured in cubic feet per second (CFS).

## 3. Data Preprocessing

The following preprocessing operations were performed:

* Dataset inspection and validation.
* Missing-value analysis.
* Duplicate-record checks.
* Discharge distribution analysis.
* Station metadata integration.
* Chronological sorting of observations.
* Missing-value imputation using training-set medians.

No synthetic training records were introduced.

## 4. Feature Engineering

A total of 24 features were used in the selected model.

Important feature categories include:

**Rainfall features**

* precipitation_mm
* rain_lag_1
* rain_lag_3
* rain_lag_7
* rain_sum_prev_3d
* rain_sum_prev_7d

**Environmental features**

* soil_moisture
* temp_max_c
* temp_min_c

**Geographical features**

* drainage_area_sqmi
* latitude
* longitude
* slope_pct
* mean_elevation_ft
* forest_cover_pct

**Temporal features**

* month
* day_of_year
* day_of_week
* year
* month_sin
* month_cos
* day_sin
* day_cos

Lag and rolling rainfall features use previous observations to avoid future-data leakage.

## 5. Model Architecture

Two machine learning algorithms were evaluated:

1. Random Forest Regressor
2. XGBoost Regressor

### Selected Model: Random Forest Regressor

Configuration:

| Parameter                | Value |
| ------------------------ | ----: |
| Number of estimators     |   300 |
| Maximum depth            |    20 |
| Minimum samples per leaf |     2 |
| Maximum features         |   0.8 |
| Random state             |    42 |

Random Forest was selected as the primary model because it performed better during unseen-station validation.

## 6. Model Validation

Two validation strategies were implemented.

### A. Chronological Validation

* Training period: 2015–2022
* Validation period: 2023–2024
* Training records: 46,752
* Validation records: 11,696

Random Forest results:

| Metric             |  Result |
| ------------------ | ------: |
| RMSE               | 1116.49 |
| Extreme-event RMSE | 3400.19 |
| MAE                |  240.70 |
| R²                 |  0.6682 |

XGBoost performed slightly better in chronological validation.

### B. Station-Holdout Validation

Four complete stations were held out during training:

* SYNTH-001
* SYNTH-002
* SYNTH-006
* SYNTH-015

Random Forest results:

| Metric             |  Result |
| ------------------ | ------: |
| RMSE               | 1618.05 |
| Extreme-event RMSE | 4981.92 |
| MAE                |  400.14 |
| R²                 |  0.6031 |

Random Forest outperformed XGBoost on all four metrics in the clean station-holdout comparison.

Since the competition test dataset contains previously unseen stations, station-holdout performance was given greater importance during model selection.

## 7. Feature Importance and Explainability

Feature importance was calculated using Random Forest's built-in feature importance.

Top features:

1. precipitation_mm
2. drainage_area_sqmi
3. rain_sum_prev_3d
4. rain_lag_1
5. soil_moisture

SHAP (SHapley Additive exPlanations) was also used to understand model predictions.

The SHAP analysis identified the following important features:

* Precipitation
* Previous 3-day rainfall
* Drainage area
* Previous-day rainfall
* Soil moisture

These results indicate that rainfall conditions and geographical characteristics contribute substantially to the model's predictions.

Feature importance and SHAP values describe model behaviour, not causal relationships.

## 8. Final Model Training

The selected Random Forest model was retrained using all 58,448 available training records.

The final model was saved as:

`outputs/final/final_random_forest.pkl`

Preprocessing information was saved as:

`outputs/final/model_preprocessing.pkl`

## 9. Competition Predictions

The final model generated predictions for all 2,924 test records.

Submission file:

`outputs/submission/predictions.csv`

The submission contains:

* station_id
* date
* discharge_cfs

All submission validation checks passed:

* Correct number of records.
* Correct column names.
* Correct station identifiers.
* Correct date ordering.
* No missing predictions.
* No negative predictions.
* No infinite values.
* All four test stations included.

## 10. Model Limitations

* The model has been evaluated using historical competition data.
* Actual discharge labels for the unseen test stations are unavailable during development.
* Performance on unseen stations may differ from validation performance.
* Extreme flood events are relatively rare and difficult to predict accurately.
* Missing historical rainfall information for initial test observations requires imputation.
* Predictions should not be treated as guaranteed flood warnings.

## 11. Intended Use

FLOODCAST is designed as a research and decision-support prototype for flood-discharge estimation.

Potential applications include:

* Flood-risk assessment.
* Disaster preparedness.
* River monitoring support.
* Early-warning system research.
* Identification of potentially high-discharge conditions.

The system is not a replacement for official meteorological agencies or emergency-response authorities.

## 12. Conclusion

FLOODCAST demonstrates the application of machine learning, feature engineering, model validation and explainable AI to flood-discharge prediction.

Random Forest was selected based on its performance on unseen-station validation.

The project combines environmental and geographical information to estimate river discharge and provides an explainable foundation for further flood-risk prediction research.
