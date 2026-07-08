'use client';

import React from 'react';

export interface StepItem {
  title: string;
  description: string;
}

export interface StepsListProps {
  steps: StepItem[];
}

export function StepsList({ steps }: StepsListProps) {
  return (
    <div className="steps-list">
      {steps.map((step, index) => (
        <div key={index} className="step-item">
          <span className="step-number">{index + 1}</span>
          <div className="step-content">
            <h4 className="step-title">{step.title}</h4>
            <p className="step-desc">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
