# Stored input versus effective value

Some figures are inputs until something else takes over. The destination GAS
is the clearest case: normally it is typed, but with a sale price pinned it
becomes the solved variable.

When that happens the record still holds the last typed value while the
calculation uses a different one. `r.destGas` and `o.destGasEff` diverge, and
anything reading the record instead of the result prints a number that does
not match its own amount.

That is what the PDF did: it printed 10.00% next to $1,584.68 on a
destination cost of $12,807.10, where the amount is 11.01%. The screen showed
11.011% for the same analysis. The PDF is the document that gets signed, so
this was the worse of the two places to get it wrong.

**Anything displayed or exported reads the effective value, never the stored
input.** The same applies to the shipping node, which inherits the
destination margin: it now follows the solved percentage rather than the
stale typed one.

The pattern is not limited to the destination GAS. Commission rates behave
the same way — `rateOf(r, role)` resolves the override before use, and the
PDF total once summed nominal rates instead. Before adding a figure to a
view, check whether it has an effective form.
