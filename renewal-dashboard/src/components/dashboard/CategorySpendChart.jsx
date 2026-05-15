import { useMemo } from 'react';
import { useRenewal } from '../../context/RenewalContext';
import { formatCurrency } from '../../utils/renewalUtils';
import { SkeletonLine } from '../ui/Skeleton';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Fixed 5-color palette for the donut chart slices */
const PALETTE = [
  { fill: '#2563eb', label: 'Blue'   }, // accent blue
  { fill: '#16a34a', label: 'Green'  }, // status-active green
  { fill: '#d97706', label: 'Amber'  }, // status-due-soon amber
  { fill: '#9333ea', label: 'Purple' }, // purple
  { fill: '#db2777', label: 'Pink'   }, // pink
];

const DONUT_SIZE   = 160; // SVG viewport size (px)
const DONUT_CX     = DONUT_SIZE / 2;
const DONUT_CY     = DONUT_SIZE / 2;
const DONUT_R      = 60;  // outer radius
const DONUT_INNER  = 36;  // inner radius (hole)
const GAP_ANGLE    = 1.5; // degrees gap between slices

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert polar coordinates to Cartesian.
 * @param {number} cx - center x
 * @param {number} cy - center y
 * @param {number} r  - radius
 * @param {number} angleDeg - angle in degrees (0 = top, clockwise)
 */
function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

/**
 * Build an SVG arc path for a donut slice.
 * @param {number} cx - center x
 * @param {number} cy - center y
 * @param {number} outerR - outer radius
 * @param {number} innerR - inner radius
 * @param {number} startAngle - start angle in degrees
 * @param {number} endAngle   - end angle in degrees
 */
