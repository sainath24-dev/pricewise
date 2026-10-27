/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FeatureImportance } from '../types';
import { DecisionTreeRegressor } from './decisionTree';

export class RandomForestRegressor {
  trees: DecisionTreeRegressor[] = [];
  nEstimators: number;
  maxDepth: number;
  minSamplesLeaf: number;
  featureNames: string[] = [];

  constructor(
    nEstimators: number = 20,
    maxDepth: number = 6,
    minSamplesLeaf: number = 2
  ) {
    this.nEstimators = nEstimators;
    this.maxDepth = maxDepth;
    this.minSamplesLeaf = minSamplesLeaf;
  }

  fit(X: number[][], y: number[], featureNames: string[]): void {
    this.featureNames = featureNames;
    this.trees = [];

    const n = X.length;
    const p = featureNames.length;
    // Standard random forest feature sub-sampling rule: max(2, floor(sqrt(p)) + 1)
    const maxFeatures = Math.max(2, Math.floor(Math.sqrt(p)) + 1);

    for (let b = 0; b < this.nEstimators; b++) {
      // Bootstrap sampling with replacement
      const bootIndices: number[] = [];
      for (let i = 0; i < n; i++) {
        bootIndices.push(Math.floor(Math.random() * n));
      }

      const bootX = bootIndices.map((idx) => X[idx]);
      const bootY = bootIndices.map((idx) => y[idx]);

      const tree = new DecisionTreeRegressor(this.maxDepth, this.minSamplesLeaf);
      tree.fit(bootX, bootY, featureNames, maxFeatures);
      this.trees.push(tree);
    }
  }

  predictSingle(x: number[]): { prediction: number; stdDev: number } {
    if (this.trees.length === 0) return { prediction: 0, stdDev: 0 };
    const treePreds = this.trees.map((t) => t.predictSingle(x));
    const mean = treePreds.reduce((a, b) => a + b, 0) / treePreds.length;

    const sqDiffs = treePreds.reduce((acc, p) => acc + (p - mean) * (p - mean), 0);
    const stdDev = Math.sqrt(sqDiffs / treePreds.length);

    return { prediction: mean, stdDev };
  }

  predict(X: number[][]): number[] {
    return X.map((x) => this.predictSingle(x).prediction);
  }

  getFeatureImportances(): FeatureImportance[] {
    const numFeatures = this.featureNames.length;
    const totalGains = new Array(numFeatures).fill(0);

    for (const tree of this.trees) {
      for (let j = 0; j < numFeatures; j++) {
        totalGains[j] += tree.featureGainSums[j] || 0;
      }
    }

    const grandTotal = totalGains.reduce((a, b) => a + b, 0) || 1;
    return this.featureNames.map((name, i) => ({
      feature: name,
      importance: Number((totalGains[i] / grandTotal).toFixed(4)),
    })).sort((a, b) => b.importance - a.importance);
  }

  toJSON(): string {
    return JSON.stringify({
      nEstimators: this.nEstimators,
      maxDepth: this.maxDepth,
      minSamplesLeaf: this.minSamplesLeaf,
      featureNames: this.featureNames,
      trees: this.trees.map((t) => t.toJSON()),
    });
  }

  static fromJSON(jsonStr: string): RandomForestRegressor {
    const data = JSON.parse(jsonStr);
    const forest = new RandomForestRegressor(
      data.nEstimators,
      data.maxDepth,
      data.minSamplesLeaf
    );
    forest.featureNames = data.featureNames;
    forest.trees = data.trees.map((tStr: string) => DecisionTreeRegressor.fromJSON(tStr));
    return forest;
  }
}
