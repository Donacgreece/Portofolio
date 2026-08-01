# Dimitris Galatsanos Portfolio

This repository contains my personal portfolio and technical blog. It presents my professional background as an IT Systems Engineer, along with projects that combine infrastructure, monitoring, automation, software development and digital publishing.

## Visit the website

The portfolio is available in English and Greek:

* [Portfolio in English](https://donacgreece.github.io/Portofolio/)
* [Portfolio in Greek](https://donacgreece.github.io/Portofolio/gr/)
* [Technical blog in English](https://donacgreece.github.io/Portofolio/blog/)
* [Technical blog in Greek](https://donacgreece.github.io/Portofolio/gr/blog/)

## About the portfolio

The website brings together the areas I work with every day and the projects I develop in my own time. It includes:

* Professional experience in IT systems, infrastructure and operations
* Practical work with networking, monitoring, support and service continuity
* Software projects built to solve real operational problems
* A bilingual technical blog with detailed project stories and practical notes
* Downloadable versions of my CV in English and Greek
* Direct links to my GitHub profile, LinkedIn profile and published work

The interface is responsive and designed to work across desktop, tablet and mobile devices. It also includes keyboard shortcuts for quick navigation between the main sections.

## Selected projects

### TableMaster

A restaurant operations platform built with Flask. It combines order management, table handling, network printing, bill splitting, product administration, audit records and database backups in one system.

[View TableMaster on GitHub](https://github.com/Donacgreece/Tablemaster)

### PingOS

A Windows network monitoring application built with Python and PyQt5. It monitors multiple hosts, records latency and packet loss, identifies meaningful state changes and sends alerts through Windows, email and Microsoft Teams.

[View PingOS on GitHub](https://github.com/Donacgreece/PingOS)

### LearnPython.ai

An interactive programming learning platform that grew from the original LearnPython.gr project. It combines structured lessons, browser-based code execution and guided learning tools in a single environment.

[Visit LearnPython.ai](https://learnpython.ai)

### Respawn.gr

A custom gaming publication and content platform built around editorial workflows, long-form features, community participation and a dedicated content management system.

[Visit Respawn.gr](https://respawn.gr)

## Technical blog

The blog documents how the projects were designed and developed, as well as lessons from day-to-day IT operations. Every article is available in English and Greek.

Current subjects include:

* Change management in IT
* Building TableMaster with Flask
* Building PingOS with Python
* The development of LearnPython.gr, LearnPython.ai and DevApps Learn
* Building the Respawn.gr publishing platform

Articles are stored as Markdown files and converted into static pages by the blog generator. The generated website also includes RSS feeds and a sitemap.

## Technology

The project uses:

* HTML, CSS and JavaScript for the portfolio and generated pages
* React, Next.js and TypeScript for the application layer
* Markdown for bilingual blog content
* Node.js for static blog generation
* Decap CMS for browser-based content management
* GitHub Pages for the public website

## Repository structure

```text
app/                 Application routes and portfolio source
content/blog/en/     English blog articles
content/blog/gr/     Greek blog articles
docs/                Static website published by GitHub Pages
docs/admin/          Blog content management interface
public/              CV files, icons and shared assets
scripts/             Blog generation tools
```

## Local development

Node.js 22 or a newer compatible version is required.

```bash
npm install
npm run dev
```

To regenerate the static blog pages after editing an article:

```bash
npm run blog:build
```

## Contact

* [LinkedIn](https://www.linkedin.com/in/dgalatsanos/)
* [GitHub](https://github.com/Donacgreece)
* [galatsanos@gmail.com](mailto:galatsanos@gmail.com)

Copyright 2026 Dimitris Galatsanos. All rights reserved.
