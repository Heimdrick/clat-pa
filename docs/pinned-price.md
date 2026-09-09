# Pinning a sale price

The default is cost-driven. Enter a destination GAS and the Partner ACV and
TCV follow from it. Nothing below changes that.

Occasionally a partner price is agreed before the costs behind it are final.
The Partner TCV row carries a lock for that case. With a price pinned, the
sale price is the input and the destination GAS becomes the variable:

    dgGAS = target x (1 - included tax) - destination cost - routing
    dg    = 1 - dc / (dc + dgGAS)

Change the routing factor, the vendor cost or the source GAS and the price
stays where it was — the node margin absorbs the difference.

The destination margin is the right place for this to land. The vendor cost
is not negotiable at pricing time and routing is a remittance cost measured
from the corridor, so the node margin is the only figure CLAT genuinely
controls.

## The destination GAS field is never locked

Entering a destination GAS to find the partner price is the primary flow, so
the field stays editable at all times. While a price is pinned it displays
the percentage the price solved to; typing over it releases the pin and
returns to calculating from costs.

Whichever value was entered last is the one driving the analysis. There is
nothing to remember to switch off.

## Worked example

Price pinned at 15,096.17 on a destination cost of 12,781.33:

| Routing | Routing amount | Dest GAS | Partner TCV |
| --- | --- | --- | --- |
| 5.50% | 702.97 | 11.1988% | 15,096.17 |
| 7.00% | 894.69 | 10.0000% | 15,096.17 |
| 10.00% | 1,278.13 | 7.5026% | 15,096.17 |

The margin rises as routing falls: what is no longer spent on the remittance
stays with the node. Raising the vendor cost by 10% compresses the
destination GAS to 1.84% and still holds the price.

When cost plus routing exceeds the pinned price there is no margin left to
give. The pin releases and the row flags it rather than producing a negative
margin — that is the signal that the agreed price no longer works.

Releasing the lock keeps the destination GAS at the percentage it had solved
to, so the price does not jump on release.

The pin is stored on the record as `targetTCV` and survives closing and
reopening the analysis. It is empty by default.
