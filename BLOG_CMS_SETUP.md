# Portfolio blog CMS setup

The blog pages and editor are implemented on `feature/blog-cms`. Do not merge this branch until the preview and authentication flow have been approved.

## What is already included

- English blog at `/blog/` and Greek blog at `/gr/blog/`.
- Markdown content under `content/blog/en` and `content/blog/gr`.
- Decap CMS editor at `/admin/`.
- Editorial workflow for drafts and review before publishing.
- Automatic GitHub Action that rebuilds the static blog after an article is published.
- RSS feeds, article metadata, search, categories, tags and reading time.

## One-time private authentication setup

Decap CMS uses GitHub as its backend. GitHub requires a small OAuth proxy because the OAuth client secret must never be stored in this repository.

1. Deploy the Cloudflare Worker from the Decap-documented proxy template:
   `https://github.com/sterlingwes/decap-proxy`
2. Copy the final Worker URL, for example:
   `https://portfolio-cms-auth.<account>.workers.dev`
3. In GitHub, create an OAuth App under **Settings → Developer settings → OAuth Apps**.
4. Set the OAuth App homepage to the Worker URL.
5. Set the authorization callback URL to `<Worker URL>/callback`.
6. Store the GitHub OAuth client ID and secret as Worker secrets named `GITHUB_OAUTH_ID` and `GITHUB_OAUTH_SECRET`.
7. Replace the placeholder `backend.base_url` in `docs/admin/config.yml` with the Worker URL.
8. In the repository Actions settings, allow workflows to have read and write permissions so published articles can regenerate the static pages.

Only GitHub users with write access to `Donacgreece/Portofolio` can publish. If Dimitris is the only account with write access, he is the only publisher. Do not add additional collaborators with write access unless they should also be allowed to publish.

## Publishing an article

1. Open `/admin/` and sign in with GitHub.
2. Choose **Ελληνικά άρθρα** or **English articles**.
3. Create the article, add tags and optionally a cover image.
4. Save it as a draft or move it through the editorial workflow.
5. Publish it. GitHub Actions regenerates the public pages automatically.

For bilingual versions, use the same `translation_key` in both articles.

## Rollback

The tag `portfolio-before-blog` points to the exact portfolio state before this work. The full blog is isolated on `feature/blog-cms` until approval.
