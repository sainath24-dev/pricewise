/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FeatureImportance } from '../types';

export interface LinearModelData {
  weights: number[];
  intercept: number;
  featureNames: string[];
}

/**
 * Solve linear system A * x = b using Gaussian elimination with partial pivoting.
 */
function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = A.length;
  // Clone matrix and vector to prevent mutation
  const M = A.map((row) => [...row]);
  const x = [...b];

  for (let i = 0; i < n; i++) {
    // Pivot selection
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
        maxRow = k;
      }
    }

    // Swap rows
    [M[i], M[maxRow]] = [M[maxRow], M[i]];
    [x[i], x[maxRow]] = [x[maxRow], x[i]];

    if (Math.abs(M[i][i]) < 1e-12) {
      M[i][i] = 1e-6; // Regularization stabilizer
    }

    // Eliminate below
    for (let k = i + 1; k < n; k++) {
      const factor = M[k][i] / M[i][i];
      for (let j = i; j < n; j++) {
        M[k][j] -= factor * M[i][j];
      }
      x[k] -= factor * x[i];
    }
  }

  // Back substitution
  const res = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = x[i];
    for (let j = i + 1; j < n; j++) {
      sum -= M[i][j] * res[j];
    }
    res[i] = sum / M[i][i];
  }

  return res;
}

export class LinearRegressionModel {
  weights: number[] = [];
  intercept: number = 0;
  featureNames: string[] = [];

  fit(
    X: number[][],
    y: number[],
    featureNames: string[],
    lambdaReg: number = 0.05
  ): void {
    this.featureNames = featureNames;
    const n = X.length;
    const p = featureNames.length;

    // Build design matrix with bias column of 1s: X_aug [n x (p + 1)]
    // Compute X_aug^T * X_aug [(p+1) x (p+1)] and X_aug^T * y [(p+1)]
    const dim = p + 1;
    const XtX: number[][] = Array.from({ length: dim }, () => new Array(dim).fill(0));
    const Xty: number[] = new Array(dim).fill(0);

    for (let i = 0; i < n; i++) {
      const row = [...X[i], 1.0]; // bias column at index p
      const yi = y[i];

      for (let j = 0; j < dim; j++) {
        Xty[j] += row[j] * yi;
        for (let k = 0; k < dim; k++) {
          XtX[j][k] += row[j] * row[k];
        }
      }
    }

    // Add Ridge L2 regularization to diagonal (skip bias at index p)
    for (let j = 0; j < p; j++) {
      XtX[j][j] += lambdaReg * n;
    }

    const sol = solveLinearSystem(XtX, Xty);
    this.weights = sol.slice(0, p);
    this.intercept = sol[p];
  }

  predict(x: number[]): number {
    let sum = this.intercept;
    for (let i = 0; i < this.weights.length; i++) {
      sum += (this.weights[i] || 0) * (x[i] || 0);
    }
    return sum;
  }

  predictBatch(X: number[][]): number[] {
    return X.map((x) => this.predict(x));
  }

  getFeatureImportances(): FeatureImportance[] {
    const absWeights = this.weights.map((w) => Math.abs(w));
    const total = absWeights.reduce((a, b) => a + b, 0) || 1;

    return this.featureNames.map((name, i) => ({
      feature: name,
      importance: Number((absWeights[i] / total).toFixed(4)),
      coefficient: Number(this.weights[i]?.toFixed(3) ?? 0),
    })).sort((a, b) => b.importance - a.importance);
  }

  toJSON(): LinearModelData {
    return {
      weights: this.weights,
      intercept: this.intercept,
      featureNames: this.featureNames,
    };
  }

  static fromJSON(data: LinearModelData): LinearRegressionModel {
    const model = new LinearRegressionModel();
    model.weights = data.weights;
    model.intercept = data.intercept;
    model.featureNames = data.featureNames;
    return model;
  }
}
