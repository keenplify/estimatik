import pandas as pd
import numpy as np
import json
import argparse
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.callbacks import EarlyStopping

def train_model(file_path, save_path):
    # Load the dataset
    df = pd.read_csv(file_path)
    
    # Prepare the input (X) and output (y) data
    X = df.drop(df.columns[0], axis=1)
    y = df[df.columns[0]]
    
    # Separate rows with missing output (y) values for prediction data
    prediction_data = df[y.isna()]
    prediction_X = prediction_data.drop(prediction_data.columns[0], axis=1)
    
    # Filter out rows with missing output (y) values for training, validation, and testing
    df = df.dropna(subset=[df.columns[0]])
    X = df.drop(df.columns[0], axis=1)
    y = df[df.columns[0]]
    
    # Split the dataset into 70% training, 15% validation, and 15% test sets
    X_train_val, X_test, y_train_val, y_test = train_test_split(X, y, test_size=0.15, random_state=42)
    X_train, X_val, y_train, y_val = train_test_split(X_train_val, y_train_val, test_size=0.1765, random_state=42)  # 0.1765 * 85% ≈ 15%
    
    # Normalize the data
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_val = scaler.transform(X_val)
    X_test = scaler.transform(X_test)
    prediction_X = scaler.transform(prediction_X)
    
    # Initialize a new model
    predictor = Sequential()
    
    # Adding the input layer and first hidden layer
    predictor.add(Dense(activation="relu", input_dim=X_train.shape[1], units=128, kernel_initializer="uniform"))
    
    # Adding the second hidden layer
    predictor.add(Dense(activation="relu", units=64, kernel_initializer="uniform"))
    
    # Adding the third hidden layer
    predictor.add(Dense(activation="relu", units=32, kernel_initializer="uniform"))
    
    # Adding the fourth hidden layer
    predictor.add(Dense(activation="relu", units=16, kernel_initializer="uniform"))
    
    # Adding the fifth hidden layer
    predictor.add(Dense(activation="relu", units=8, kernel_initializer="uniform"))
    
    # Adding the output layer
    predictor.add(Dense(units=1, kernel_initializer="uniform"))
    
    # Compiling the model
    predictor.compile(optimizer="RMSprop", loss="mean_absolute_percentage_error")
    
    # Early stopping callback
    early_stopping = EarlyStopping(monitor='val_loss', patience=50, restore_best_weights=True)
    
    # Fitting the model to the training set with early stopping
    history = predictor.fit(X_train, y_train, batch_size=10, epochs=1000, validation_data=(X_val, y_val), callbacks=[early_stopping], verbose=0)
    
    # Save the model
    predictor.save(save_path)
    
    # Prediction on the test set
    y_pred_test = predictor.predict(X_test)
    
    # Calculate regression metrics for test set
    test_mae = mean_absolute_error(y_test, y_pred_test)
    test_mse = mean_squared_error(y_test, y_pred_test)
    
    # Calculate regression metrics for training set
    y_pred_train = predictor.predict(X_train)
    train_mae = mean_absolute_error(y_train, y_pred_train)
    train_mse = mean_squared_error(y_train, y_pred_train)
    
    # Calculate regression metrics for validation set
    y_pred_val = predictor.predict(X_val)
    val_mae = mean_absolute_error(y_val, y_pred_val)
    val_mse = mean_squared_error(y_val, y_pred_val)
    
    # Predict the missing values
    y_pred_prediction = predictor.predict(prediction_X)
    
    # Prepare the result
    result = {
        "training": {
            "size": len(X_train),
            "mae": train_mae,
            "mse": train_mse
        },
        "validation": {
            "size": len(X_val),
            "mae": val_mae,
            "mse": val_mse
        },
        "testing": {
            "size": len(X_test),
            "mae": test_mae,
            "mse": test_mse
        },
        "prediction": {
            "size": len(prediction_X),
            "predictions": y_pred_prediction.flatten().tolist()
        },
        "model_path": save_path,
        "last_epoch": len(history.history['loss'])
    }
    
    # Print the result as JSON
    print(json.dumps(result, indent=4))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Train a model on a CSV file.')
    parser.add_argument('-file', type=str, required=True, help='Path to the CSV file')
    parser.add_argument('-path', type=str, required=True, help='Path to save the trained model')
    args = parser.parse_args()
    
    train_model(args.file, args.path)