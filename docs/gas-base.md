# GAS percentages are on cost

Both GAS figures are a percentage **of the cost they sit on**:

    source GAS = vendor cost      x %
    dest GAS   = destination cost x %

That is the division the commercial team actually performs — margin over cost
— so the number they compute on a calculator is the number in the field.

Previously the fields held margin over price, `margin / (cost + margin)`. Both
express the same amount, but the field said 11.011% where dividing
1,584.68 by 12,807.10 gives 12.3734%, and that gap cost more explaining than
the convention was worth.

## Conversion between the two

    on cost  = margin / (1 - margin)
    margin   = on cost / (1 + on cost)

10% margin is 11.1111% on cost. 5% margin is 5.2632%.

## What moved with it

Country defaults were re-expressed so they demand the same as before:
Argentina, Chile and Colombia 11.1111%, Brazil 5.2632%, and the source GAS
default 17.6471%. These are recommended floors, not committed prices.

The commission threshold moved to 11.1111%. It is a rule that blocks payment,
not a suggestion, so it had to be restated rather than left at 10 — leaving it
would have quietly loosened it, since 10% on cost is only 9.09% margin.

Routing was already a markup on the destination cost and did not change.

## Existing records

Analyses saved before this change hold the old base. `migrateGasBase` converts
`sourceGas`, `destGas`, `shipSrcGas` and `shipDestGas` once, on load or on
open, and marks the record with `_gasOnCost` so it never runs twice.

A record holding `destGas: 10` becomes `11.111111` and its price does not
move. Without the migration it would have been read as 10% on cost — 9.09%
margin — and the price would have dropped on its own.

## Pinning a price

Solving the destination GAS from a target sale price is now a single
division:

    dgGAS = target x (1 - included tax) - destination cost - routing
    dg    = dgGAS / destination cost

The percentage that comes back is literally margin over cost, so it matches
what anyone checking the figure will compute.

Precision is kept to six decimals rather than two. Rounding the solved
percentage would move the pinned sale price by a few cents each time it was
recalculated.
