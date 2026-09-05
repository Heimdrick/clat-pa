# Analysis ids

The id of an analysis is the name of its file in SharePoint. Two analyses
with the same id are the same file, and the second one written wins. It is a
PUT, not a delete, so the loser never reaches the recycle bin and nothing
reports that anything happened.

## What went wrong

`nextId` counted records instead of taking the highest:

    const n = records.filter(r => r.id.includes('-'+ym+'-')).length + 1;

With 16 records it returned 017 while `PA-AR-2608-017` and `PA-PE-2608-017`
already existed. Worse, deleting any analysis lowered the count, so the next
one created reused a live number and overwrote it.

That is the origin of the gaps in the sequence — 001, 004, 006, 012, 015 —
and of the duplicated numbers. Duplicates only survived when the two analyses
belonged to different countries, because the country code is part of the
filename. Same-country collisions overwrote silently.

## What changed

The sequence is now the highest existing number plus one, and freed numbers
are never reused. Deleting an analysis burns its number deliberately: reusing
it would point a new file at a name that signed PDFs and HubSpot links may
still refer to.

Creating or duplicating reserves the id through `reserveId`, which queries
SharePoint before assigning rather than trusting the in-memory list. A record
that failed to load can no longer cause its number to be handed out again.

Changing the country keeps the sequence number and swaps only the two letters.
Asking for a fresh id there was another path to collision.

`loadAll` reports records it could not read instead of dropping them into an
empty catch. A short list was not just a display problem — it fed the id
generator.

## Recovering an overwritten analysis

Signed PDFs live in `PA_Registry/Signed` and are named after their content —
vendor, partner, end customer, deal type and dates — not after the id. They
survive overwrites and are the record of what was actually signed.

For the JSON itself, SharePoint keeps version history per file. Right-click
the file, open version history, and look for a version where the partner and
the amounts change abruptly: the version before that is the overwritten
analysis.
