import argparse
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Input, BatchNormalization
import numpy as np
import json
import os
import io
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.optimizers import RMSprop
import uuid
import matplotlib
import matplotlib.pyplot as plt
import base64

matplotlib.use('Agg')

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppress TensorFlow logging (1: INFO, 2: WARNING, 3: ERROR)

def build_model(input_dim, layers):
    units = input_dim * 2
    model = Sequential()
    model.add(Input(shape=(input_dim,)))
    for _ in range(layers):
        model.add(Dense(units, activation='relu', kernel_initializer="he_uniform"))
    model.add(BatchNormalization())
    model.add(Dense(1, kernel_initializer="he_uniform"))
    model.compile(optimizer=RMSprop(learning_rate=0.001), loss='mean_absolute_percentage_error', metrics=['mae'])
    return model

def compute_histogram(errors, bins=25):
    hist, bin_edges = np.histogram(errors, bins=bins)
    return {
        "counts": hist.tolist(),
        "bin_edges": bin_edges.tolist()
    }

def save_histogram_to_base64(train_errors, val_errors, test_errors, bins=25):
    # Create an in-memory bytes buffer to save the image
    buffer = io.BytesIO()

    # Plot the histograms on the same figure
    plt.figure()
    plt.hist(train_errors, bins=bins, alpha=0.5, color='blue', label='Train Errors')
    plt.hist(val_errors, bins=bins, alpha=0.5, color='green', label='Validation Errors')
    plt.hist(test_errors, bins=bins, alpha=0.5, color='red', label='Test Errors')

    plt.title('Error Histogram')
    plt.xlabel('Error')
    plt.ylabel('Frequency')
    plt.legend(loc='upper right')
    
    # Save the figure to the buffer
    plt.savefig(buffer, format='png')
    plt.close()
    
    # Encode the buffer's contents (image) to Base64
    buffer.seek(0)  # move cursor to the beginning
    img_str = base64.b64encode(buffer.read()).decode('utf-8')
    
    return img_str

def train_model(data_path, layers, prediction_path):
    df = pd.read_csv(data_path)
    df_predict = pd.read_csv(prediction_path)

    labels = df.iloc[:, 0].values
    y = df.iloc[:, 1].values
    X = df.iloc[:, 2:].values

    prediction_labels = df_predict.iloc[:, 0].values
    X_predict = df_predict.iloc[:, 2:].values  # Exclude the label and output columns

    # Normalize the data
    scaler_X = StandardScaler()
    X = scaler_X.fit_transform(X)
    X_predict = scaler_X.transform(X_predict)

    # Normalize the target variable
    scaler_y = StandardScaler()
    y = scaler_y.fit_transform(y.reshape(-1, 1)).flatten()

    # Check for NaN values in the data
    if np.isnan(X).any() or np.isnan(y).any():
        raise ValueError("Input data contains NaN values.")

    # Check if the number of columns in the prediction data matches the training data
    if X.shape[1] != X_predict.shape[1]:
        raise ValueError("Prediction data must have the same number of columns as training data.")

    X_train, X_temp, y_train, y_temp, labels_train, labels_temp = train_test_split(X, y, labels, test_size=0.3, random_state=42)
    X_val, X_test, y_val, y_test, labels_val, labels_test = train_test_split(X_temp, y_temp, labels_temp, test_size=0.5, random_state=42)

    model = build_model(X.shape[1], layers)
    history = model.fit(X_train, y_train, validation_data=(X_val, y_val), epochs=100, batch_size=32, verbose=0)

    y_train_pred = model.predict(X_train, verbose=0).flatten()
    y_val_pred = model.predict(X_val, verbose=0).flatten()
    y_test_pred = model.predict(X_test, verbose=0).flatten()
    y_predict = model.predict(X_predict, verbose=0).flatten()

    # Inverse transform the predictions and actual values
    y_train_pred = scaler_y.inverse_transform(y_train_pred.reshape(-1, 1)).flatten()
    y_val_pred = scaler_y.inverse_transform(y_val_pred.reshape(-1, 1)).flatten()
    y_test_pred = scaler_y.inverse_transform(y_test_pred.reshape(-1, 1)).flatten()
    y_predict = scaler_y.inverse_transform(y_predict.reshape(-1, 1)).flatten()
    y_train = scaler_y.inverse_transform(y_train.reshape(-1, 1)).flatten()
    y_val = scaler_y.inverse_transform(y_val.reshape(-1, 1)).flatten()
    y_test = scaler_y.inverse_transform(y_test.reshape(-1, 1)).flatten()

    # Check for NaN values in predictions
    if np.isnan(y_train_pred).any() or np.isnan(y_val_pred).any() or np.isnan(y_test_pred).any():
        raise ValueError("Model predictions contain NaN values.")

    train_predictions = {label: float(pred) for label, pred in zip(labels_train, y_train_pred)}
    val_predictions = {label: float(pred) for label, pred in zip(labels_val, y_val_pred)}
    test_predictions = {label: float(pred) for label, pred in zip(labels_test, y_test_pred)}
    predict_predictions = {label: float(pred) for label, pred in zip(prediction_labels, y_predict)}

    train_mae = mean_absolute_error(y_train, y_train_pred)
    train_mse = mean_squared_error(y_train, y_train_pred)
    val_mae = mean_absolute_error(y_val, y_val_pred)
    val_mse = mean_squared_error(y_val, y_val_pred)
    test_mae = mean_absolute_error(y_test, y_test_pred)
    test_mse = mean_squared_error(y_test, y_test_pred)

    newpath = f"{uuid.uuid4()}.keras"

    # Calculate the errors
    train_errors = y_train - y_train_pred
    val_errors = y_val - y_val_pred
    test_errors = y_test - y_test_pred

    # Save histogram images for errors
    img_str = save_histogram_to_base64(train_errors, val_errors, test_errors)

    # Compute histograms for errors
    train_histogram = compute_histogram(train_errors)
    val_histogram = compute_histogram(val_errors)
    test_histogram = compute_histogram(test_errors)

    result = {
        "training": {
            "size": len(X_train),
            "mae": train_mae,
            "mse": train_mse,
            "predictions": train_predictions,
            "histogram": train_histogram
        },
        "validation": {
            "size": len(X_val),
            "mae": val_mae,
            "mse": val_mse,
            "predictions": val_predictions,
            "histogram": val_histogram
        },
        "testing": {
            "size": len(X_test),
            "mae": test_mae,
            "mse": test_mse,
            "predictions": test_predictions,
            "histogram": test_histogram
        },
        "prediction": {
            "size": len(X_predict),
            "predictions": predict_predictions
        },
        "model_path": newpath,
        "last_epoch": len(history.history['loss']),
        "histogramImg": img_str,
    }

    model.save(newpath, overwrite=True)

    return result

def main():
    parser = argparse.ArgumentParser(description='Train a model with the provided CSV data.')
    parser.add_argument('-file', type=str, required=True, help='Path to the CSV file')
    parser.add_argument('-layers', type=int, required=True, help='Number of layers in the model')
    parser.add_argument('-predictionfile', type=str, required=True, help='Path to the CSV file for prediction')
    args = parser.parse_args()

    result = train_model(args.file, args.layers, args.predictionfile)
    print(json.dumps(result))

if __name__ == "__main__":
    main()