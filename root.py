import numpy as np
import pandas as pd
from keras.api.models import Sequential, load_model
from keras.api.layers import Dense
from keras.api.callbacks import EarlyStopping
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler
from os import path

# Load the dataset
df = pd.read_csv('rsb.csv')

# Prepare the input (X) and output (y) data
X = df.drop(['RSB'], axis=1)
y = df['RSB']

# Split the dataset into training and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Normalize the data
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Check if the model file exists
model_file = 'rsb.keras'
if path.exists(model_file):
    # Load the existing model
    predictor = load_model(model_file)
    print("Loaded existing model.")
else:
    # Initialize a new model
    predictor = Sequential()

    # Adding the input layer and first hidden layer
    predictor.add(Dense(activation="tanh", input_dim=X_train.shape[1], units=64, kernel_initializer="uniform"))

    # Adding the second hidden layer
    predictor.add(Dense(activation="tanh", units=32, kernel_initializer="uniform"))

    # Adding the third hidden layer
    predictor.add(Dense(activation="tanh", units=16, kernel_initializer="uniform"))

    # Adding the fourth hidden layer
    predictor.add(Dense(activation="tanh", units=8, kernel_initializer="uniform"))

    # Adding the fifth hidden layer
    predictor.add(Dense(activation="tanh", units=4, kernel_initializer="uniform"))

    # Adding the output layer
    predictor.add(Dense(units=1, kernel_initializer="uniform"))

    # Compiling the model
    predictor.compile(optimizer="RMSprop", loss="mean_absolute_percentage_error")

    print("Created a new model.")

# Early stopping callback
early_stopping = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)

# Fitting the model to the training set with early stopping
predictor.fit(X_train, y_train, batch_size=10, epochs=5000, validation_split=0.2, callbacks=[early_stopping])

# Save the model
predictor.save(model_file)

# Prediction on the test set
y_pred = predictor.predict(X_test)

# Calculate regression metrics
mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"Mean Absolute Error: {mae}")
print(f"Mean Squared Error: {mse}")
print(f"R-squared: {r2}")

# Save the actual and predicted values to a CSV file
results = pd.DataFrame({'Actual': y_test, 'Predicted': y_pred.flatten()})
results.to_csv('rsb_preds.csv', index=False)