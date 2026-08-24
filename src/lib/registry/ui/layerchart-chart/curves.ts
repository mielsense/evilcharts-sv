import {
	curveBasis,
	curveBasisClosed,
	curveBasisOpen,
	curveBumpX,
	curveBumpY,
	curveLinear,
	curveLinearClosed,
	curveMonotoneX,
	curveMonotoneY,
	curveNatural,
	curveStep,
	curveStepAfter,
	curveStepBefore,
	type CurveFactory
} from 'd3-shape';

/**
 * The curve names Recharts accepts on `<Area type>` / `<Line type>`. Kept as the public
 * `curveType` union so every chart's API reads exactly as it does in the reference.
 */
export type CurveType =
	| 'basis'
	| 'basisClosed'
	| 'basisOpen'
	| 'bumpX'
	| 'bumpY'
	| 'bump'
	| 'linear'
	| 'linearClosed'
	| 'natural'
	| 'monotoneX'
	| 'monotoneY'
	| 'monotone'
	| 'step'
	| 'stepBefore'
	| 'stepAfter';

/**
 * Recharts resolves each `type` to the identically named d3-shape curve — `bump` and
 * `monotone` being the two aliases, which it maps to the X-oriented variants for the
 * default horizontal layout. LayerChart takes the d3 curve factory directly, so the
 * mapping is all that stands between the two APIs.
 */
const CURVES: Record<CurveType, CurveFactory> = {
	basis: curveBasis,
	basisClosed: curveBasisClosed as CurveFactory,
	basisOpen: curveBasisOpen as CurveFactory,
	bumpX: curveBumpX,
	bumpY: curveBumpY,
	bump: curveBumpX,
	linear: curveLinear,
	linearClosed: curveLinearClosed as CurveFactory,
	natural: curveNatural,
	monotoneX: curveMonotoneX,
	monotoneY: curveMonotoneY,
	monotone: curveMonotoneX,
	step: curveStep,
	stepBefore: curveStepBefore,
	stepAfter: curveStepAfter
};

/**
 * Resolve a Recharts `type` string to the d3-shape curve LayerChart marks expect.
 *
 * The three closed/open variants are line-only in d3's typings; they are cast to `CurveFactory`
 * because Recharts accepts them on `<Area type>` as well and behaves the same way — the closing
 * segment simply has no area counterpart.
 */
export function resolveCurve(type: CurveType | undefined): CurveFactory {
	return CURVES[type ?? 'linear'] ?? curveLinear;
}

export const CURVE_TYPES = Object.keys(CURVES) as CurveType[];
