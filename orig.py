Code 1

#Data Preprocessing

#Importing the libraries
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd

#importing the dataset
dataset = pd.read_csv('Steel6normalizedF.csv')
dataset1 = pd.read_csv('Steel6.csv')
X= dataset.iloc[:,1:9].values
y=dataset.iloc[:,0].values

#Splitting the data into trainning and testing
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X,y, test_size=0.2, random_state=0)

#Feature Scaling
y_train1=(2*((y_train-min(y))/(max(y)-min(y))))-1
y_test1=(2*((y_test-min(y))/(max(y)-min(y))))-1

y_train1_scaledback=((0.5*(y_train1+1))*(max(y)-min(y)))+min(y)

Code 2

import keras
from keras.models import Sequential
from keras.layers import Dense, Activation

# Fitting the ANN to the training set
predictor = Sequential()

# Adding the input layer and first hidden layer
predictor.add(Dense(activation="tanh", input_dim=7, units=4, kernel_initializer="uniform"))

# Adding the second hidden layer
predictor.add(Dense(activation="tanh", units=12, kernel_initializer="uniform"))

# Adding the Output layer
predictor.add(Dense(units=1, kernel_initializer="uniform"))

# Compiling the ANN
from keras import losses
predictor.compile(optimizer="RMSprop", loss="mean_absolute_percentage_error", metrics=['accuracy'])

# Fitting the ANN to the training set
predictor.fit(X_train, y_train1, batch_size=10, epochs=350)

# Prediction the test set results
y_pred = predictor.predict(X_test)
y_pred_scaledback = ((0.5 * (y_pred + 1) * (max(y) - min(y))) + min(y))

# The training set results
y_train_result = predictor.predict(X_train)
y_train_result_scaledback = ((0.5 * (y_train_result + 1) * (max(y) - min(y))) + min(y))

# Reading CSV files for predictions
X3 = pd.read_csv('JulyDec17Mar18.csv')
X4 = X3.iloc[:, 0:9].values
y4 = pd.read_csv('y4.csv')
y4 = y4.iloc[:, 0].values

# Prediction for new data
y4_pred = predictor.predict(X4)
y4_pred_scaledback = ((0.5 * (y4_pred + 1) * (max(y) - min(y))) + min(y))