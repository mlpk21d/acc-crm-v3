# Door Orders

The existing sidebar entry now opens `/door-orders`. Writers (admin/manager,
`invoices:write`) can create an order by uploading **two text-based PDF exports**
from the same KCD project: drawings and Door and Drawer Front Sizes. Native KCD
files and scanned PDFs are not supported. Each PDF is limited to 10 MB and 100
pages. Original PDFs are not retained; extracted source references are saved.

## Review workflow

- Click a room on the left; edit its name, door style and species on the right.
- Edit column number's associated row: type, quantity, width, height and unit
  numbers. Column numbers are derived from display order, not cabinet numbers.
- Sizes accept decimal or fractional inches. Unit numbers are comma-separated.
- Group Same Sizes combines only identical type/width/height within that room,
  sums quantities and deduplicates unit numbers. Doors always precede drawers.
- Add rows/rooms, move rows between rooms, or remove a row with confirmation.
  To split a grouped row, add a row and redistribute its quantity/unit references.
- Every imported row starts unreviewed. Editing or moving it resets its review.
  Save drafts at any point. Export requires styles/species, assigned rooms and
  reviewed rows. Save changes before downloading.
- PDF export fills the supplier template stored in the repository. Each room
  starts its own form and carries its name, door style, and species onto each
  continuation form. Each form holds 20 door rows and 20 drawer rows. The
  measurement cells include the unit numbers, for example `(70, 71)   16 1/4 x 44`.

## Parsing boundaries

List notation `2)70 2)71` means two pieces for each cabinet, not two total. The
parser verifies the total quantity and splits a shared-size row across drawing
rooms before regrouping. KCD elevation page titles identify rooms; bold numeric
cabinet labels are distinguished from regular-font dimension labels. Island and
perimeter annotations create separate finish groups. Conflicts or unmatched units
remain in **Unassigned - review**, never silently assigned to another room.
SFP/FLAT are construction labels, not definitive door/drawer types: the importer
suggests a type and requires human review, including tall flat doors.

Verified using the supplied Franklin PDFs: 80 pieces, split into Kitchen
Perimeter 39, Kitchen Island 16, Primary Bath 17, and Wet Bar 8. These are parser
checks, not approval of manufacturing dimensions.

## Deployment

1. Install the updated lockfile (`npm ci`). Node 24 is required by this project.
2. Run `npm run db:migrate` before serving the new routes. Migration
   `0026_door_orders.sql` creates the document store with creator/updater tracking,
   revision conflict detection and an updated-date listing index.
3. Build/deploy normally. Next output tracing includes the PDF.js worker and
   supplier PDF template for standalone packages. No external OCR service or
   operating-system PDF utility is required in production.

A single parameterized INSERT/UPDATE atomically stores an order. Updates require
its current revision to avoid overwriting another editor. Server actions and
API routes enforce existing invoice permissions. List queries fetch 50 records
per page. Database migration and authenticated save/reopen should be smoke-tested
against the deployment database; this environment has no configured CRM database.
