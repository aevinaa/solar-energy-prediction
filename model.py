import pandas as pd
from sklearn.metrics import r2_score, mean_absolute_error
from sklearn.preprocessing import LabelEncoder
import xgboost as xgb
import joblib

# -------------------------
# LOAD DATA
# -------------------------

gen1     = pd.read_csv("data/Plant_1_Generation_Data.csv")
weather1 = pd.read_csv("data/Plant_1_Weather_Sensor_Data.csv")
data1    = pd.merge(gen1, weather1, on="DATE_TIME")

gen2     = pd.read_csv("data/Plant_2_Generation_Data.csv")
weather2 = pd.read_csv("data/Plant_2_Weather_Sensor_Data.csv")
data2    = pd.merge(gen2, weather2, on="DATE_TIME")

data1['plant'] = 1
data2['plant'] = 2

data = pd.concat([data1, data2], ignore_index=True)

# -------------------------
# UNIT CHECK
# -------------------------

print("=== RAW AC_POWER stats ===")
print(data['AC_POWER'].describe())
print(f"Max AC_POWER: {data['AC_POWER'].max():.2f}")

# -------------------------
# NORMALISE TARGET TO 0-1
# per-plant peak so model learns efficiency fraction
# -------------------------

plant_peak = data.groupby('plant')['AC_POWER'].max()
print("\nPer-plant AC_POWER peak:")
print(plant_peak)

data['plant_peak']    = data['plant'].map(plant_peak)
data['AC_POWER_norm'] = data['AC_POWER'] / data['plant_peak']

# Save peaks — API uses this to know the training scale
plant_peak.to_csv("plant_peak.csv")
print("Saved plant_peak.csv")

# -------------------------
# TIME FEATURES
# -------------------------

data['DATE_TIME']   = pd.to_datetime(data['DATE_TIME'])
data['hour']        = data['DATE_TIME'].dt.hour
data['day']         = data['DATE_TIME'].dt.day
data['month']       = data['DATE_TIME'].dt.month
data['day_of_week'] = data['DATE_TIME'].dt.dayofweek
data['is_daylight'] = ((data['hour'] >= 6) & (data['hour'] <= 18)).astype(int)

# -------------------------
# SOURCE KEY
# -------------------------

data['SOURCE_KEY'] = data['SOURCE_KEY_x']
le = LabelEncoder()
data['SOURCE_KEY'] = le.fit_transform(data['SOURCE_KEY'])
joblib.dump(le, "source_key_encoder.pkl")

# -------------------------
# LAG FEATURE — normalised
# -------------------------

data = data.sort_values(by=['SOURCE_KEY_x', 'DATE_TIME'])
data['prev_power_norm'] = data.groupby('SOURCE_KEY_x')['AC_POWER_norm'].shift(1)

# -------------------------
# CLEAN
# -------------------------

data = data[data['IRRADIATION']   >= 0]
data = data[data['AC_POWER_norm'] >= 0]

# -------------------------
# FEATURES
# -------------------------
# Target: AC_POWER_norm (0 to 1 fraction of plant peak)
# At inference: model_output × plant_size → kW
# prev_power_norm at inference: prev_power_kW / plant_size

FEATURES = [
    'prev_power_norm',
    'IRRADIATION',
    'AMBIENT_TEMPERATURE',
    'MODULE_TEMPERATURE',
    'hour', 'day', 'month', 'day_of_week',
    'is_daylight',
    'plant',
    'SOURCE_KEY',
]

data = data[FEATURES + ['AC_POWER_norm']].dropna()
print("\nFinal data shape:", data.shape)
print(f"AC_POWER_norm range: {data['AC_POWER_norm'].min():.4f} – {data['AC_POWER_norm'].max():.4f}")

# -------------------------
# TIME-BASED SPLIT
# -------------------------

X = data[FEATURES]
y = data['AC_POWER_norm']

split   = int(0.8 * len(data))
X_train = X[:split];  X_test  = X[split:]
y_train = y[:split];  y_test  = y[split:]

# -------------------------
# MODEL
# -------------------------

model = xgb.XGBRegressor(
    n_estimators=600,
    learning_rate=0.03,
    max_depth=7,
    subsample=0.9,
    colsample_bytree=0.9,
    random_state=42,
)
model.fit(X_train, y_train)

# -------------------------
# EVALUATE
# -------------------------

preds = model.predict(X_test)
print("\n=== Evaluation (normalised 0-1 scale) ===")
print(f"R2 Score : {r2_score(y_test, preds):.4f}")
print(f"MAE      : {mean_absolute_error(y_test, preds):.4f}")
print(f"\nExample: 0.60 × 5 kW plant = {0.60*5:.2f} kW")
print(f"Example: 0.80 × 5 kW plant = {0.80*5:.2f} kW")

joblib.dump(model, "solar_model.pkl")
print("\nModel saved as solar_model.pkl")