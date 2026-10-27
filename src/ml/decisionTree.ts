/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FeatureImportance } from '../types';

export interface TreeNode {
  isLeaf: boolean;
  value: number; // predicted value (mean of node samples)
  featureIdx?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  samples: number;
}

export class DecisionTreeRegressor {
  root: TreeNode | null = null;
  maxDepth: number;
  minSamplesLeaf: number;
  featureNames: string[] = [];
  featureGainSums: number[] = [];

  constructor(maxDepth: number = 6, minSamplesLeaf: number = 3) {
    this.maxDepth = maxDepth;
    this.minSamplesLeaf = minSamplesLeaf;
  }

  fit(
    X: number[][],
    y: number[],
    featureNames: string[],
    maxFeaturesSubsample?: number
  ): void {
    this.featureNames = featureNames;
    const numFeatures = featureNames.length;
    this.featureGainSums = new Array(numFeatures).fill(0);

    const sampleIndices = Array.from({ length: X.length }, (_, i) => i);
    this.root = this.buildNode(X, y, sampleIndices, 0, maxFeaturesSubsample);
  }

  private calculateVariance(y: number[], indices: number[]): { variance: number; mean: number } {
    const n = indices.length;
    if (n === 0) return { variance: 0, mean: 0 };
    let sum = 0;
    for (let i = 0; i < n; i++) sum += y[indices[i]];
    const mean = sum / n;
    let sumSqDiff = 0;
    for (let i = 0; i < n; i++) {
      const diff = y[indices[i]] - mean;
      sumSqDiff += diff * diff;
    }
    return { variance: sumSqDiff / n, mean };
  }

  private buildNode(
    X: number[][],
    y: number[],
    indices: number[],
    depth: number,
    maxFeaturesSubsample?: number
  ): TreeNode {
    const n = indices.length;
    const { variance: currentVar, mean: currentMean } = this.calculateVariance(y, indices);

    // Stopping criteria: reached max depth, too few samples, or zero variance
    if (
      depth >= this.maxDepth ||
      n < this.minSamplesLeaf * 2 ||
      currentVar < 1e-7
    ) {
      return {
        isLeaf: true,
        value: currentMean,
        samples: n,
      };
    }

    const numFeatures = this.featureNames.length;
    let candidateFeatures = Array.from({ length: numFeatures }, (_, i) => i);

    // Random feature subspace selection (for Random Forest)
    if (maxFeaturesSubsample && maxFeaturesSubsample < numFeatures) {
      // Fisher-Yates shuffle subset
      for (let i = candidateFeatures.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidateFeatures[i], candidateFeatures[j]] = [candidateFeatures[j], candidateFeatures[i]];
      }
      candidateFeatures = candidateFeatures.slice(0, maxFeaturesSubsample);
    }

    let bestGain = -Infinity;
    let bestFeature = -1;
    let bestThreshold = 0;
    let bestLeftIndices: number[] = [];
    let bestRightIndices: number[] = [];

    const totalCurrentVarWeighted = n * currentVar;

    for (const fIdx of candidateFeatures) {
      // Extract unique sorted values for thresholds
      const vals = indices.map((idx) => X[idx][fIdx]);
      vals.sort((a, b) => a - b);

      // Evaluate up to 15 quantile thresholds to ensure fast, high-quality splits
      const numThresholds = Math.min(15, vals.length - 1);
      const step = Math.max(1, Math.floor(vals.length / (numThresholds + 1)));

      for (let s = 1; s <= numThresholds; s++) {
        const tIdx = s * step;
        if (tIdx >= vals.length) break;
        const threshold = (vals[tIdx - 1] + vals[tIdx]) / 2;

        const left: number[] = [];
        const right: number[] = [];

        for (const idx of indices) {
          if (X[idx][fIdx] <= threshold) left.push(idx);
          else right.push(idx);
        }

        if (left.length < this.minSamplesLeaf || right.length < this.minSamplesLeaf) {
          continue;
        }

        const leftVar = this.calculateVariance(y, left).variance;
        const rightVar = this.calculateVariance(y, right).variance;
        const gain = totalCurrentVarWeighted - (left.length * leftVar + right.length * rightVar);

        if (gain > bestGain) {
          bestGain = gain;
          bestFeature = fIdx;
          bestThreshold = threshold;
          bestLeftIndices = left;
          bestRightIndices = right;
        }
      }
    }

    if (bestGain <= 0 || bestFeature === -1) {
      return {
        isLeaf: true,
        value: currentMean,
        samples: n,
      };
    }

    // Accumulate variance reduction gain for feature importance
    this.featureGainSums[bestFeature] += bestGain;

    const leftChild = this.buildNode(X, y, bestLeftIndices, depth + 1, maxFeaturesSubsample);
    const rightChild = this.buildNode(X, y, bestRightIndices, depth + 1, maxFeaturesSubsample);

    return {
      isLeaf: false,
      value: currentMean,
      featureIdx: bestFeature,
      threshold: bestThreshold,
      left: leftChild,
      right: rightChild,
      samples: n,
    };
  }

  predictSingle(x: number[]): number {
    let node = this.root;
    while (node && !node.isLeaf) {
      if (node.featureIdx === undefined || node.threshold === undefined) break;
      if (x[node.featureIdx] <= node.threshold) {
        node = node.left || null;
      } else {
        node = node.right || null;
      }
    }
    return node ? node.value : 0;
  }

  predict(X: number[][]): number[] {
    return X.map((x) => this.predictSingle(x));
  }

  getFeatureImportances(): FeatureImportance[] {
    const totalGain = this.featureGainSums.reduce((a, b) => a + b, 0) || 1;
    return this.featureNames.map((name, i) => ({
      feature: name,
      importance: Number((this.featureGainSums[i] / totalGain).toFixed(4)),
    })).sort((a, b) => b.importance - a.importance);
  }

  toJSON(): string {
    return JSON.stringify({
      root: this.root,
      maxDepth: this.maxDepth,
      minSamplesLeaf: this.minSamplesLeaf,
      featureNames: this.featureNames,
      featureGainSums: this.featureGainSums,
    });
  }

  static fromJSON(jsonStr: string): DecisionTreeRegressor {
    const data = JSON.parse(jsonStr);
    const tree = new DecisionTreeRegressor(data.maxDepth, data.minSamplesLeaf);
    tree.root = data.root;
    tree.featureNames = data.featureNames;
    tree.featureGainSums = data.featureGainSums;
    return tree;
  }
}
