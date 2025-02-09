export interface AnalysisResponse {
  AIC: number
  rSquared: number
  adjustedRsquared: number
}

export interface PredictionResult {
  size: number
  predictions: number[]
}

export interface EvaluationResult extends PredictionResult {
  mae: number
  mse: number
  histogram: Histogram
}

export interface Histogram {
  counts: number[]
  bin_edges: number[]
}

export interface TrainingResult {
  training: EvaluationResult
  validation: EvaluationResult
  testing: EvaluationResult
  prediction: PredictionResult
  model_path: string
  last_epoch: number
  histogramImg: string
}
