# Rounding and the sale total

The sale total is exact. Unit prices are not rounded.

Rounding the unit price to two decimals introduces a difference that scales
with quantity: on a 600-unit line, a fraction of a cent per unit became
$5.83. That difference has to go somewhere, and every option was worse than
not creating it.

It was first absorbed into the destination GAS, which made a figure with
accounting meaning read $1,425.98 where the waterfall said $1,420.15, with
nothing on screen explaining the gap. Surfacing it as its own row was
honest but left an artifact on the analysis that had to be explained every
time.

So the unit price now carries whatever precision the total requires, shown
with up to six decimals and trailing zeros trimmed. `unit x quantity`
reproduces the total exactly and there is no residual to place.

The trade-off is real: a unit price of 25.160283 may not be presentable on a
partner quote or acceptable to billing. When the unit price has to be clean,
the total has to move by a few cents instead. Both cannot hold at once, and
the tool chooses the exact total.

# Solving from a target partner price

Entering a Partner ACV or Partner TCV solves for the **destination GAS**:

    dgGAS = target x (1 - included tax) - destination cost - routing
    dg    = 1 - dc / (dc + dgGAS)

The vendor cost and the routing factor stay fixed. The cost is not something
CLAT negotiates at pricing time and routing is a remittance cost, so the
destination margin is the only lever that genuinely belongs to the node.

A target that does not cover cost plus routing is reported rather than
producing a negative margin.
