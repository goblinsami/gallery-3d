# Lighting Summary (Low Token)

- Implemented lighting modes:
  - `day`: soft, readable, balanced
  - `contrast`: darker, moodier, deeper fog
- Lighting stack:
  - ambient + hemisphere + directional
  - optional ceiling spots
  - optional artwork backlight
- Atmosphere:
  - fog contributes depth and mood
  - white-loop blends background/fog toward white during loop transition
- Guardrails:
  - avoid flat lighting
  - avoid overexposure
  - keep artwork legibility primary
