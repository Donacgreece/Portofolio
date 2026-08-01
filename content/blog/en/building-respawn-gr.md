---
title: Building Respawn.gr
date: 2026-07-28T15:43:00+03:00
excerpt: When Gaming Journalism Became a Custom Digital Product
category: Projects
tags:
  - React
  - Custom CMS
  - Web Development
  - Digital Publishing
  - Gaming Journalism
  - Editorial Strategy
  - PWA
  - SEO
  - Product Development
  - Content Management
  - Community Platform
  - Respawn.gr
cover: https://i.ibb.co/svpLWVt7/Chat-GPT-Image-28-2026-03-41-53.png
featured: false
translation_key: building-respawn-custom-gaming-platform
---
Respawn.gr did not begin simply as an idea for another Greek gaming website. It was the result of a long journey through gaming media, continuous involvement with editorial content, and a growing need to build a platform capable of fully expressing how I understand modern digital publishing.

My own journey began several years earlier through JustGamer.gr and later through its collaboration and merger with Joystick. That experience taught me what it means to operate a gaming publication, organise content, work with writers, cover daily news, and maintain a distinct identity in a highly competitive environment.

Over time, it became clear that I did not only want to continue publishing articles inside an existing structure. I wanted to design the complete experience from the beginning. This included the way content is created and organised, the reader’s relationship with the platform, community features, performance, publishing workflows, and the technical foundation on which the project could continue to grow.

That is how Respawn.gr was created.

## From publication to digital product

A modern gaming publication is not simply a collection of articles. It is a digital product that needs to serve readers, writers, administrators, search engines, and the publication’s broader strategy at the same time.

For this reason, I treated Respawn.gr as a product development project from the beginning, not only as an editorial initiative. Every feature needed to respond to a real requirement. Every content category needed a clear identity. Every page needed to be designed around the material it would present rather than being forced into the limitations of a general template.

The platform was developed with a custom React frontend and its own content management system. This gave me the ability to design the content model, data, and publishing workflows around the actual requirements of Respawn.gr.

Instead of adapting the editorial vision to a ready-made platform, I could evolve the platform together with the editorial vision.

## Why I did not choose WordPress

WordPress is an extremely mature solution that supports thousands of publications. For Respawn.gr, however, I wanted greater control over the architecture, user experience, and the way different types of content connect with one another.

I did not want the site to remain limited to the traditional model of an article, category, and homepage. I wanted room for personal collections, temporary player searches, bookmarks, premium editorial content, and a broader user profile.

A custom system allows every new capability to become a natural part of the platform rather than an additional plugin attempting to communicate with several independent components.

This decision significantly increased the complexity of the project. I needed to address areas that are normally taken for granted on an established platform, including content editing, metadata, user management, publishing states, responsive behaviour, performance, and consistency between different screens.

At the same time, it provided what I considered most important. The ability to create a genuinely independent product.

## An editorial model beyond daily news

Daily news is an essential part of a gaming publication, but it was not the only reason Respawn.gr was created.

The content was organised around different editorial areas, allowing every category to serve a separate purpose. News covers important industry developments through clear journalistic writing. Editorial provides room for opinion and analysis. Essentials recommends games and experiences worth discovering. Stories focuses on historical features, retrospectives, and narratives surrounding games, creators, and entire periods of the industry.

Respawn+ was created as a home for deeper long-form content. It was not designed simply as a paywall mechanism, but as the editorial area where extensive features, multi-part projects, interviews, and research could be developed with the time and preparation they require.

The central idea was that Respawn.gr should not compete only through speed. It should publish work that remains valuable after the original news cycle has ended.

## From publishing content to building an identity

A publication’s editorial identity is not created only through article titles. It develops through consistency in writing, design, subject selection, and the way every story is presented.

For this reason, considerable attention was given to thumbnail consistency, visual identities for different categories, and the overall reading experience.

Stories, Essentials, Editorial, and Respawn+ have distinct functional and visual identities without appearing to belong to unrelated websites. The design system needed to make each category recognisable while preserving the unified presence of Respawn.gr.

The same principle applies to writing. News requires a direct journalistic structure. A major editorial article needs space, coherence, and a developed argument. A historical feature needs narrative flow, research, and a sense of time and place.

The CMS and frontend therefore needed to support not only different visual presentations, but also different forms of storytelling.

## Creating a CMS around the editorial workflow

Building a custom CMS involves more than providing a text editor and a publish button. It needs to support the entire lifecycle of a piece of content.

An article requires a title, short description, category, tags, image, publication date, metadata, and a clear workflow from draft to publication. It may need a translated version, a connection to another language, featured placement, and correct presentation in several areas of the platform.

As Respawn.gr grew, the CMS needed to support more types of content and a larger group of writers. This required a clear structure so that additional functionality would not make everyday publishing more difficult.

The goal was to allow writers to focus on their work while the system maintains consistency in presentation.

This is one of the areas where technical development and editorial experience intersected most strongly. Because I understood the actual needs of a writer and administrator, I could design the tool around a real daily workflow instead of a purely theoretical technical structure.

## Respawn.gr as a community, not only a publication

From the early stages of development, I wanted Respawn.gr to give readers a reason to return even when they were not looking for a specific article.

For this reason, the platform introduced features that go beyond the traditional content website model.

My Collection allows users to organise and share their gaming collections. LFG was designed as a quick way to find other players, with posts automatically removed after three days so that the information remains current.

Gamer Passport provides a broader identity within the platform, while bookmarks allow readers to save articles they would like to revisit.

