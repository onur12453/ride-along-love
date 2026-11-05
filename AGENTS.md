<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application architecture
- Keep the existing public URLs and visual shell; authenticated operations use Cloud-backed server functions so browser role switching cannot grant permissions.
- Store business records in explicit RLS-protected tables and validate transitions in database RPCs; the browser store is a read cache, not an authority.
- Keep message encryption keys in managed secrets and decrypt only after participant-scoped reads; never store plaintext message bodies.
- Training tests remain locked until a real configured video and verified viewing progress exist; certificates represent platform completion, not official professional accreditation.
- Emergency records are internal alerts, not proof of external delivery; official 112 integration requires an authorized endpoint.
