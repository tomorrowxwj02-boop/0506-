import { useState, useCallback } from 'react';
import type { Shipment } from '@/types/shipment';

export function useBatchSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);

  const submitBatch = useCallback(async (shipments: Shipment[]) => {
    setIsSubmitting(true);
    const batchId = crypto.randomUUID();

    const batchSize = 100;
    const batches = [];
    for (let i = 0; i < shipments.length; i += batchSize) {
      batches.push(shipments.slice(i, i + batchSize));
    }

    let successCount = 0;
    let failCount = 0;
    const errors: any[] = [];

    for (let i = 0; i < batches.length; i++) {
      const result = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipments: batches[i], batchId })
      });
      const data = await result.json();
      successCount += data.success;
      failCount += data.failed;
      errors.push(...data.errors);
      setSubmitProgress(((i + 1) / batches.length) * 100);
    }

    setIsSubmitting(false);
    setSubmitProgress(0);
    return { success: successCount, failed: failCount, errors };
  }, []);

  return { submitBatch, isSubmitting, submitProgress };
}