These capabilities were not created simply to increase the number of features. They exist because gaming is social by nature. A gaming publication can simultaneously serve as a source of information, an archive of stories, and a meeting point for a community.

## Registration without email and privacy-focused design

One of the most distinctive Respawn.gr decisions was allowing users to create an account without providing an email address.

A user can register with a username and password without sharing more personal information than is genuinely required for the account to function.

This decision has technical consequences. The absence of email changes account recovery, user communication, and several common authentication workflows.

At the same time, it reflects a specific philosophy. Digital platforms do not need to collect every available piece of information simply because it has become standard practice.

Privacy was not treated only as a statement in the terms of service. It influenced the design of the experience itself.

## PWA and an application-like experience

Respawn.gr was also developed as a Progressive Web App, allowing it to be installed on computers and mobile devices and providing an experience closer to a standalone application.

The PWA approach gives users direct access from their home screen or operating system without requiring a separate application from a store.

This connects with a broader project decision. Instead of developing completely different experiences for web, mobile, and desktop, the responsive frontend needed to provide a shared foundation.

The same platform must remain readable on a large display, functional on a tablet, and immediate on a mobile phone. This requires attention not only to breakpoints, but also to content density, title sizes, navigation, and the priority of every interface element.

## The challenge of performance and SEO

Developing a publication with React introduces different challenges from those of a traditional server-rendered website.

Performance is not only about how quickly the homepage appears. It also includes article loading time, image behaviour, layout stability, accessibility, and the way search engines interpret the content.

SEO needed to be treated as an architectural concern. Titles, descriptions, canonical data, social previews, and the presence of actual article content during the first render cannot be considered secondary details for a publication.

Platform optimisation resulted in strong PageSpeed desktop measurements, including 91 for Performance and 100 for Accessibility, Best Practices, and SEO.

These numbers were not the final objective. They indicated that design, frontend development, and content could coexist without one undermining the others.

## Managing content at scale

Within the first weeks of beta operation, the Respawn.gr library had already passed 550 published articles.

Managing this volume introduces requirements that do not exist in a small portfolio or demonstration project. Categories, tags, images, authors, and metadata must remain consistent. Content needs to be searchable and reusable across different areas of the homepage.

At the same time, the platform must support daily news without burying major features and older articles.

Balancing current and evergreen content became an important part of both the architecture and the editorial strategy.

Respawn.gr was not supposed to function only as a news feed. It needed to become a content library worth exploring again.

## Building relationships with the industry

One of the most important Respawn.gr objectives was to avoid depending exclusively on secondary reporting and press releases.

The publication began creating direct relationships with studios, developers, and people working across the European gaming industry. The interview with Warhorse Studios represented an important step in that direction.

The ambition is not simply to gain access to more statements. It is to present the creative process, studio philosophy, and the people behind the games.

Europe has an exceptionally rich development scene that often receives less attention than the largest American and Japanese studios. Respawn.gr aims to provide a place where these stories can be presented with the time and depth they deserve.

## The dual responsibility of developer and editor

Building and operating Respawn.gr requires constant movement between two different ways of thinking.

As a developer, I need to consider stability, performance, data, components, and user experience. As an editor, I need to consider writing quality, journalistic accuracy, subject selection, consistency, and the publication’s identity.

These roles often have different priorities. A technically impressive feature may provide little meaningful value to readers. A major editorial concept may require new capabilities from the CMS and frontend.

The real challenge is ensuring that the two sides do not compete. Technology needs to support journalism, while editorial strategy needs to provide clear direction for product development.

This connection may be the element that most clearly separates Respawn.gr from my other projects.

## What I learned from building Respawn.gr

Respawn.gr taught me that developing a content platform is very different from building a simple website.

Creating an attractive frontend is not enough. Content workflows, user management, search, page types, and the long-term evolution of the platform must all be designed.

I also learned that real product development does not happen only before launch. It truly begins when actual readers and writers start using the platform.

Small issues involving alignment, title size, or modal behaviour can affect the experience more than a major feature that is rarely used. Continuous observation, feedback, and a willingness to redesign are essential parts of the project.

The most important lesson was that independence comes with a cost, but also offers enormous creative freedom. When both the content and platform are under your control, there is no predefined roadmap. Every decision must be justified by the product’s purpose.

## Limitations and next steps

Respawn.gr continues to evolve. Despite its existing capabilities, several areas can still be improved.

The technical roadmap includes stronger server-side rendering and indexing, further image optimisation, more advanced search, better analytics, and improved tools for writers.

At the community level, Gamer Passport, collections, and LFG can become more deeply connected. Users could discover people with shared interests, organise their gaming experiences more effectively, and participate more directly in the platform’s identity.

Editorially, the goal is to create more original features, interviews, and projects that are not dependent only on the daily news cycle.

The next stage is not simply about adding more content or more features. It is about strengthening the connection between technology, journalism, and community.

## Final thoughts

Respawn.gr is the project where almost every part of my professional and creative journey comes together.

It combines software development, product management, interface design, content management, journalism, team organisation, and my long-standing interest in gaming.

It began with a desire to create a place where gaming content would not be treated as a fast and disposable stream of news. It developed into a custom platform capable of supporting daily reporting, long-form storytelling, personal opinion, historical features, and community functionality.

Respawn.gr is not simply the website where our articles are published. It is the system that allows those articles, writers, and readers to exist together.

For me, it represents something even more important. The decision not to remain limited by the tools that already existed, but to create the tool that the vision required.
