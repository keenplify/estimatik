import pandas as pd

from keras.api.models import Sequential
from keras.api.layers import Dense
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

df = pd.read_csv('Churn.csv')

x = pd.get_dummies(df.drop(['Churn', 'Customer ID'], axis=1))
y = df['Churn'].apply(lambda x: 1 if x=='Yes' else 0)

X_train, X_test, y_train, y_test = train_test_split(x, y, test_size=0.2)

X_train.head()

y_train.head()

model = Sequential()
model.add(Dense(units=32, activation='relu', input_dim=len(X_train.columns)))
model.add(Dense(units=64, activation='relu'))
model.add(Dense(units=1, activation='sigmoid'))

model.summary()

model.compile(loss='binary_crossentropy', optimizer='sgd', metrics=['accuracy'])

model.fit(X_train, y_train, epochs=200, batch_size=32)

y_hat = model.predict(X_test)
y_hat = [0 if val < 0.5 else 1 for val in y_hat]

accuracy_score(y_test, y_hat)

model.save('churn.h5')