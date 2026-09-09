# Commission eligibility

Commissions require a source margin of at least 10% ACV. Below that the
roles still show, the rates still show, and every amount is zero.

`fernando@connect.lat` can lift the floor for a single analysis. When the
margin is below the minimum the warning carries an *habilitar igual*
checkbox, visible only to him. Everyone else sees the warning and cannot act
on it.

With the exception applied, commissions calculate normally against the source
margin — the same base, the same role rates, the same deal-type factor. Only
the eligibility gate is bypassed.

The exception is stored on the record as `commOverride` and is deliberately
per-deal. There is no global switch: a low-margin deal that still warrants
commissions is a judgement call about that deal, and it should have to be
made again next time rather than quietly becoming the default.

It is visible wherever eligibility is: the warning changes to *Comisiones
habilitadas por excepción*, the commissions KPI is tagged *excepción*, and
the PDF prints the exception rather than the blocking message. An analysis
paying commissions below the floor cannot look like an ordinary one.

# Local currency conversion

The FX block appears for Brazil, Argentina, Chile and Colombia, and it can be
switched off per analysis with the *Calcular conversión a moneda local*
checkbox.

Switching it off hides the rate, the spread, the rate date, the resulting
local price and the two local-currency columns in the line table. It changes
nothing about the pricing — the conversion is presentational, and on a deal
quoted and invoiced in USD it is noise on the screen.

Stored as `fxOn`. Records saved before this existed are read as enabled.
