from sklearn.metrics import (
    mean_squared_error,
    mean_absolute_error,
    r2_score
)
import numpy as np

def evaluate_model(y_actual, y_pred):

    rmse = np.sqrt(
        mean_squared_error(y_actual, y_pred)
    )

    mae = mean_absolute_error(y_actual, y_pred)

    r2 = r2_score(y_actual, y_pred)

    print("RMSE:", rmse)
    print("MAE:", mae)
    print("R2 Score:", r2)