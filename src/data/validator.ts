/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataQualityReport, DataRecord } from '../types';

export const REQUIRED_NUMERIC_FIELDS = [
  'current_price',
  'historical_price',
  'target_price',
  'demand',
  'stock_available',
  'competitor_price',
];

export const CANONICAL_COLUMNS = [
  'date',
  'product_id',
  'product_name',
  'category',
  'current_price',
  'historical_price',
  'target_price',
  'demand',
  'stock_available',
  'competitor_price',
  'units_sold',
  'season',
  'promotion_active',
];

export function validateAndCleanDataset(rawRows: Record<string, any>[]): {
  cleanedData: DataRecord[];
  report: DataQualityReport;
} {
  const cleaningLog: string[] = [];
  let missingValuesCount = 0;
  let negativeStockCount = 0;
  let negativeDemandCount = 0;
  let invalidPriceCount = 0;
  let duplicateRowsCount = 0;

  const seenKeys = new Set<string>();
  const cleaned: DataRecord[] = [];
  const categoriesSet = new Set<string>();
  let minDate = '';
  let maxDate = '';

  rawRows.forEach((row, idx) => {
    // 1. Missing value check
    let hasMissing = false;
    REQUIRED_NUMERIC_FIELDS.forEach((field) => {
      if (row[field] === undefined || row[field] === null || row[field] === '') {
        hasMissing = true;
        missingValuesCount++;
      }
    });

    const currentPrice = Number(row.current_price);
    const historicalPrice = Number(row.historical_price ?? currentPrice);
    const targetPrice = Number(row.target_price ?? currentPrice);
    const demand = Number(row.demand);
    const stock = Number(row.stock_available);
    const compPrice = Number(row.competitor_price ?? currentPrice);
    const unitsSold = Number(row.units_sold ?? Math.max(1, Math.round(demand * 0.3)));

    // 2. Validate price numbers
    if (isNaN(currentPrice) || currentPrice <= 0 || isNaN(targetPrice) || targetPrice <= 0) {
      invalidPriceCount++;
      return; // Skip invalid price records
    }

    // 3. Check negative stock / demand
    if (isNaN(stock) || stock < 0) {
      negativeStockCount++;
      return;
    }
    if (isNaN(demand) || demand < 0) {
      negativeDemandCount++;
      return;
    }

    // 4. Duplicate check based on product_id + date or name + current_price
    const rowKey = `${row.product_id || row.product_name}-${row.date || idx}-${currentPrice}-${demand}`;
    if (seenKeys.has(rowKey)) {
      duplicateRowsCount++;
      return; // Deduplicate
    }
    seenKeys.add(rowKey);

    const category = (row.category || 'General').trim();
    categoriesSet.add(category);

    const dateVal = row.date || '2026-01-01';
    if (!minDate || dateVal < minDate) minDate = dateVal;
    if (!maxDate || dateVal > maxDate) maxDate = dateVal;

    // Normalizing season
    let season: 'Festival' | 'Peak' | 'Normal' | 'Clearance' = 'Normal';
    const sRaw = String(row.season || '').toLowerCase();
    if (sRaw.includes('fest')) season = 'Festival';
    else if (sRaw.includes('peak')) season = 'Peak';
    else if (sRaw.includes('clear')) season = 'Clearance';

    // Normalizing promotion
    const promoRaw = row.promotion_active;
    const promoActive =
      promoRaw === true ||
      promoRaw === 1 ||
      promoRaw === '1' ||
      String(promoRaw).toLowerCase() === 'true' ||
      String(promoRaw).toLowerCase() === 'yes';

    cleaned.push({
      id: row.id || `REC-${1000 + idx}`,
      date: dateVal,
      product_id: row.product_id || `PROD-${idx + 1}`,
      product_name: (row.product_name || `Product ${idx + 1}`).trim(),
      category: category,
      current_price: currentPrice,
      historical_price: historicalPrice,
      target_price: targetPrice,
      demand: Math.min(100, demand),
      stock_available: stock,
      competitor_price: compPrice,
      units_sold: unitsSold,
      season: season,
      promotion_active: promoActive,
    });
  });

  if (missingValuesCount > 0) {
    cleaningLog.push(`Detected and imputed/handled ${missingValuesCount} missing field values.`);
  }
  if (duplicateRowsCount > 0) {
    cleaningLog.push(`Removed ${duplicateRowsCount} duplicate records to prevent sample bias.`);
  }
  if (invalidPriceCount > 0) {
    cleaningLog.push(`Filtered out ${invalidPriceCount} records containing non-positive or non-numeric prices.`);
  }
  if (negativeStockCount > 0) {
    cleaningLog.push(`Filtered out ${negativeStockCount} records with negative stock availability.`);
  }
  if (negativeDemandCount > 0) {
    cleaningLog.push(`Filtered out ${negativeDemandCount} records with negative demand values.`);
  }
  if (cleaningLog.length === 0) {
    cleaningLog.push('All records passed zero-defect data quality integrity checks.');
  }

  const report: DataQualityReport = {
    totalRows: rawRows.length,
    validRows: cleaned.length,
    missingValuesCount,
    duplicateRowsCount,
    negativeStockCount,
    negativeDemandCount,
    invalidPriceCount,
    categories: Array.from(categoriesSet),
    dateRange: minDate && maxDate ? { start: minDate, end: maxDate } : null,
    features: CANONICAL_COLUMNS,
    targetColumn: 'target_price',
    cleaningLog,
  };

  return { cleanedData: cleaned, report };
}
