# Changelog

## Unreleased

### Destination GAS grosses up on the destination cost

The destination GAS was grossing up on the cost *after* routing, so CLAT
earned margin on the remittance cost itself. Routing is a pass-through cost,
not a base to earn margin on.

The destination GAS is the node's margin on its destination cost, so it now
grosses up on the CLAT Destination Cost and routing is added afterwards with
nothing on top:

    dgGAS  = dc / (1 − dg) − dc
    preTax = dc + routing + dgGAS

Checked node by node against the reference sheet at source GAS 6.8125%,
routing 7% and destination GAS 10% on a 170-day co-term: Vendor TCV
11,910.60, Source GAS 870.73, CLAT Local 12,781.33, Routing 894.69, Dest GAS
1,420.15, Partner 15,096.17 — every figure to the cent. Routing was already
correct, a flat percentage of the destination cost rather than a gross-up.

Partner prices drop on every deal with a non-zero routing factor, by the
margin that was being charged on the remittance cost. The larger the routing
factor the larger the drop, so Brazil and Argentina move most. Deals with
routing at 0 are unaffected.

The reverse solve from a target partner price uses the same algebra:
`dc = preTax / (1 + routing + dg/(1 − dg))`.

### Co-term deals run on the contract value, not an annualized one

On a 170-day co-term the waterfall was annualizing everything: Vendor ACV
$25,572.76 against a Vendor TCV of $11,910.60, and a Source GAS ACV of
$1,868.57 against a Source GAS TCV of $870.29.

Commissions are calculated on the Source GAS on an ACV basis, so that
inflated the commission base by 2.15× over the margin the deal actually
earns. There is no annual version of a 170-day contract to project; the
contract is what it is.

When the term is under a year the whole waterfall now runs on the contract
value and ACV equals TCV at every node — Vendor, Source GAS, Destination
Cost, Destination GAS, Partner. Unit costs are still entered annually,
because that is how vendors quote, but nothing is annualized after that.

The Term field keeps showing the real fraction and the day count, now marked
*cotérmino*, and the Vendor ACV hint says the waterfall is on contract value.

Commission bases drop on every deal shorter than a year. That is the point —
they were being paid against margin that is never collected — but it is money,
so existing short-term analyses should be reviewed. Deals of a year or more
are untouched.

### The line table footer shows both ACV and TCV

The footer only ever showed *Vendor ACV total*, the annualized figure, which
next to a vendor quote stating the period total reads as an error when both
numbers are correct and simply measure different things.

A *Vendor TCV total* column joins it, with a note marking the ACV as
annualized whenever the term is not a whole year.

### Partner ACV and Partner TCV can be entered directly

Both are now editable in the profitability detail. Entering a target partner
price solves backwards down the waterfall for what the vendor product can
cost, holding every margin fixed. Line costs are scaled proportionally,
re-annualized first on co-terms since line costs are stored annual.

The solve runs on blur or Enter rather than on each keystroke, since
recalculating against a half-typed number would leave costs at a meaningless
intermediate value. A target that does not cover the fixed costs is reported
instead of producing a negative cost.

This is the opposite direction from the line-level solve: here the partner
price is fixed and the vendor cost moves, whereas on a line the total is
fixed and that line's unit cost moves.

## Contract term is derived from the line dates

The term was an integer number of years floored at 1, so a contract running
15 Jul 2026 to 1 Jan 2027 was priced as a full year and its TCV came out at
$25,560 against the vendor's $11,910.60 — more than double.

Vendors quote an *annual* price per unit and bill the portion of the year the
contract actually covers. The term now follows that model: it is derived from
the line dates as `days / 365` and carries a fraction. Each line prorates on
its own dates, so lines with different coverage no longer share one term.

The Term field becomes read-only and shows the derived value and the day
count. It stays editable only when no line carries dates.

