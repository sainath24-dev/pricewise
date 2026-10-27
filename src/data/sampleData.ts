/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataRecord } from '../types';

export const DATASET_DISCLAIMER =
  'SIMULATED DEMONSTRATION DATA — NOT REAL MARKETPLACE DATA. Generated with a fixed pseudorandom seed for reproducible academic experimentation according to the DPS project specifications.';

// Seeded pseudorandom generator for 100% deterministic reproducibility
function createSeededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const rng = createSeededRandom(42);

interface BaseProductTemplate {
  name: string;
  category: string;
  basePrice: number;
}

const PRODUCT_TEMPLATES: BaseProductTemplate[] = [
  // Electronics
  { name: 'UltraHD 4K Noise-Cancelling Headphones', category: 'Electronics', basePrice: 14999 },
  { name: 'Smart Fitness Tracker OLED Pro', category: 'Electronics', basePrice: 4499 },
  { name: 'Wireless Ergonomic Mechanical Keyboard', category: 'Electronics', basePrice: 6999 },
  { name: 'Precision Gaming Mouse 26K DPI', category: 'Electronics', basePrice: 3299 },
  { name: 'Portable Fast-Charging Powerbank 20000mAh', category: 'Electronics', basePrice: 2199 },
  { name: 'True Wireless Earbuds with ANC', category: 'Electronics', basePrice: 3999 },
  { name: '4K Ultra-Wide Curved Monitor 34"', category: 'Electronics', basePrice: 34999 },
  { name: 'Dual-Band Wi-Fi 6 Mesh Router System', category: 'Electronics', basePrice: 8499 },
  { name: 'Smart Home Security Camera 2K HDR', category: 'Electronics', basePrice: 2999 },
  { name: 'USB-C 10-in-1 Aluminum Hub Dock', category: 'Electronics', basePrice: 4199 },

  // Fashion & Apparel
  { name: 'Tailored Slim-Fit Cotton Oxford Shirt', category: 'Apparel', basePrice: 1899 },
  { name: 'Performance Water-Resistant Softshell Jacket', category: 'Apparel', basePrice: 4299 },
  { name: 'Stretch Denim Jeans Vintage Indigo', category: 'Apparel', basePrice: 2599 },
  { name: 'Breathable Merino Wool Crewneck Sweater', category: 'Apparel', basePrice: 3499 },
  { name: 'Athletic Quick-Dry Training Hoodie', category: 'Apparel', basePrice: 2299 },
  { name: 'Classic Pure Silk Formal Necktie Set', category: 'Apparel', basePrice: 1499 },
  { name: 'Lightweight Packable Windcheater', category: 'Apparel', basePrice: 2799 },
  { name: 'Heavyweight Fleece Casual Joggers', category: 'Apparel', basePrice: 1999 },

  // Footwear
  { name: 'Carbon-Plated Marathon Running Shoes', category: 'Footwear', basePrice: 7999 },
  { name: 'Casual Handcrafted Leather Loafers', category: 'Footwear', basePrice: 4999 },
  { name: 'Waterproof Trail Hiking Boots', category: 'Footwear', basePrice: 6499 },
  { name: 'Lightweight Slip-On Walking Sneakers', category: 'Footwear', basePrice: 2899 },
  { name: 'Retro High-Top Basketball Court Shoes', category: 'Footwear', basePrice: 5499 },

  // Home & Kitchen
  { name: 'Multi-Function Digital Air Fryer 5.5L', category: 'Home & Kitchen', basePrice: 6299 },
  { name: 'Espresso Maker with Milk Steam Frother', category: 'Home & Kitchen', basePrice: 11499 },
  { name: 'Cold-Press Slow Masticating Juicer', category: 'Home & Kitchen', basePrice: 7999 },
  { name: 'Robot Vacuum Cleaner with LiDAR Navigation', category: 'Home & Kitchen', basePrice: 22999 },
  { name: 'Stainless Steel Chef Knife Set 7-Piece', category: 'Home & Kitchen', basePrice: 3899 },
  { name: 'Aromatherapy Ultrasonic Cool Mist Humidifier', category: 'Home & Kitchen', basePrice: 2499 },
  { name: 'Insulated Thermal Flask 1.2L Bottle', category: 'Home & Kitchen', basePrice: 1299 },

  // Sports & Outdoors
  { name: 'Adjustable Dumbbell Set 24kg Single', category: 'Sports', basePrice: 10999 },
  { name: 'High-Density Non-Slip Yoga Mat 8mm', category: 'Sports', basePrice: 1699 },
  { name: 'Professional Carbon Fiber Tennis Racket', category: 'Sports', basePrice: 8999 },
  { name: 'All-Weather 4-Person Camping Dome Tent', category: 'Sports', basePrice: 7499 },
  { name: 'Speed Jump Rope with Steel Ball Bearings', category: 'Sports', basePrice: 699 },

  // Books & Stationery
  { name: 'The Art of Computer Systems Design (Hardcover)', category: 'Books', basePrice: 1499 },
  { name: 'Data Science & Machine Learning Masterclass', category: 'Books', basePrice: 1199 },
  { name: 'Financial Markets & Behavioral Economics', category: 'Books', basePrice: 999 },
  { name: 'Executive Refillable Leather Journal Notebook', category: 'Books', basePrice: 899 },
];

