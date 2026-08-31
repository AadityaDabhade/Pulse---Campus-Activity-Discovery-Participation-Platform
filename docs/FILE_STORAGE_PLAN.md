# File Storage Plan

## Current State: No Real File Storage

Pulse has **no file upload backend, no object storage, and no durable file persistence of any kind.** Every file-handling interaction in the app today uses the browser's [`URL.createObjectURL()`](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static) API, which creates a **temporary, in-memory, tab-scoped reference** to a locally-selected file. This is not upload — nothing leaves the browser.

## Where Files Are Used Today

| Feature | Component | File input constraints today | What's stored |
|---|---|---|---|
| Profile photo | `profile.index.tsx`, `profile.edit.tsx`, `host.verify.tsx` | `accept="image/*"`, single file, gallery picker or camera capture (`capture="user"`) | `photo: URL.createObjectURL(file)` on the `Profile` object |
| Activity documents/materials | `FileAttachList.tsx` (used in `activity.new.tsx`, `activity.manage.$id.tsx`, read-only in `activity.view.$id.tsx`) | `multiple`, any file type accepted; client infers `kind` from MIME type: `image` (starts with `image/`), `pdf` (`application/pdf`), else generic `file`. A `link` kind exists in the type definition but has **no UI path to create one** today | `StoredDoc { id, name, kind, url: URL.createObjectURL(file) }` |
| Activity photo gallery (completed activities only) | `PhotoGallery.tsx` (used in `activity.manage.$id.tsx`, read-only in `activity.view.$id.tsx`) | `accept="image/*"`, `multiple`, host-only upload (`canUpload` prop) | `StoredPhoto { id, url: URL.createObjectURL(file) }` |

## Why This Doesn't Work As a Real Product

- **Blob URLs are not durable.** They are invalidated the moment the tab/page is reloaded or closed — meaning uploaded documents/photos/profile pictures currently **disappear on every refresh** in practice (though `localStorage` still holds the now-broken URL string until overwritten).
- **Nothing is actually transmitted anywhere.** There is no upload request, no server endpoint, no object storage bucket — the "storage" is entirely local browser memory.
- **No file is shared between users.** Since nothing leaves the browser, a document uploaded by a host is never actually visible to a participant on a different device — the current multi-user simulation doesn't surface this because all flows are tested by one user acting as both host and participant in the same browser.

## Requirements for a Real Implementation

1. **Object storage backend** to durably persist uploaded files. Specific provider is **TBD** (commonly S3-compatible storage, e.g. AWS S3, Cloudflare R2, Supabase Storage, etc. — given the Nitro/Cloudflare deployment target noted in [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md), Cloudflare R2 may be a natural fit, but this is **not a decision made by this document**).
2. **Real upload flow**: client selects a file → uploads to a backend endpoint or a pre-signed URL → backend/storage returns a durable, stable URL → that URL (not a blob URL) is what gets persisted in the `activity_documents`/`activity_photos`/`users.photo_url` records described in [DATABASE_REQUIREMENTS.md](./DATABASE_REQUIREMENTS.md).
3. **File type/size limits.** The current frontend has **no size limit enforcement at all** and only loosely infers type from MIME — a real implementation needs explicit, enforced constraints:
   - Max file size per upload — **TBD**.
   - Allowed MIME types / extensions per feature (profile photo: images only, as today; documents: what range of types should actually be allowed — PDFs, Office docs, images, arbitrary files? — **TBD**, current UI's `file`/generic fallback suggests "anything" was the prototype intent, but that's a real security/storage-cost decision, not something to inherit uncritically).
   - Max number of files per activity (documents currently unlimited; photos currently unlimited) — **TBD**.
4. **Access control on stored files.** Are activity documents/photos public-if-you-have-the-URL, or should they require an authenticated, authorized request (e.g. only participants of that specific activity can view them)? The current prototype has no concept of this since nothing is real storage yet — **TBD, and likely privacy-sensitive** given photos are of real students at real meet-ups.
5. **The `link` document kind** (`StoredDoc.kind === "link"`) exists in the type system but has **no corresponding UI** to actually add a link-type document (e.g. a Google Drive URL) — the original plan document ([.lovable/plan.md](../.lovable/plan.md)) mentions "drive-url" as an intended input type. Whether to build real link-attachment UI, or drop the `link` kind from the schema, is **TBD**.
6. **Cleanup/lifecycle**: when an activity or a document/photo is deleted, does the backing file get deleted from storage too, or retained? — **TBD**. Currently, `removeHosted()` cascades to delete the local records but there's no real file to clean up yet.
7. **Virus/content scanning** on uploads — not addressed anywhere in the current prototype; whether this is required before launch is **TBD**.
8. **Image processing** (thumbnailing/resizing for the photo gallery and profile photos) — the current UI renders full-resolution `<img>` tags directly from the blob URL with no resizing; whether a CDN/image-processing layer is needed for production is **TBD**.

## What the Frontend Already Gets Right (Preserve These Client-Side Behaviors)

- The `kind` inference logic (image vs. pdf vs. generic file) is a reasonable client-side UX pattern to keep, even once real upload exists — it should just additionally validate against server-side accepted-type rules rather than being purely cosmetic.
- The distinct read-only rendering (`FileAttachList`'s `readOnly` prop showing a clickable download link vs. an editable remove-button list) is a sound pattern to carry forward.
- Multi-file selection (`multiple` attribute) is already correctly used for documents and photos.

## Explicitly Out of Scope

This document does not select a storage provider, does not define a bucket/key naming scheme, and does not implement any upload endpoint. It is a requirements list for whoever designs the backend's file-handling layer — see [BACKEND_IMPLEMENTATION_PLAN.md](./BACKEND_IMPLEMENTATION_PLAN.md) for how this fits into a broader implementation sequence.