This changes figures on existing analyses whose lines do not span whole
years, always downward, because those were previously priced as if they ran a
full year. Note that a three-year span crossing a leap year computes as 3.0027
rather than 3, a 0.09% difference from the old integer term.

### Line totals can be entered directly

Total ACV and Total TCV are now editable per line. Entering either one solves
for the annual unit cost:

    cost = ACV / qty
    cost = TCV / (qty × line term)

Proration on `days / 365` lands within 0.05% of the vendor's own figure but
not on it exactly, and one sample is not enough to recover their rounding
convention. Entering the total from the quote closes that gap to the cent.

### Quantity column no longer truncates

The quantity column was 6% wide and cut a four-digit value down to its first
digit — 600 read as 6 while the total underneath was correct, which is worse
than a wrong number because it looks right. Widened to 9%, taking the space
from SKU and the two date columns.

## 2026-08-30

Initial commit. Everything below predates version control and is recorded here
so the first tagged state is documented; from this point on each change should
arrive as its own pull request.

### Rounding

- Unit prices are always rounded up to two decimals. The optional
  *Redondear precios* toggle and the `roundPrices` field are gone.
- The profitability waterfall is now recomputed **from** the rounded line
  prices instead of forcing the lines to reconcile against an unrounded
  partner price. `unit × qty × term` now matches Partner ACV and Partner TCV
  exactly, and the *Ajuste de redondeo* row has been removed from the detail
  table, the PDF and the PDF summary.
- The cent delta from rounding up is absorbed by the destination GAS, the last
  node in the waterfall. Rounding up can only increase it, so margin cannot go
  negative.
- `CEIL2` corrects for floating-point noise before rounding, so a product such
  as `3.0000000000000004` no longer rounds up to `3.01`.

### External links

- New `hubspotUrl` and `sharepointUrl` fields on the record, rendered by a
  shared engine driven by `LINK_FIELDS`. Empty shows an input and a save
  button; once saved, only a button that opens the link, plus an edit button.
- Saving validates the URL scheme and writes through to SharePoint
  immediately rather than waiting for autosave.
- Validated analyses show the links read-only, and an em dash where no link was
  ever set. Edit controls carry `no-print` so they stay out of the PDF.

### Commissions

- New per-role `<role>Rate` override, expressed as a percentage. Empty falls
  back to the role's standard rate, so existing records are unaffected.
- `fernando@connect.lat` can edit either the percentage or the amount on a
  draft analysis; editing the amount solves for the percentage against
  `factor × base`. Overridden rates are highlighted.
- Everyone else, and every validated analysis, sees the effective rate
  read-only. Totals, the percentage-of-base figure and the PDF all use the
  effective rate rather than the nominal one.

### Dates and payment terms

- Contract end, invoice date and payment date are now editable, each falling
  back to its derived value when left empty.
- Payment terms became an output: days from contract start to payment, and days
  from invoice to payment, both shown and both in the PDF. A negative span is
  flagged in red. `payTerms` is kept in sync on the record for backwards
  compatibility.

### Local currency

- FX rate, spread and FX date are now editable from the profitability detail as
  well as from the local currency section, for Brazil, Argentina, Chile and
  Colombia. Both locations edit the same fields and stay in sync.
- Local-currency conversion no longer depends on the quote currency. A Brazilian
  deal quoted in USD now shows its BRL equivalent — in the profitability detail
  and in the two local-currency columns of the line table — marked as reference.
  Previously the FX was stored but nothing consumed it.
- Removed the duplicated read-only *Impuestos sobre facturación incluidos* row
  from the local currency section and from the PDF. The figure is entered and
  shown in the profitability detail.

### Hardware and shipping

- Source GAS, routing and destination GAS for shipping are all editable.
  Routing previously was not.
- Left empty, each inherits the corresponding value from the profitability
  waterfall and follows it. Filling one in decouples that node, and the hint
  shows the inherited value alongside for comparison. Existing records store
  numeric values and are therefore read as manual, so their pricing does not
  change.