function buildArcPath(cx, cy, outerR, innerR, startAngle, endAngle) {
  const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
  const outerEnd   = polarToCartesian(cx, cy, outerR, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
  const innerEnd   = polarToCartesian(cx, cy, innerR, startAngle);

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ');
}

/**
 * Compute annual cost for a single renewal.
 */
function annualCost(renewal) {
  const amount = renewal.amount ?? 0;
  const cycle  = renewal.billingCycle ?? renewal.billing_cycle ?? 'monthly';
  const custom = renewal.customCycleDays ?? renewal.custom_cycle_days ?? 30;
  switch (cycle) {
    case 'yearly':    return amount;
    case 'quarterly': return amount * 4;
    case 'custom':    return amount * (365 / Math.max(custom, 1));
    default:          return amount * 12; // monthly
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 animate-pulse" aria-hidden="true">
      {/* Donut placeholder */}
      <div
        className="rounded-full"
        style={{
          width: DONUT_SIZE,
          height: DONUT_SIZE,
          background: `conic-gradient(var(--color-surface-2) 0deg, var(--color-border) 360deg)`,
        }}
      />
      {/* Legend rows */}
      <div className="w-full space-y-2 px-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: 'var(--color-surface-2)' }}
            />
            <SkeletonLine className="h-3 flex-1" />
            <SkeletonLine className="h-3 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function NoData() {
  return (
    <div
      className="flex flex-col items-center justify-center py-8 rounded-xl border"
      style={{
        backgroundColor: 'var(--color-surface-1)',
        borderColor: 'var(--color-border)',
      }}
      role="status"
      aria-label="No category spend data"
    >
      <svg
        className="w-10 h-10 mb-3"
        style={{ color: 'var(--color-text-muted)' }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
        />
      </svg>
      <p
        className="text-[length:var(--text-sm)] leading-[var(--text-sm-lh)] font-medium"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        No spend data yet
      </p>
      <p
        className="text-[length:var(--text-xs)] leading-[var(--text-xs-lh)] mt-1"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Add renewals with categories to see the chart
      </p>
    </div>
  );
}

// ─── Donut SVG ────────────────────────────────────────────────────────────────

/**
 * Pure SVG donut chart.
 * @param {{ slices: Array<{ fill: string, startAngle: number, endAngle: number, label: string }> }} props
 */
function DonutSVG({ slices, totalLabel }) {
  return (
    <svg
      width={DONUT_SIZE}
      height={DONUT_SIZE}
      viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
      role="img"
      aria-label="Category spend donut chart"
    >
      {slices.map((slice, i) => (
        <path
          key={i}
          d={buildArcPath(
            DONUT_CX,
            DONUT_CY,
            DONUT_R,
            DONUT_INNER,
            slice.startAngle,
            slice.endAngle,
          )}
          fill={slice.fill}
          opacity={0.92}
        >
          <title>{`${slice.label}: ${slice.formattedAmount} (${slice.pct}%)`}</title>
        </path>
      ))}

      {/* Center label */}
      <text
        x={DONUT_CX}
        y={DONUT_CY - 6}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="11"
        fontWeight="600"
        fill="var(--color-text-secondary)"
      >
        Total
      </text>
      <text
        x={DONUT_CX}
        y={DONUT_CY + 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="12"
        fontWeight="700"
        fill="var(--color-text-primary)"
      >
        {totalLabel}
      </text>
    </svg>
  );
}

// ─── Legend row ───────────────────────────────────────────────────────────────

function LegendRow({ color, category, amount, pct }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {/* Color swatch */}
      <span
        className="w-2.5 h-2.5 rounded-sm shrink-0"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />

      {/* Category name */}
      <span
        className="flex-1 text-[length:var(--text-xs)] leading-[var(--text-xs-lh)] truncate"
        style={{ color: 'var(--color-text-primary)' }}
        title={category}
      >
        {category}
      </span>

      {/* Amount */}
      <span
        className="text-[length:var(--text-xs)] leading-[var(--text-xs-lh)] font-semibold tabular-nums shrink-0"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {amount}
      </span>

      {/* Percentage */}
      <span
        className="text-[length:var(--text-xs)] leading-[var(--text-xs-lh)] tabular-nums shrink-0 w-9 text-right"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {pct}%
      </span>
    </div>
  );
}

// ─── CategorySpendChart ───────────────────────────────────────────────────────

/**
 * CategorySpendChart — donut chart showing top 5 categories by annual spend.
 *
 * Reads `renewals` and `isLoading` from RenewalContext.
 * Computes annual spend per category, picks top 5, renders a pure SVG donut
 * with a legend showing category name, spend amount, and percentage.
 *
 * Requirements: 3.6
 */
export default function CategorySpendChart() {
  const { renewals, isLoading } = useRenewal();

  // ── Compute top-5 categories by annual spend ────────────────────────────
  const { slices, totalFormatted, hasData } = useMemo(() => {
    // Aggregate annual spend per category
    const spendMap = new Map();

    for (const r of renewals) {
      // Skip cancelled / archived
      if (r.status === 'cancelled' || r.status === 'archived') continue;

      const cat = r.category ?? r.category_name ?? 'Uncategorized';
      const cost = annualCost(r);
      spendMap.set(cat, (spendMap.get(cat) ?? 0) + cost);
    }

    if (spendMap.size === 0) {
      return { slices: [], totalFormatted: '$0', hasData: false };
    }

    // Sort descending, take top 5
    const sorted = [...spendMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const total = sorted.reduce((s, [, v]) => s + v, 0);

    // Build slice data with angles
    let cursor = 0;
    const builtSlices = sorted.map(([cat, spend], i) => {
      const pct     = total > 0 ? (spend / total) * 100 : 0;
      const sweep   = total > 0 ? (spend / total) * (360 - GAP_ANGLE * sorted.length) : 0;
      const start   = cursor;
      const end     = cursor + sweep;
      cursor        = end + GAP_ANGLE;

      return {
        label:           cat,
        spend,
        pct:             Math.round(pct),
        fill:            PALETTE[i].fill,
        startAngle:      start,
        endAngle:        end,
        formattedAmount: formatCurrency(spend, 'USD'),
      };
    });

    // Format total (compact for small spaces)
    const fmt = new Intl.NumberFormat('en-US', {
      style:             'currency',
      currency:          'USD',
      notation:          'compact',
      maximumFractionDigits: 1,
    });

    return {
      slices:         builtSlices,
      totalFormatted: fmt.format(total),
      hasData:        true,
    };
  }, [renewals]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section aria-labelledby="category-spend-heading">
      {/* Section header */}
      <h2
        id="category-spend-heading"
        className="text-[length:var(--text-base)] leading-[var(--text-base-lh)] font-semibold mb-4"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Spend by Category
      </h2>

      {isLoading ? (
        <ChartSkeleton />
      ) : !hasData ? (
        <NoData />
      ) : (
        <div className="flex flex-col items-center gap-4">
          {/* Donut chart */}
          <DonutSVG slices={slices} totalLabel={totalFormatted} />

          {/* Legend */}
          <div
            className="w-full space-y-2"
            role="list"
            aria-label="Category spend legend"
          >
            {slices.map((slice, i) => (
              <div key={i} role="listitem">
                <LegendRow
                  color={slice.fill}
                  category={slice.label}
                  amount={slice.formattedAmount}
                  pct={slice.pct}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
