"""
Valuation Engine — Converts climate risk scores into financial impact
and calculates climate-adjusted property value.

Key principles:
- Every adjustment is explainable
- Outputs are clearly labeled as model estimates
- No arbitrary discount percentages
- Resilience features reduce impact
"""
from app.schemas.property import (
    PropertyInput,
    ClimateFeatures,
    RiskScore,
    FinancialImpact,
    ValuationResult,
)
from typing import List


# ──────────────────────────────────────────────────────────────────────
# Impact calculation parameters
# These are based on research literature and insurance industry
# estimates for climate risk on property values.
# Clearly labeled as PROTOTYPE ESTIMATES.
# ──────────────────────────────────────────────────────────────────────

# Maximum possible impact percentage per hazard
# (at risk score = 100, theoretical maximum reduction)
MAX_FLOOD_IMPACT_PCT = 12.0    # Up to 12% for extreme flood risk
MAX_HEAT_IMPACT_PCT = 5.0      # Up to 5% for extreme heat
MAX_CYCLONE_IMPACT_PCT = 8.0   # Up to 8% for extreme cyclone risk

# Minimum score threshold below which no financial impact is applied
MIN_IMPACT_THRESHOLD = 15.0


def _calculate_hazard_impact(
    risk_score: RiskScore,
    base_value: float,
    max_impact_pct: float,
    property_input: PropertyInput,
) -> FinancialImpact:
    """
    Calculate financial impact for a single hazard.

    The impact follows a non-linear curve:
    - Below threshold: no impact
    - 15-40: gradual increase (property markets partially price in moderate risk)
    - 40-70: steeper increase (significant market discount)
    - 70-100: severe impact (high-risk areas see major value adjustments)

    Resilience features reduce the impact.
    """
    hazard = risk_score.hazard
    score = risk_score.score

    if score < MIN_IMPACT_THRESHOLD:
        return FinancialImpact(
            hazard=hazard,
            impact_inr=0,
            impact_percentage=0,
            explanation=f"{hazard.title()} risk is low — no significant financial impact expected."
        )

    # Non-linear impact curve
    normalized = (score - MIN_IMPACT_THRESHOLD) / (100 - MIN_IMPACT_THRESHOLD)

    # Quadratic curve — higher scores have disproportionate impact
    impact_pct = max_impact_pct * (normalized ** 1.5)

    # Apply resilience reductions
    resilience_factor = 1.0

    if hazard == "flood":
        if property_input.flood_protection:
            resilience_factor -= 0.30  # Flood protection reduces 30%
        if property_input.has_basement:
            resilience_factor += 0.10  # Basement increases flood vulnerability
        if property_input.building_age and property_input.building_age > 30:
            resilience_factor += 0.10  # Older buildings more vulnerable

    elif hazard == "heat":
        if property_input.cool_roof:
            resilience_factor -= 0.25  # Cool roof reduces heat impact
        if property_input.building_age and property_input.building_age > 25:
            resilience_factor += 0.05  # Older buildings less efficient

    elif hazard == "cyclone":
        if property_input.storm_resistant:
            resilience_factor -= 0.35  # Storm-resistant construction helps significantly
        if property_input.num_floors and property_input.num_floors > 3:
            resilience_factor += 0.05  # Taller buildings slightly more wind-exposed

    resilience_factor = max(0.2, min(1.5, resilience_factor))
    impact_pct *= resilience_factor
    impact_pct = min(impact_pct, max_impact_pct)

    impact_inr = base_value * (impact_pct / 100)

    # Build explanation
    category = risk_score.category
    top_drivers = risk_score.drivers[:3]
    driver_texts = [f"{d.factor.lower()} ({d.value})" for d in top_drivers]
    driver_str = ", ".join(driver_texts)

    explanation = (
        f"{hazard.title()} risk is {category} (score: {score:.0f}/100). "
        f"Key factors: {driver_str}. "
        f"Estimated value impact: {impact_pct:.1f}% "
        f"(₹{impact_inr:,.0f})."
    )

    if resilience_factor < 1.0:
        explanation += " Resilience features applied."

    return FinancialImpact(
        hazard=hazard,
        impact_inr=round(impact_inr),
        impact_percentage=round(impact_pct, 2),
        explanation=explanation
    )


def calculate_valuation(
    property_input: PropertyInput,
    climate_features: ClimateFeatures,
    risk_scores: List[RiskScore],
    market_rate: float,
) -> ValuationResult:
    """
    Calculate complete climate-adjusted property valuation.

    Process:
    1. Calculate base value from area × market rate
    2. Calculate financial impact for each hazard
    3. Sum total climate impact
    4. Subtract from base value to get adjusted value
    """
    # Base value
    rate = property_input.market_rate_per_sqft or market_rate
    base_value = property_input.area_sqft * rate

    # Calculate impact per hazard
    risk_map = {r.hazard: r for r in risk_scores}

    flood_impact = _calculate_hazard_impact(
        risk_map.get("flood", risk_scores[0]),
        base_value,
        MAX_FLOOD_IMPACT_PCT,
        property_input,
    )

    heat_impact = _calculate_hazard_impact(
        risk_map.get("heat", risk_scores[1]),
        base_value,
        MAX_HEAT_IMPACT_PCT,
        property_input,
    )

    cyclone_impact = _calculate_hazard_impact(
        risk_map.get("cyclone", risk_scores[2]),
        base_value,
        MAX_CYCLONE_IMPACT_PCT,
        property_input,
    )

    total_impact = flood_impact.impact_inr + heat_impact.impact_inr + cyclone_impact.impact_inr
    total_pct = (total_impact / base_value * 100) if base_value > 0 else 0
    adjusted_value = base_value - total_impact

    return ValuationResult(
        base_value_inr=round(base_value),
        flood_impact=flood_impact,
        heat_impact=heat_impact,
        cyclone_impact=cyclone_impact,
        total_climate_impact_inr=round(total_impact),
        total_climate_impact_percentage=round(total_pct, 2),
        adjusted_value_inr=round(adjusted_value),
    )
