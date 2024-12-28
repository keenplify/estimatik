import os
import pandas as pd
from keras.api.models import Sequential, load_model
from keras.api.layers import Dense
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Check if the dataset file exists
data_file = 'pc.csv'
if not os.path.exists(data_file):
    raise FileNotFoundError(f"The file {data_file} does not exist. Please provide the dataset file.")

# Load the dataset
df = pd.read_csv(data_file)

# Prepare the input (X) and output (y) data
X = df.drop(['PC'], axis=1)
y = df['PC']

# Split the dataset into 85% training and 15% test sets
X_train_val, X_test, y_train_val, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

# Split the 85% training data into 70% training and 15% validation sets
X_train, X_val, y_train, y_val = train_test_split(X_train_val, y_train_val, test_size=0.1765, random_state=42)  # 0.1765 * 85% ≈ 15%

# Normalize the data
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_val = scaler.transform(X_val)
X_test = scaler.transform(X_test)

# Check if the model file exists
model_file = 'pc.keras'
if os.path.exists(model_file):
    # Load the existing model
    predictor = load_model(model_file)
    print("Loaded existing model.")
else:
    raise FileNotFoundError(f"The file {model_file} does not exist. Please provide the model file.")

# Save the model
predictor.save(model_file)

# Prediction on the training, validation, and test sets
y_pred_train = predictor.predict(X_train)
y_pred_val = predictor.predict(X_val)
y_pred_test = predictor.predict(X_test)

# Calculate regression metrics for the training set
mae_train = mean_absolute_error(y_train, y_pred_train)
mse_train = mean_squared_error(y_train, y_pred_train)
r2_train = r2_score(y_train, y_pred_train)

# Calculate regression metrics for the validation set
mae_val = mean_absolute_error(y_val, y_pred_val)
mse_val = mean_squared_error(y_val, y_pred_val)
r2_val = r2_score(y_val, y_pred_val)

# Calculate regression metrics for the test set
mae_test = mean_absolute_error(y_test, y_pred_test)
mse_test = mean_squared_error(y_test, y_pred_test)
r2_test = r2_score(y_test, y_pred_test)

# Calculate overall regression metrics
y_true_overall = pd.concat([y_train, y_val, y_test])
y_pred_overall = pd.concat([pd.Series(y_pred_train.flatten()), pd.Series(y_pred_val.flatten()), pd.Series(y_pred_test.flatten())])

mae_overall = mean_absolute_error(y_true_overall, y_pred_overall)
mse_overall = mean_squared_error(y_true_overall, y_pred_overall)
r2_overall = r2_score(y_true_overall, y_pred_overall)

# Print the regression metrics
print(f"Training Set - MAE: {mae_train}, MSE: {mse_train}, R-squared: {r2_train}")
print(f"Validation Set - MAE: {mae_val}, MSE: {mse_val}, R-squared: {r2_val}")
print(f"Test Set - MAE: {mae_test}, MSE: {mse_test}, R-squared: {r2_test}")
print(f"Overall - MAE: {mae_overall}, MSE: {mse_overall}, R-squared: {r2_overall}")

# Save the actual and predicted values to CSV files
results_test = pd.DataFrame({'Actual': y_test, 'Predicted': y_pred_test.flatten()})
results_test.to_csv('pc_preds.csv', index=False)

results_train = pd.DataFrame({'Actual': y_train, 'Predicted': y_pred_train.flatten()})
results_train.to_csv('pc_train.csv', index=False)

results_val = pd.DataFrame({'Actual': y_val, 'Predicted': y_pred_val.flatten()})
results_val.to_csv('pc_val.csv', index=False)