const SEASONS: Array<'Festival' | 'Peak' | 'Normal' | 'Clearance'> = [
  'Festival',
  'Peak',
  'Normal',
  'Clearance',
];

export function generateSampleDataset(): DataRecord[] {
  const records: DataRecord[] = [];
  const startDate = new Date(2026, 0, 1);
  let recordIdCounter = 1000;

  PRODUCT_TEMPLATES.forEach((tmpl, prodIdx) => {
    // Generate 6 distinct time-period / scenario records per product (240 total records)
    for (let i = 0; i < 6; i++) {
      recordIdCounter++;
      const dateOffsetDays = (prodIdx * 7 + i * 15) % 270;
      const recDate = new Date(startDate.getTime() + dateOffsetDays * 86400000);
      const dateStr = recDate.toISOString().split('T')[0];

      // Realistic economic simulation parameters
      const season = SEASONS[(i + prodIdx) % 4];
      const promotionActive = i % 2 === 0;

      // Base variation around nominal product price
      const priceJitter = 0.9 + rng() * 0.2; // 0.9 to 1.1
      const historicalPrice = Math.round(tmpl.basePrice * priceJitter);
      const currentPrice = Math.round(tmpl.basePrice * (0.92 + rng() * 0.16));

      // Competitor price fluctuates independently with market dynamics
      const compJitter = 0.88 + rng() * 0.24; // -12% to +12%
      const competitorPrice = Math.round(tmpl.basePrice * compJitter);

      // Demand index (1 to 100) influenced by seasonality and promotion
      let baseDemand = 30 + Math.floor(rng() * 45); // 30-75
      if (season === 'Festival') baseDemand += 22;
      if (season === 'Peak') baseDemand += 12;
      if (season === 'Clearance') baseDemand -= 8;
      if (promotionActive) baseDemand += 10;
      const demand = Math.min(100, Math.max(10, Math.round(baseDemand)));

      // Available stock (1 to 120 units)
      let stock = Math.round(15 + rng() * 80);
      if (season === 'Festival' && rng() > 0.4) {
        stock = Math.round(3 + rng() * 12); // inventory depletion during festivals
      }

      // Units sold daily historically
      const unitsSold = Math.round((demand * 0.45) / (1 + (currentPrice / tmpl.basePrice) * 0.3));

      // Economically sound target price calculation (ground truth based on microeconomic pricing theory)
      // 1. Demand elasticity factor
      const demandFactor = (demand - 50) / 100; // -0.4 to +0.5
      // 2. Scarcity / Inventory factor: low stock allows premium, high stock encourages discount
      const stockFactor = stock < 10 ? 0.08 : stock > 60 ? -0.06 : 0;
      // 3. Competitor price anchoring: price follows competitor pricing within margin
      const compDiffRatio = (competitorPrice - currentPrice) / currentPrice;
      const compWeight = 0.35 * compDiffRatio;
      // 4. Seasonality multiplier
      const seasonMultiplier =
        season === 'Festival' ? 0.08 : season === 'Peak' ? 0.04 : season === 'Clearance' ? -0.1 : 0;
      // 5. Promotion impact
      const promoFactor = promotionActive ? -0.05 : 0;
      // 6. Stochastic market noise (Gaussian-like)
      const randomNoise = (rng() - 0.5) * 0.04;

      const priceMultiplier =
        1.0 + demandFactor * 0.22 + stockFactor + compWeight + seasonMultiplier + promoFactor + randomNoise;

      // Bound price within reasonable merchant boundaries
      const targetPrice = Math.round(currentPrice * Math.max(0.72, Math.min(1.35, priceMultiplier)));

      records.push({
        id: `REC-${recordIdCounter}`,
        date: dateStr,
        product_id: `PROD-${(prodIdx + 1).toString().padStart(3, '0')}`,
        product_name: tmpl.name,
        category: tmpl.category,
        current_price: currentPrice,
        historical_price: historicalPrice,
        target_price: targetPrice,
        demand: demand,
        stock_available: stock,
        competitor_price: competitorPrice,
        units_sold: Math.max(1, unitsSold),
        season: season,
        promotion_active: promotionActive,
      });
    }
  });

  return records;
}

export const INITIAL_DEMO_DATASET: DataRecord[] = generateSampleDataset();
