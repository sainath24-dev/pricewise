# PRICEWISE — E-Commerce Machine Learning Dynamic Pricing Intelligence Platform

A comprehensive, production-grade Machine Learning Dynamic Pricing Platform and E-Commerce System built for the engineering project:

> **"Machine Learning–Based Dynamic Pricing Model for E-Commerce"**  
> **Institution:** Visvesvaraya Technological University, Belagavi (VTU)  
> **College:** Lingaraj Appa Engineering College, Gornalli, Bidar - 585403 (2026–27)  
> **Department:** Bachelor of Engineering in Computer Science & Engineering  
> **Faculty Guide:** Dr. Sripal Reddy  
> **Project Co-ordinator:** Dr. Shilpa Harnale  
> **Student Authors:** Channaveer (3LA22CS014), Abhishek (3LA23CS005), Avishkar (3LA23CS019), Pavan (3LA23CS060)

---

## 1. Problem Statement
With the rapid proliferation of e-commerce platforms and digital marketplaces, static pricing strategies fail to adapt to rapid changes in consumer demand, competitor actions, inventory depletion, and seasonal festivals. Manual or static rule-based pricing leads to either **overpricing** (customer churn) or **underpricing** (eroded profit margins). This platform develops an intelligent, data-driven machine learning system to predict optimal product selling prices.

---

## 2. Core Objectives
1. **Design a supervised ML dynamic pricing model** based on empirical market features.
2. **Predict optimal selling prices** considering demand volume, inventory scarcity, and competitor price moves.
3. **Execute data preprocessing & feature engineering**:
   - `demand_to_stock_ratio` = $\frac{\text{demand}}{\text{stock} + 1}$
   - `competitor_price_diff` = $\text{competitor\_price} - \text{current\_price}$
   - `competitor_price_ratio` = $\frac{\text{competitor\_price}}{\text{current\_price}}$
   - `season_intensity` = encoded seasonal factor (Festival: 1.30, Peak: 1.15, Normal: 1.00, Clearance: 0.80)
4. **Evaluate and benchmark models** using MAE (Mean Absolute Error), RMSE (Root Mean Squared Error), and $R^2$ Score.
5. **Compare 3 required algorithms** (Linear Regression, Decision Tree, Random Forest) and select the best performer.
6. **Provide a dual-mode interactive experience**:
   - An ML Pricing Intelligence Studio (Phases 1–6)
   - A live customer-facing E-Commerce Storefront with real-time dynamic pricing badges.

---

## 3. Technology Stack
- **Frontend & App Framework:** React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons
- **Data Manipulation:** PapaParse, vector preprocessors
- **Machine Learning Algorithms:**
  - *Linear Regression:* Normal equations $(X^T X + \lambda I)^{-1} X^T y$ with Ridge regularization.
  - *Decision Tree Regressor:* Binary recursive CART splitting minimizing variance reduction with configurable `maxDepth` and `minSamplesLeaf`.
  - *Random Forest Regressor:* Bagged ensemble of bootstrap trees with random feature subspace sub-sampling.
- **Evaluation Engine:** Exact mathematical MAE, RMSE, and $R^2$ Score calculations on held-out 20% test splits.

---

## 4. Canonical Dataset Schema
| Column | Type | Description |
|---|---|---|
| `date` | String (YYYY-MM-DD) | Observation timestamp |
| `product_id` | String | Unique product SKU identifier |
| `product_name` | String | Product title |
| `category` | String | Retail category (Electronics, Footwear, Apparel, etc.) |
| `current_price` | Number | Active retail selling price |
| `historical_price`| Number | Baseline historical price reference |
| `target_price` | Number | Ground truth optimal target selling price |
| `demand` | Number (1–100) | Customer search and inquiry volume index |
| `stock_available`| Number | Available inventory in warehouse units |
| `competitor_price`| Number | Real-time rival marketplace price |
| `units_sold` | Number | Daily historical volume sold |
| `season` | String | Festival, Peak, Normal, or Clearance |
| `promotion_active`| Boolean | Coupon or promotion active (true/false) |

---

## 5. System Architecture & Pages
- **Page 1: Overview Dashboard:** System telemetry, benchmark leaderboard, and workflow guidance.
- **Page 2: Dataset Explorer:** Ingest custom CSVs, data quality audit (missing values, negative stock, deduplication), and export sanitized data.
- **Page 3: Exploratory Data Analysis (EDA):** Pearson correlation matrix heatmap, price and demand distribution histograms, and category volume variances.
- **Page 4: Train Models Studio:** 80/20 train-test partitioning, hyperparameter tuning sliders, and live model training.
- **Page 5: Model Evaluation:** MAE, RMSE, $R^2$ leaderboard, actual vs predicted scatter plots ($y=x$ ideal line), and residual bell curves.
- **Page 6: Price Predictor Engine:** Interactive pricing simulator with sliders, presets, raw predictions, and executive guardrails.
- **Page 7: Pricing Insights:** Pricing anomaly surveillance queue, competitor price gaps, and demand elasticity patterns.
- **Page 8: Prediction History:** Persistent audit log with CSV export and filtering.
- **Page 9: Project Synopsis:** Academic thesis documentation for VTU Belagavi & Lingaraj Appa Engineering College.
- **Page 10: Settings & Guardrails:** Max surge caps, discount floors, margin protection, and currency selection.
- **Storefront: Live E-Commerce Store:** Real-time customer experience with dynamic surge and discount tags, price inspector, and cart checkout.

---

## 6. Execution & Testing

### Option A: Python / Scikit-learn Pipeline (Academic Syllabus Requirement)
To run the standard Python machine learning workflow (Pandas, Scikit-learn, NumPy):
```bash
# 1. Run Python training & evaluation pipeline
python3 ml_python/dynamic_pricing_model.py

# 2. Or explore the Jupyter Notebook
jupyter notebook ml_python/Dynamic_Pricing_Model.ipynb
```

### Option B: Interactive Web Application
Run unit tests for all mathematical algorithms:
```bash
npm test
```

Start the interactive web platform:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

