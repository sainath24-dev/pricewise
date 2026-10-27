"""
PriceWise - Canonical Dataset Generator
According to VTU BE Project: "Machine Learning-Based Dynamic Pricing Model for E-Commerce"
(DPS_fb375022.pdf)
"""
import random
import os
import pandas as pd
import numpy as np

def generate_dataset(num_records=500, random_seed=42):
    random.seed(random_seed)
    np.random.seed(random_seed)
    
    categories = {
        'Electronics': [
            ('UltraHD 4K Noise-Cancelling Headphones', 14999),
            ('Smart Fitness Tracker OLED Pro', 4499),
            ('Wireless Ergonomic Mechanical Keyboard', 6999),
            ('Precision Gaming Mouse 26K DPI', 3299),
            ('Portable Fast-Charging Powerbank 20000mAh', 2199),
            ('4K Ultra-Wide Curved Monitor 34"', 34999),
        ],
        'Apparel': [
            ('Tailored Slim-Fit Cotton Oxford Shirt', 1899),
            ('Performance Water-Resistant Softshell Jacket', 4299),
            ('Stretch Denim Jeans Vintage Indigo', 2599),
            ('Breathable Merino Wool Crewneck Sweater', 3499),
        ],
        'Footwear': [
            ('Carbon-Plated Marathon Running Shoes', 7999),
            ('Casual Handcrafted Leather Loafers', 4999),
            ('Waterproof Trail Hiking Boots', 6499),
            ('Lightweight Slip-On Walking Sneakers', 2899),
        ],
        'Home & Kitchen': [
            ('Multi-Function Digital Air Fryer 5.5L', 6299),
            ('Espresso Maker with Milk Steam Frother', 11499),
            ('Cold-Press Slow Masticating Juicer', 7999),
        ]
    }
    
    seasons = ['Festival', 'Peak', 'Normal', 'Clearance']
    records = []
    
    for i in range(1, num_records + 1):
        cat = random.choice(list(categories.keys()))
        prod_name, base_price = random.choice(categories[cat])
        
        hist_price = round(base_price * random.uniform(0.92, 1.08))
        current_price = round(hist_price * random.uniform(0.90, 1.10))
        competitor_price = round(base_price * random.uniform(0.88, 1.12))
        season = random.choice(seasons)
        promo_active = random.choice([0, 1])
        
        base_demand = random.randint(30, 75)
        if season == 'Festival': base_demand += 22
        elif season == 'Peak': base_demand += 12
        elif season == 'Clearance': base_demand -= 8
        if promo_active: base_demand += 10
        demand = min(100, max(10, base_demand))
        
        stock = random.randint(15, 95)
        if season == 'Festival' and random.random() > 0.4:
            stock = random.randint(3, 14)
            
        units_sold = max(1, round((demand * 0.45) / (1 + (current_price / base_price) * 0.3)))
        
        demand_factor = (demand - 50) / 100.0
        stock_factor = 0.08 if stock < 10 else (-0.06 if stock > 60 else 0.0)
        comp_diff_ratio = (competitor_price - current_price) / current_price
        comp_weight = 0.35 * comp_diff_ratio
        season_multiplier = 0.08 if season == 'Festival' else (0.04 if season == 'Peak' else (-0.10 if season == 'Clearance' else 0.0))
        promo_factor = -0.05 if promo_active else 0.0
        random_noise = (random.random() - 0.5) * 0.04
        
        multiplier = 1.0 + demand_factor * 0.22 + stock_factor + comp_weight + season_multiplier + promo_factor + random_noise
        target_price = round(current_price * max(0.72, min(1.35, multiplier)))
        
        date_str = f"2026-{random.randint(1, 10):02d}-{random.randint(1, 28):02d}"
        
        records.append({
            'date': date_str,
            'product_id': f"PROD-{random.randint(1, 25):03d}",
            'product_name': prod_name,
            'category': cat,
            'current_price': current_price,
            'historical_price': hist_price,
            'target_price': target_price,
            'demand': demand,
            'stock_available': stock,
            'competitor_price': competitor_price,
            'units_sold': units_sold,
            'season': season,
            'promotion_active': promo_active
        })
        
    df = pd.DataFrame(records)
    return df

if __name__ == '__main__':
    os.makedirs('ml_python', exist_ok=True)
    df = generate_dataset()
    csv_path = os.path.join(os.path.dirname(__file__), 'ecommerce_pricing_dataset.csv')
    df.to_csv(csv_path, index=False)
    print(f"Generated dataset with {len(df)} records at {csv_path}")
