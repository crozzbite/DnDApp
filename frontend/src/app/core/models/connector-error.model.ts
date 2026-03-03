export interface ConnectorError {
  source: string;
  status: number;
  message: string;
  isRetryable: boolean;
  timestamp: string;
}
