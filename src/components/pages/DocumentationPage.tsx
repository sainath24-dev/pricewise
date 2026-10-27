/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  ShieldAlert,
  Users,
} from 'lucide-react';

export const DocumentationPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* University Synopsis Title Banner */}
      <div className="kraken-card p-6 md:p-8">
        <div className="flex flex-col items-center text-center space-y-3 border-b border-[#dedee5] pb-6">
          <div className="rounded-2xl border border-[#2b2d35] bg-[#18191c] p-2 shadow-md flex items-center justify-center mb-1">
            <img
              src="/logo.png"
              alt="PriceWise Official Logo"
              className="h-16 w-auto object-contain"
            />
          </div>
          <div className="inline-flex items-center gap-2 rounded-[8px] bg-[rgba(133,91,251,0.12)] px-3 py-1 font-semibold text-xs text-[#7132f5]">
            <GraduationCap className="h-4 w-4 text-[#7132f5]" />
            <span>VISVESVARAYA TECHNOLOGICAL UNIVERSITY BELAGAVI-590 014</span>
          </div>
          <h2 className="text-2xl font-bold tracking-[-0.5px] text-[#101114]">
            A Project (Phase-1) Synopsis Report
          </h2>
          <p className="text-base font-bold text-[#7132f5]">
            “Machine Learning–Based Dynamic Pricing Model for E-Commerce”
          </p>
          <p className="text-xs text-[#686b82]">
            Submitted in partial fulfillment of the requirements for Bachelor of Engineering in Computer Science & Engineering
          </p>
          <p className="text-xs font-semibold text-[#101114]">
            Lingaraj Appa Engineering College • Gornalli, Bidar - 585403 (2026–27)
          </p>
        </div>

        {/* Credentials Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
          <div className="rounded-[12px] bg-white p-4 border border-[#dedee5]">
            <h4 className="font-bold text-[#101114] mb-2.5 flex items-center gap-1.5 text-sm">
              <Users className="h-4 w-4 text-[#7132f5]" />
              <span>Student Project Authors</span>
            </h4>
            <ul className="space-y-1.5 font-mono text-[#101114]">
              <li className="flex justify-between py-0.5 border-b border-[#dedee5]/40">
                <span>Channaveer</span>
                <span className="text-[#686b82]">3LA22CS014</span>
              </li>
              <li className="flex justify-between py-0.5 border-b border-[#dedee5]/40">
                <span>Abhishek</span>
                <span className="text-[#686b82]">3LA23CS005</span>
              </li>
              <li className="flex justify-between py-0.5 border-b border-[#dedee5]/40">
                <span>Avishkar</span>
                <span className="text-[#686b82]">3LA23CS019</span>
              </li>
              <li className="flex justify-between py-0.5">
                <span>Pavan</span>
                <span className="text-[#686b82]">3LA23CS060</span>
              </li>
            </ul>
          </div>

          <div className="rounded-[12px] bg-white p-4 border border-[#dedee5]">
            <h4 className="font-bold text-[#101114] mb-2.5 flex items-center gap-1.5 text-sm">
              <Award className="h-4 w-4 text-[#7132f5]" />
              <span>Faculty Mentorship & Guidance</span>
            </h4>
            <div className="space-y-3 text-[#101114]">
              <div>
                <p className="font-bold text-sm text-[#101114]">Dr. Sripal Reddy</p>
                <p className="text-[#686b82] text-xs">Project Guide</p>
              </div>
              <div className="pt-2 border-t border-[#dedee5]">
                <p className="font-bold text-sm text-[#101114]">Dr. Shilpa Harnale</p>
                <p className="text-[#686b82] text-xs">Project Co-ordinator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Multi-Phase Methodology */}
      <div className="kraken-card p-6 md:p-8 space-y-5">
        <div>
          <h3 className="text-xl font-bold tracking-[-0.5px] text-[#101114]">
            Structured Multi-Phase Methodology (Phases 1–6)
          </h3>
          <p className="text-xs text-[#686b82] mt-0.5">
            Architecture and deliverables as specified in the VTU curriculum
          </p>
        </div>

        <div className="space-y-3 text-xs text-[#686b82]">
          <div className="rounded-[12px] border border-[#dedee5] bg-white p-4 space-y-1">
            <span className="badge-neutral font-mono font-bold text-[#7132f5]">PHASE 1</span>
            <h4 className="font-bold text-[#101114] text-sm">Problem Analysis & Planning</h4>
            <p className="leading-relaxed">
              Analyzed how static prices cause margin losses and cart abandonment on platforms like Amazon and Flipkart. Formulated supervised dynamic pricing models.
            </p>
          </div>

          <div className="rounded-[12px] border border-[#dedee5] bg-white p-4 space-y-1">
            <span className="badge-neutral font-mono font-bold text-[#7132f5]">PHASE 2</span>
            <h4 className="font-bold text-[#101114] text-sm">Data Collection & Cleaning</h4>
            <p className="leading-relaxed">
              Handled missing numerical and categorical values, filtered negative stock or demand values, and validated schema integrity.
            </p>
          </div>

          <div className="rounded-[12px] border border-[#dedee5] bg-white p-4 space-y-1">
            <span className="badge-neutral font-mono font-bold text-[#7132f5]">PHASE 3</span>
            <h4 className="font-bold text-[#101114] text-sm">Feature Engineering</h4>
            <p className="leading-relaxed">
              Derived critical microeconomic ratios: Demand-to-Stock Ratio (demand / (stock + 1)), Competitor Price Difference, Competitor Ratio, and Seasonal Multipliers.
            </p>
          </div>

          <div className="rounded-[12px] border border-[#dedee5] bg-white p-4 space-y-1">
            <span className="badge-neutral font-mono font-bold text-[#7132f5]">PHASE 4</span>
            <h4 className="font-bold text-[#101114] text-sm">Model Development</h4>
            <p className="leading-relaxed">
              Split dataset 80% train / 20% test. Implemented Linear Regression (Ridge OLS), Decision Tree Regressor (variance reduction), and Random Forest Regressor.
            </p>
          </div>

          <div className="rounded-[12px] border border-[#dedee5] bg-white p-4 space-y-1">
            <span className="badge-neutral font-mono font-bold text-[#7132f5]">PHASE 5</span>
            <h4 className="font-bold text-[#101114] text-sm">Model Evaluation</h4>
            <p className="leading-relaxed">
              Evaluated models strictly on the held-out test split using MAE, RMSE, and R² scores. Visualized predictions with scatter plots and residual distributions.
            </p>
          </div>

          <div className="rounded-[12px] border border-[#dedee5] bg-white p-4 space-y-1">
            <span className="badge-neutral font-mono font-bold text-[#7132f5]">PHASE 6</span>
            <h4 className="font-bold text-[#101114] text-sm">Demonstration & Storefront</h4>
            <p className="leading-relaxed">
              Deployed interactive price calculator and live e-commerce catalog showcasing real-time dynamic pricing badges and simulated checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
