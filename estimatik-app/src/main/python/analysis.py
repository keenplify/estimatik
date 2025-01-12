import pandas as pd
import json
import argparse
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
import numpy as np
import os

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

def analyze_csv(csv_file_path):
    # Read the CSV file into a pandas DataFrame
    df = pd.read_csv(csv_file_path)

    # Convert all columns to numeric, coercing errors to NaN
    df = df.apply(pd.to_numeric, errors='coerce')

    # Drop rows with any NaN values
    df = df.dropna()

    # Example analysis: Linear regression on the first column as Y and the rest as X
    y = df.iloc[:, 0]  # Dependent variable
    X = df.iloc[:, 1:]  # Independent variables

    # Fit the linear regression model
    model = LinearRegression().fit(X, y)

    # Calculate the residual sum of squares (RSS)
    predictions = model.predict(X)
    rss = mean_squared_error(y, predictions) * len(y)

    # Calculate the AIC
    n = len(y)
    k = X.shape[1] + 1  # Number of parameters including the intercept
    aic = n * np.log(rss / n) + 2 * k

    # Calculate R-squared and adjusted R-squared
    r_squared = model.score(X, y)
    adjusted_r_squared = 1 - (1 - r_squared) * (n - 1) / (n - k - 1)

    # Create the result dictionary
    result = {
        "AIC": aic,
        "rSquared": r_squared,
        "adjustedRsquared": adjusted_r_squared
    }

    # Return the result as a JSON string
    return json.dumps(result)

def main():
    parser = argparse.ArgumentParser(description='Process CSV data.')
    parser.add_argument('-file', type=str, required=True, help='Path to the CSV file')
    args = parser.parse_args()

    result_json = analyze_csv(args.file)
    print(result_json)

if __name__ == '__main__':
    main()