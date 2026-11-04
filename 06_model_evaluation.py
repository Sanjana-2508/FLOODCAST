
import numpy as np
from sklearn.metrics import mean_squared_error
from sklearn.metrics import mean_absolute_error
from sklearn.metrics import r2_score

def evaluate_model(actual, predicted):

    rmse = np.sqrt(
        mean_squared_error(actual, predicted)
    )

    mae = mean_absolute_error(actual, predicted)

    r2 = r2_score(actual, predicted)

    print("Model Evaluation")
    print("----------------")
    print("RMSE:", rmse)
    print("MAE:", mae)
    print("R2 Score:", r2)