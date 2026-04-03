import pandas as pd
from sklearn.metrics import r2_score, mean_absolute_error
from sklearn.preprocessing import LabelEncoder
import xgboost as xgb
import joblib

# -------------------------
# LOAD DATA
# -------------------------

# Plant 1
gen1 = pd.read_csv("data/Plant_1_Generation_Data.csv")
weather1 = pd.read_csv("data/Plant_1_Weather_Sensor_Data.csv")
data1 = pd.merge(gen1, weather1, on="DATE_TIME")

# Plant 2
gen2 = pd.read_csv("data/Plant_2_Generation_Data.csv")
weather2 = pd.read_csv("data/Plant_2_Weather_Sensor_Data.csv")
data2 = pd.merge(gen2, weather2, on="DATE_TIME")

# -------------------------
# ADD PLANT FEATURE
# -------------------------

data1['plant'] = 1
data2['plant'] = 2

# -------------------------
# COMBINE DATA
# -------------------------

data = pd.concat([data1, data2], ignore_index=True)

# -------------------------
# TIME FEATURES
# -------------------------

data['DATE_TIME'] = pd.to_datetime(data['DATE_TIME'])

data['hour'] = data['DATE_TIME'].dt.hour
data['day'] = data['DATE_TIME'].dt.day
data['month'] = data['DATE_TIME'].dt.month
data['day_of_week'] = data['DATE_TIME'].dt.dayofweek

# Daylight feature
data['is_daylight'] = ((data['hour'] >= 6) & (data['hour'] <= 18)).astype(int)

# -------------------------
# HANDLE SOURCE KEY
# -------------------------

data['SOURCE_KEY'] = data['SOURCE_KEY_x']

le = LabelEncoder()
data['SOURCE_KEY'] = le.fit_transform(data['SOURCE_KEY'])

# -------------------------
# LAG FEATURE (IMPORTANT)
# -------------------------

data = data.sort_values(by=['SOURCE_KEY_x', 'DATE_TIME'])
data['prev_power'] = data.groupby('SOURCE_KEY_x')['AC_POWER'].shift(1)

# -------------------------
# CLEAN DATA
# -------------------------

data = data[data['IRRADIATION'] > 0]

data = data[data['AC_POWER'] >= 0]
data = data[data['IRRADIATION'] >= 0]

# -------------------------
# SELECT FEATURES
# -------------------------

data = data[['AC_POWER',
             'prev_power',
             'IRRADIATION',
             'AMBIENT_TEMPERATURE',
             'MODULE_TEMPERATURE',
             'hour', 'day', 'month', 'day_of_week',
             'is_daylight',
             'plant',
             'SOURCE_KEY']]

data = data.dropna()

print("Final data shape:", data.shape)

# -------------------------
# TIME-BASED SPLIT
# -------------------------

X = data.drop('AC_POWER', axis=1)
y = data['AC_POWER']

split = int(0.8 * len(data))

X_train = X[:split]
X_test = X[split:]

y_train = y[:split]
y_test = y[split:]

# -------------------------
# MODEL
# -------------------------

model = xgb.XGBRegressor(
    n_estimators=600,
    learning_rate=0.03,
    max_depth=7,
    subsample=0.9,
    colsample_bytree=0.9,
    random_state=42
)

model.fit(X_train, y_train)

# -------------------------
# EVALUATE
# -------------------------

preds = model.predict(X_test)

print("R2 Score:", r2_score(y_test, preds))
print("MAE:", mean_absolute_error(y_test, preds))

joblib.dump(model, "solar_model.pkl")
print("Model saved!")