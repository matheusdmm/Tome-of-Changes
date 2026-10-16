# Open5e fixtures

Retrieved on 2026-10-16 from `https://api.open5e.com/v2/`.

`open5e.json` preserves both SRD source records for Counterspell (`spells`), Aboleth (`creatures`), Elf (`species`), Grappler (`feats`), and Bag of Holding (`magicitems`), plus the Blinded `conditions` record. Requests use `name__iexact` and, except conditions, `document__key__in=srd-2014` or `srd-2024`.

Keep these fixtures static so a provider update cannot silently rewrite expected behavior. To refresh, inspect changes and source identity, then update tests intentionally. Synthetic malformed/outage/duplicate/renamed records in the tests are explicitly separate from these captured responses.

Rules attribution and license references: [Sources and attribution](../../../views/AttributionView.vue). API reference: [Open5e documentation](https://open5e.com/api-docs/).
