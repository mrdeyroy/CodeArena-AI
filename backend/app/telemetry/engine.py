from __future__ import annotations

from app.schemas.schemas import TelemetryInput


class TelemetryEngine:
    """Calculates mastery and struggle scores from telemetry events."""

    # Hyperparameters
    TIME_WEIGHT = 0.15
    ATTEMPT_WEIGHT = 0.20
    HINT_WEIGHT = 0.15
    CONFIDENCE_WEIGHT = 0.20
    CORRECTNESS_WEIGHT = 0.30

    MAX_TIME = 1800  # 30 minutes cap
    MAX_ATTEMPTS = 10

    def compute_mastery(self, event: TelemetryInput) -> float:
        """Compute mastery score (0-1) from a single telemetry event."""
        time_factor = 1.0 - min(event.time_taken / self.MAX_TIME, 1.0)
        attempt_factor = 1.0 - min(event.attempts / self.MAX_ATTEMPTS, 1.0)
        hint_factor = 1.0 - min(event.hints_used / 3.0, 1.0)
        confidence_factor = (event.confidence - 1) / 4.0

        score = (
            time_factor * self.TIME_WEIGHT
            + attempt_factor * self.ATTEMPT_WEIGHT
            + hint_factor * self.HINT_WEIGHT
            + confidence_factor * self.CONFIDENCE_WEIGHT
            + (1.0 if event.correct else 0.0) * self.CORRECTNESS_WEIGHT
        )
        return round(max(0.0, min(1.0, score)), 4)

    def compute_struggle(self, event: TelemetryInput) -> float:
        """Higher means more struggle (0-1)."""
        struggle = 0.0
        if event.time_taken > 600:
            struggle += 0.25
        if event.attempts > 2:
            struggle += 0.25
        if event.hints_used > 1:
            struggle += 0.25
        if not event.correct:
            struggle += 0.25
        return round(min(1.0, struggle), 4)

    def update_mastery_ewma(
        self, current_mastery: float, new_mastery: float, alpha: float = 0.3
    ) -> float:
        """Exponentially weighted moving average to smooth mastery updates."""
        return round(alpha * new_mastery + (1 - alpha) * current_mastery, 4)


telemetry_engine = TelemetryEngine()
