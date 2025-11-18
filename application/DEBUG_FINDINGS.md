# 404 Page Glass Transparency Debug Findings

## What Works ✅
- Basic transparency (`meshBasicMaterial` with `opacity`) - Text shows through
- `meshPhysicalMaterial` without transmission - Visible and transparent
- Text rendering at z=-0.1 (behind shards)
- Float animation
- GLB model loading

## What Doesn't Work ❌
- `MeshTransmissionMaterial` from @react-three/drei - Glass appears opaque/black
- `meshPhysicalMaterial` with `transmission={1}` - Shards disappear entirely
- Chromatic aberration effect on white background

## Technical Issues Identified
1. **Transmission materials fail on white backgrounds**
   - Designed for dark backgrounds where refraction is visible
   - On white, the transmission buffer might not capture content properly

2. **Version compatibility**
   - Using React 19 RC + React Three Fiber v9 RC
   - Original uses React 18 + React Three Fiber v8
   - Transmission behavior may have changed between versions

3. **Environment affects visibility**
   - "city" environment makes glass black on white
   - "apartment"/"studio" slightly better but still issues

## Current Workaround
Using `meshPhysicalMaterial` with:
- `transparent={true}`
- `opacity={0.2}`
- `clearcoat={1}` for glass-like shine
- NO transmission property

This gives transparent glass but lacks the chromatic aberration (rainbow) effect from the original.

## Root Cause
The transmission effect (which creates realistic glass refraction) is incompatible with our white background + React Three Fiber v9 setup. The transmission buffer system that captures what's behind the glass doesn't work properly in this configuration.