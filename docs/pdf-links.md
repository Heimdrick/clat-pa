# External links in the PDF

The analysis carries a HubSpot deal link and a SharePoint documentation
folder link. Both appear in the exported PDF, under the deal detail.

They are rendered as PDF link annotations, not as printed URLs. A HubSpot
record URL is long, wraps across lines and is unusable on paper; what the
reader needs is somewhere to click. Two labels, *Abrir en HubSpot* and
*Abrir en SharePoint*, underlined in the brand blue.

Each label renders only when its URL parses as `http://` or `https://`, and
the whole row is skipped when neither link is set. A half-filled field cannot
produce a dead link in a signed document.
