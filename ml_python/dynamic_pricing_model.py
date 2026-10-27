"""
================================================================================
VISVESVARAYA TECHNOLOGICAL UNIVERSITY BELAGAVI-590 014
Lingaraj Appa Engineering College, Gornalli, Bidar - 585403 (2026-27)
Department of Computer Science & Engineering

Project: "Machine Learning–Based Dynamic Pricing Model for E-Commerce"
Syllabus Ref: DPS_fb375022.pdf

Authors:
  - Channaveer (3LA22CS014)
  - Abhishek (3LA23CS005)
  - Avishkar (3LA23CS019)
  - Pavan (3LA23CS060)

Faculty Mentors:
  - Project Guide: Dr. Sripal Reddy
  - Project Coordinator: Dr. Shilpa Harnale
================================================================================
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler

# ==============================================================================
# PHASE 2: DATA COLLECTION & PREPARATION
# ==============================================================================
def load_and_clean_data(filepath: str) -> pd.DataFrame:
    print(f"\n[Phase 2] Loading dataset from: {filepath}")
    df = pd.read_csv(filepath)
    print(f"  -> Total records loaded: {len(df)}")
    
    # 1. Missing values check & cleaning
    missing_count = df.isnull().sum().sum()
    if missing_count > 0:
        print(f"  -> Imputing {missing_count} missing values...")
        df = df.dropna().reset_index(drop=True)
    else:
        print("  -> Zero missing values detected.")
        
    # 2. Data validation
    df = df[(df['current_price'] > 0) & (df['target_price'] > 0)]
    df = df[(df['demand'] >= 0) & (df['stock_available'] >= 0)]
    df = df.drop_duplicates().reset_index(drop=True)
    
    print(f"  -> Valid sanitized records: {len(df)}")
    return df

# ==============================================================================
# PHASE 3: FEATURE ENGINEERING (DPS Requirements)
# ==============================================================================
def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    print("\n[Phase 3] Executing Microeconomic Feature Engineering...")
    df = df.copy()
    
    # 1. Demand to Stock Ratio (zero-stock protected)
    df['demand_to_stock_ratio'] = df['demand'] / (df['stock_available'] + 1.0)
    
    # 2. Competitor Price Difference
    df['competitor_price_diff'] = df['competitor_price'] - df['current_price']
    
    # 3. Competitor Price Ratio
    df['competitor_price_ratio'] = df['competitor_price'] / df['current_price']
    
    # 4. Historical Price Change
    df['historical_price_change'] = (df['current_price'] - df['historical_price']) / df['historical_price']
    
    # 5. Seasonal Intensity Encoding
    season_map = {'Festival': 1.30, 'Peak': 1.15, 'Normal': 1.00, 'Clearance': 0.80}
    df['season_intensity'] = df['season'].map(season_map).fillna(1.0)
    
    # 6. One-hot encode category
    cat_dummies = pd.get_dummies(df['category'], prefix='cat', drop_first=True, dtype=float)
    df = pd.concat([df, cat_dummies], axis=1)
    
    print(f"  -> Engineered features computed. Total features: {df.shape[1]}")
    return df

# ==============================================================================
# PHASE 4: MODEL DEVELOPMENT & TRAINING
# ==============================================================================
def train_and_evaluate_models(df: pd.DataFrame):
    print("\n[Phase 4] Training Supervised Machine Learning Algorithms (80/20 Train-Test Split)...")
    
    feature_cols = [
        'current_price', 'historical_price', 'demand', 'stock_available',
        'competitor_price', 'units_sold', 'demand_to_stock_ratio',
        'competitor_price_diff', 'competitor_price_ratio', 'historical_price_change',
        'season_intensity', 'promotion_active'
    ]
    # Add category one-hot columns
    cat_cols = [c for c in df.columns if c.startswith('cat_')]
    feature_cols.extend(cat_cols)
    
    X = df[feature_cols].values
    y = df['target_price'].values
    
    # 80% Train, 20% Held-Out Test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    print(f"  -> Training Set Size: {len(X_train)} samples")
    print(f"  -> Testing Set Size:  {len(X_test)} samples")
    
    # Feature Scaler for Linear Regression
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    models = {
        'Linear Regression': (Ridge(alpha=1.0), True),
        'Decision Tree': (DecisionTreeRegressor(max_depth=5, min_samples_leaf=3, random_state=42), False),
        'Random Forest': (RandomForestRegressor(n_estimators=30, max_depth=6, min_samples_leaf=2, random_state=42), False)
    }
    
    results = {}
    print("\n[Phase 5] Model Evaluation on Held-Out Test Data (MAE, RMSE, R² Score):")
    print("=" * 75)
    print(f"{'Algorithm':<22} | {'MAE (₹)':<12} | {'RMSE (₹)':<12} | {'R² Score':<12}")
    print("-" * 75)
    
    best_algo = None
    lowest_mae = float('inf')
    fitted_models = {}
    
    for name, (model, requires_scale) in models.items():
        if requires_scale:
            model.fit(X_train_scaled, y_train)
            preds = model.predict(X_test_scaled)
        else:
            model.fit(X_train, y_train)
            preds = model.predict(X_test)
            
        mae = mean_absolute_error(y_test, preds)
        rmse = np.sqrt(mean_squared_error(y_test, preds))
        r2 = r2_score(y_test, preds)
        
        results[name] = {'mae': mae, 'rmse': rmse, 'r2': r2, 'model': model}
        fitted_models[name] = model
        
        print(f"{name:<22} | ₹{mae:<11.2f} | ₹{rmse:<11.2f} | {r2:<12.4f}")
        
        if mae < lowest_mae:
            lowest_mae = mae
            best_algo = name
            
    print("=" * 75)
    print(f"★ Best-Performing Algorithm: {best_algo} (Lowest Test MAE: ₹{lowest_mae:.2f})")
    
    # Save best model artifact
    os.makedirs('ml_python/saved_models', exist_ok=True)
    joblib.dump(fitted_models[best_algo], f'ml_python/saved_models/{best_algo.replace(" ", "_").lower()}.pkl')
    joblib.dump(scaler, 'ml_python/saved_models/scaler.pkl')
    with open('ml_python/saved_models/features.json', 'w') as f:
        json.dump(feature_cols, f, indent=2)
    print(f"  -> Model artifact persisted to ml_python/saved_models/")
    
    return results, best_algo, feature_cols, scaler

# ==============================================================================
# PHASE 6: PRICE PREDICTION ENGINE DEMONSTRATION
# ==============================================================================
def predict_sample_price(product_info: dict, model, feature_cols, scaler=None):
    print("\n[Phase 6] Demonstrating Live Price Prediction Engine:")
    print(f"  Product Name:       {product_info['product_name']}")
    print(f"  Current Price:      ₹{product_info['current_price']}")
    print(f"  Competitor Price:   ₹{product_info['competitor_price']}")
    print(f"  Demand Volume:      {product_info['demand']} / 100")
    print(f"  Available Stock:    {product_info['stock_available']} units")
    print(f"  Season:             {product_info['season']}")
    
    # Calculate engineered features
    d_to_s = product_info['demand'] / (product_info['stock_available'] + 1.0)
    comp_diff = product_info['competitor_price'] - product_info['current_price']
    comp_ratio = product_info['competitor_price'] / product_info['current_price']
    hist_change = (product_info['current_price'] - product_info['historical_price']) / product_info['historical_price']
    season_intensity = {'Festival': 1.30, 'Peak': 1.15, 'Normal': 1.00, 'Clearance': 0.80}.get(product_info['season'], 1.0)
    
    feat_dict = {
        'current_price': product_info['current_price'],
        'historical_price': product_info['historical_price'],
        'demand': product_info['demand'],
        'stock_available': product_info['stock_available'],
        'competitor_price': product_info['competitor_price'],
        'units_sold': product_info.get('units_sold', 15),
        'demand_to_stock_ratio': d_to_s,
        'competitor_price_diff': comp_diff,
        'competitor_price_ratio': comp_ratio,
        'historical_price_change': hist_change,
        'season_intensity': season_intensity,
        'promotion_active': 1 if product_info.get('promotion_active', False) else 0
    }
    
    row = [feat_dict.get(c, 0.0) for c in feature_cols]
    vec = np.array([row])
    
    if scaler and isinstance(model, (LinearRegression, Ridge)):
        vec = scaler.transform(vec)
        
    raw_pred = float(model.predict(vec)[0])
    
    # Business Guardrails
    max_surge = product_info['current_price'] * 1.30
    min_discount = product_info['current_price'] * 0.65
    rec_price = min(max_surge, max(min_discount, raw_pred))
    
    pct_change = ((rec_price - product_info['current_price']) / product_info['current_price']) * 100
    
    print("-" * 50)
    print(f"  -> Raw ML Predicted Price: ₹{round(raw_pred, 2)}")
    print(f"  -> Executive Recommended:  ₹{round(rec_price, 2)} ({'+' if pct_change >= 0 else ''}{pct_change:.1f}%)")
    print("-" * 50)

if __name__ == '__main__':
    csv_file = os.path.join(os.path.dirname(__file__), 'ecommerce_pricing_dataset.csv')
    df = load_and_clean_data(csv_file)
    df_engineered = engineer_features(df)
    results, best_model_name, features, scaler = train_and_evaluate_models(df_engineered)
    
    sample_product = {
        'product_name': 'UltraHD 4K Noise-Cancelling Headphones',
        'category': 'Electronics',
        'current_price': 14999,
        'historical_price': 14999,
        'competitor_price': 15800,
        'demand': 88,
        'stock_available': 4,
        'season': 'Festival',
        'promotion_active': False
    }
    
    best_model = results[best_model_name]['model']
    predict_sample_price(sample_product, best_model, features, scaler)
