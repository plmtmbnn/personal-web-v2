# [0.50.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.49.0...v0.50.0) (2026-07-09)


### Features

* **tasks:** advanced task system with status, subtasks, effort, dependencies ([707e8d2](https://github.com/plmtmbnn/personal-web-v2/commit/707e8d294cbc0f9470b6093fe653c3efe62652ef))

# [0.49.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.48.6...v0.49.0) (2026-07-09)


### Features

* **tasks:** add task status, effort estimation, tags, and archiving ([f2c5291](https://github.com/plmtmbnn/personal-web-v2/commit/f2c5291b0da0e7add0bc8531099f60abb672b103))

## [0.48.6](https://github.com/plmtmbnn/personal-web-v2/compare/v0.48.5...v0.48.6) (2026-07-09)


### Bug Fixes

* correct vercel.json ignore command property name ([00af7e0](https://github.com/plmtmbnn/personal-web-v2/commit/00af7e07210e67094939a87f4a5fa5bb54fd3bca))

## [0.48.5](https://github.com/plmtmbnn/personal-web-v2/compare/v0.48.4...v0.48.5) (2026-07-09)

## [0.48.4](https://github.com/plmtmbnn/personal-web-v2/compare/v0.48.3...v0.48.4) (2026-07-09)


### Bug Fixes

* **stock-data:** replace got-scraping with native fetch ([dae7eca](https://github.com/plmtmbnn/personal-web-v2/commit/dae7eca9580d92cb0583dd2e54f9fc209ef0f872))

## [0.48.3](https://github.com/plmtmbnn/personal-web-v2/compare/v0.48.2...v0.48.3) (2026-07-08)


### Bug Fixes

* **stock-explorer:** bypass Turbopack for got-scraping via eval require ([9ba3a7c](https://github.com/plmtmbnn/personal-web-v2/commit/9ba3a7c30f837c53e98399a63a38d6ddb1f3dbf3))

## [0.48.2](https://github.com/plmtmbnn/personal-web-v2/compare/v0.48.1...v0.48.2) (2026-07-08)


### Bug Fixes

* **stock-explorer:** add adm-zip and http2-wrapper to serverExternalPackages ([f20e133](https://github.com/plmtmbnn/personal-web-v2/commit/f20e133a47210ab1c05e39ff142be7687cb3ad9b))

## [0.48.1](https://github.com/plmtmbnn/personal-web-v2/compare/v0.48.0...v0.48.1) (2026-07-08)


### Bug Fixes

* **stock-explorer:** fix ProcessedStock import paths in components ([a06ed51](https://github.com/plmtmbnn/personal-web-v2/commit/a06ed5131a0cf6d67bdaa0a35185968e940b8015))

# [0.48.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.47.0...v0.48.0) (2026-07-08)


### Features

* **stock-explorer:** revamp dashboard into premium market intelligence platform ([b5c7888](https://github.com/plmtmbnn/personal-web-v2/commit/b5c7888d5f0a0c9664ebb334d4c47fccecb13d5b))

# [0.47.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.46.0...v0.47.0) (2026-07-08)


### Features

* **stock:** implement auto sync, 3-hour cache TTL, and revamped admin status panel ([cfdfac1](https://github.com/plmtmbnn/personal-web-v2/commit/cfdfac123f325d457ea1fb04c6774c43444001da))

# [0.46.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.45.0...v0.46.0) (2026-07-08)


### Bug Fixes

* **build:** remove redundant sentry-cli from build script ([f91f9d7](https://github.com/plmtmbnn/personal-web-v2/commit/f91f9d722a34ea9fcf24e6aa813f5cd32b8aa00b))
* **build:** use sequential build commands for Vercel compatibility ([58d206e](https://github.com/plmtmbnn/personal-web-v2/commit/58d206e0d4a49b66938875fe7c6a08c451c02c33))
* remove invalid Sentry plugin options ([2f092f2](https://github.com/plmtmbnn/personal-web-v2/commit/2f092f2e5cd6a357f28d2aa3004c52094693f90b))


### Features

* **auth:** revamp pinguard ui and integrate google authenticator (totp) ([ff138dd](https://github.com/plmtmbnn/personal-web-v2/commit/ff138dd81b1f4827818531e5f56b588505e55e8a))
* **blog:** responsive mobile card layout, skeleton loaders, image optimization, accessibility ([21bdba4](https://github.com/plmtmbnn/personal-web-v2/commit/21bdba42b130cbc60981655fcaf2381e5c7df15a))
* **perf:** optimize build and runtime performance ([402c95e](https://github.com/plmtmbnn/personal-web-v2/commit/402c95ee74b1935a1b165b96788e3c46ac009200))


### Performance Improvements

* optimize build and dev configurations ([8a79aa6](https://github.com/plmtmbnn/personal-web-v2/commit/8a79aa62bd7d3a595eae1ab2195158356fd04549))

# [0.45.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.44.0...v0.45.0) (2026-07-06)


### Features

* **ui:** optimize HomeView performance with memoization and animation improvements ([6fb7feb](https://github.com/plmtmbnn/personal-web-v2/commit/6fb7febed91db16568c84a1881da113698a46a26))

# [0.44.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.43.1...v0.44.0) (2026-07-04)


### Features

* **ui:** revamp auth views, optimize SSR, and add defensive check fallbacks ([6659167](https://github.com/plmtmbnn/personal-web-v2/commit/665916760cbdce37fc1e3f09e0f12feffb132c02))

## [0.43.1](https://github.com/plmtmbnn/personal-web-v2/compare/v0.43.0...v0.43.1) (2026-07-03)


### Bug Fixes

* resolve static generation build failures with useSearchParams ([3fad079](https://github.com/plmtmbnn/personal-web-v2/commit/3fad0794b20bd3429a1986399c6e5e1f70448a28))

# [0.43.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.42.3...v0.43.0) (2026-07-03)


### Features

* **blog:** update blog grid layout, add lazy loading, and refine skeleton screens ([5c6723b](https://github.com/plmtmbnn/personal-web-v2/commit/5c6723b36360be0fa0182553e2bd9178621d2c81))

## [0.42.3](https://github.com/plmtmbnn/personal-web-v2/compare/v0.42.2...v0.42.3) (2026-07-02)

## [0.42.2](https://github.com/plmtmbnn/personal-web-v2/compare/v0.42.1...v0.42.2) (2026-07-02)


### Bug Fixes

* **tasks:** resolve build errors and lints for tasks feature ([410c830](https://github.com/plmtmbnn/personal-web-v2/commit/410c830b478be5445c5108ed88e757b5496b1f24))

## [0.42.1](https://github.com/plmtmbnn/personal-web-v2/compare/v0.42.0...v0.42.1) (2026-07-01)


### Bug Fixes

* **blog:** resolve framer-motion/client reference and type errors in detail page ([4a754a5](https://github.com/plmtmbnn/personal-web-v2/commit/4a754a5caf6cd71a1be15f0cc1f87588cd83aa01))

# [0.42.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.41.0...v0.42.0) (2026-07-01)


### Features

* **blog:** add analytics tracking and enhanced scroll progress ([45932ca](https://github.com/plmtmbnn/personal-web-v2/commit/45932caf2a2e77194bca524f06a95e81bfee9770))

# [0.41.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.40.0...v0.41.0) (2026-07-01)


### Features

* **blog:** phase 1-2 enhancements - critical fixes, SEO, and performance improvements ([52afe97](https://github.com/plmtmbnn/personal-web-v2/commit/52afe97396741f49b438f24f0e4b8bd108edceb4))

# [0.40.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.39.0...v0.40.0) (2026-06-28)


### Features

* **home:** make runningKmPerYear dynamic using cached Redis stats ([f0cfd20](https://github.com/plmtmbnn/personal-web-v2/commit/f0cfd20e08a91aa570e6699fdb52f49dc56a0138))

# [0.39.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.38.1...v0.39.0) (2026-06-28)


### Features

* **running:** integrate strava api for activities and stats with redis caching ([42f2061](https://github.com/plmtmbnn/personal-web-v2/commit/42f2061d977d7260eda8fcc290a900b59130acaa))

## [0.38.1](https://github.com/plmtmbnn/personal-web-v2/compare/v0.38.0...v0.38.1) (2026-06-27)

# [0.38.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.37.2...v0.38.0) (2026-06-26)


### Features

* **blog,tasks:** add collapsible blog sidebar and interactive task description checklists ([19c6192](https://github.com/plmtmbnn/personal-web-v2/commit/19c6192354b8d6d5fd97e770cab6b1d4ea7da47a))

## [0.37.2](https://github.com/plmtmbnn/personal-web-v2/compare/v0.37.1...v0.37.2) (2026-06-26)

## [0.37.1](https://github.com/plmtmbnn/personal-web-v2/compare/v0.37.0...v0.37.1) (2026-06-25)


### Performance Improvements

* optimize nextjs startup, builds, package imports and lazy load utilities ([a5f7b69](https://github.com/plmtmbnn/personal-web-v2/commit/a5f7b6935ed9ddab63bea0c57de3e0ddba6cedf5))

# [0.37.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.36.0...v0.37.0) (2026-06-21)


### Features

* overhaul tasks, navigation, utilities, and admin dashboard grids ([95f35ca](https://github.com/plmtmbnn/personal-web-v2/commit/95f35cacd58d125b671a77584963aac25856fc1a))

# [0.36.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.35.0...v0.36.0) (2026-06-20)


### Features

* **home:** enhance home view layout, links, animations and bio narrative ([8f1771e](https://github.com/plmtmbnn/personal-web-v2/commit/8f1771eebfece9e63820b75183112fd67c144942))

# [0.35.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.34.0...v0.35.0) (2026-06-20)


### Features

* **tasks:** enhance TaskForm and TaskItem with new features and improvements ([a28add8](https://github.com/plmtmbnn/personal-web-v2/commit/a28add82d16336c80d31366b194e26f8b535ae2b))

# [0.34.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.33.0...v0.34.0) (2026-06-19)


### Features

* **mock:** add rate limiting configuration to mock endpoints ([6bd6ba8](https://github.com/plmtmbnn/personal-web-v2/commit/6bd6ba88690b89bcfec8d12dbfe9003eea0f9ba4))

# [0.33.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.32.0...v0.33.0) (2026-06-19)


### Features

* add Sentry instrumentation and update dependencies ([a931cf7](https://github.com/plmtmbnn/personal-web-v2/commit/a931cf785cc1eb04e323c1700873a48a01f021e0))

# [0.32.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.31.0...v0.32.0) (2026-06-16)


### Bug Fixes

* **blog:** fix 'used before declaration' build error in AdminBlogList ([4269e00](https://github.com/plmtmbnn/personal-web-v2/commit/4269e00baf73f675b9af3d48a1b83a308bdaaaea))


### Features

* **adventures:** add Ultra Trail (65.9k) running record ([4f927ae](https://github.com/plmtmbnn/personal-web-v2/commit/4f927aeae6d8f9c17696544213c8d50447137974))
* **blog:** enhance syntax highlighting, responsiveness, and footer UX ([00f8cae](https://github.com/plmtmbnn/personal-web-v2/commit/00f8cae772d9ff1a253fe3f99c6cc4883d98237e)), closes [hi#contrast](https://github.com/hi/issues/contrast)
* **tasks,shared:** implement dynamic textarea and robust stock data handling ([9a98197](https://github.com/plmtmbnn/personal-web-v2/commit/9a9819724a3122415b5fa149fffacb7a19a37ca9))
* **travel:** append new destinations to travel tracker ([6ca3241](https://github.com/plmtmbnn/personal-web-v2/commit/6ca3241594e9a0bee49fc53b2a30c82ed4ce2a18))
* **travel:** implement interactive travel bucket list tracker ([6c76610](https://github.com/plmtmbnn/personal-web-v2/commit/6c766101bfc3c1567f5853cd38ed2f8c181b36d0))
* **travel:** update destination data with real locations ([8313fbf](https://github.com/plmtmbnn/personal-web-v2/commit/8313fbfdc2b7b20d2c4182f40f716d9d620d1e2a))
* **utils:** implement module focus pattern and json tree view across utilities ([a5670c0](https://github.com/plmtmbnn/personal-web-v2/commit/a5670c03fcd86445cdc1d60c4b4c1d4512273fec))

# [0.31.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.30.0...v0.31.0) (2026-05-15)


### Features

* **mock-api:** add dynamic mock api engine with redis persistence ([fd7c945](https://github.com/plmtmbnn/personal-web-v2/commit/fd7c9457d51ba3d7aa5900ba441a76b6741a5cb8))

# [0.30.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.29.0...v0.30.0) (2026-05-10)


### Features

* **stock-explorer:** enhance UIUX with filter chips and sync overlay ([b881a60](https://github.com/plmtmbnn/personal-web-v2/commit/b881a6011b902be2f9cedb751464618d04eba26b))

# [0.29.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.28.1...v0.29.0) (2026-05-10)


### Features

* **investment:** add Redis-backed IDX Stock Explorer with admin import ([779fc43](https://github.com/plmtmbnn/personal-web-v2/commit/779fc43bcccdd77181decc7ba10442a81d28f947))

## [0.28.1](https://github.com/plmtmbnn/personal-web-v2/compare/v0.28.0...v0.28.1) (2026-05-07)


### Bug Fixes

* firebase config and cron task reminder ([7a89233](https://github.com/plmtmbnn/personal-web-v2/commit/7a89233a812c00f90814ad40def5753d37342cc9))

# [0.28.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.27.0...v0.28.0) (2026-05-07)


### Features

* **utils:** add Kebab-Case File Renamer utility ([69ce64f](https://github.com/plmtmbnn/personal-web-v2/commit/69ce64fb6608b10fa02b33e85fe24fe4418cac1f))

# [0.27.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.26.0...v0.27.0) (2026-05-06)


### Features

* **utils:** add Schema Forge JSON converter, optimize timer sync, and remove stock explorer ([7918983](https://github.com/plmtmbnn/personal-web-v2/commit/7918983fb26c8e54cf1f3a6723168a3805056788))

# [0.26.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.25.2...v0.26.0) (2026-05-06)


### Features

* **investment:** add StockExplorer with IDX proxy and reorganize nav ([43d824b](https://github.com/plmtmbnn/personal-web-v2/commit/43d824b210b47ee0dc2831f6001bd5f782222334))

## [0.25.2](https://github.com/plmtmbnn/personal-web-v2/compare/v0.25.1...v0.25.2) (2026-05-05)


### Bug Fixes

* **blog:** decode slug and use dynamic fetch for detail page ([8050928](https://github.com/plmtmbnn/personal-web-v2/commit/80509286c1a13775c96a79d00ba49aa6e50e74d3))

## [0.25.1](https://github.com/plmtmbnn/personal-web-v2/compare/v0.25.0...v0.25.1) (2026-05-03)

# [0.25.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.24.0...v0.25.0) (2026-05-03)


### Features

* **notifications:** implement modular notification system with telegram and firebase remote config ([47e8a80](https://github.com/plmtmbnn/personal-web-v2/commit/47e8a80d357869986f0df520ec356bce87994742))

# [0.24.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.23.0...v0.24.0) (2026-05-03)


### Features

* **utils:** implement developer utility suite with advanced formatters ([1544f46](https://github.com/plmtmbnn/personal-web-v2/commit/1544f46a359f70aa33d28624a27e05accfb18af9))

# [0.23.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.22.2...v0.23.0) (2026-05-01)


### Features

* **seo:** enhance metadata, social previews, and structured data ([8117d92](https://github.com/plmtmbnn/personal-web-v2/commit/8117d9252e5f2814aa4f1eb9cb37303e6f1794cd))

## [0.22.2](https://github.com/plmtmbnn/personal-web-v2/compare/v0.22.1...v0.22.2) (2026-05-01)

## [0.22.1](https://github.com/plmtmbnn/personal-web-v2/compare/v0.22.0...v0.22.1) (2026-05-01)

# [0.22.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.21.0...v0.22.0) (2026-05-01)


### Features

* **adventures:** add Stock & Crypto Average Calculator utility ([5c0d25a](https://github.com/plmtmbnn/personal-web-v2/commit/5c0d25a7ce355aba46205ab4e0ec2977f4e06962))

# [0.21.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.20.1...v0.21.0) (2026-05-01)


### Features

* **adventures:** reorganize utilities, enhance timer, and optimize auth sessions ([97a35f4](https://github.com/plmtmbnn/personal-web-v2/commit/97a35f418d31456ac33fc0da09e05a25b2a97755))

## [0.20.1](https://github.com/plmtmbnn/personal-web-v2/compare/v0.20.0...v0.20.1) (2026-05-01)

# [0.20.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.19.0...v0.20.0) (2026-05-01)


### Features

* **tasks:** enhance heatmap, progress tracking, and operational layout ([779e4e7](https://github.com/plmtmbnn/personal-web-v2/commit/779e4e712756ae967d9e591c073ec5ea4cf04eab))

# [0.19.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.18.0...v0.19.0) (2026-05-01)


### Features

* **tasks:** include created_at in getTasks heatmap query ([de74216](https://github.com/plmtmbnn/personal-web-v2/commit/de74216d0a3f9640b1f0ef7546164ac699aca29f))
* **tasks:** refactor heatmap utility for multi-metric support ([b291f60](https://github.com/plmtmbnn/personal-web-v2/commit/b291f60fe70979b3cd87834b2beef426c2a68299))
* **tasks:** update TaskHeatmap UI to split-diagonal dual metric ([3ea95bd](https://github.com/plmtmbnn/personal-web-v2/commit/3ea95bdecda980d9fc6c7bfad83ee910f0c62639))

# [0.18.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.17.0...v0.18.0) (2026-04-28)


### Bug Fixes

* **tasks:** ensure getTasks fetches all completed tasks in range for heatmap ([08f1895](https://github.com/plmtmbnn/personal-web-v2/commit/08f1895c183131d549a5c7367ee5c8ee668b3324))


### Features

* **tasks:** add heatmap data aggregation utility and tests ([e1a1696](https://github.com/plmtmbnn/personal-web-v2/commit/e1a16966ea2a938caffa119ceb19fa06b2540ff4))
* **tasks:** create TaskHeatmap component ([f9891d6](https://github.com/plmtmbnn/personal-web-v2/commit/f9891d6520f8f457f9455f4941585b07b21442cb))
* **tasks:** expand data fetching to full current month ([0cf558d](https://github.com/plmtmbnn/personal-web-v2/commit/0cf558d08ed6c5040951346460cb150e6fa91992))
* **tasks:** integrate TaskHeatmap into TasksView ([e057013](https://github.com/plmtmbnn/personal-web-v2/commit/e05701395e3837f41425cbed91bd44a7195cea93))

# [0.17.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.16.0...v0.17.0) (2026-04-27)


### Features

* **blog:** add headline filter and default sort by created_at ([2f38f51](https://github.com/plmtmbnn/personal-web-v2/commit/2f38f51062e7b8aa381e95bcba102f2f06adf751))

# [0.16.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.15.0...v0.16.0) (2026-04-19)


### Features

* **blog/tasks:** finalize high-fidelity content orchestration and administrative systems ([184216c](https://github.com/plmtmbnn/personal-web-v2/commit/184216cef8eaa76579ac3be9ae869dd6086cc509)), closes [hi#fidelity](https://github.com/hi/issues/fidelity) [hi#contrast](https://github.com/hi/issues/contrast)

# [0.15.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.14.0...v0.15.0) (2026-04-19)


### Features

* **blog:** refine UIUX with high-contrast text backing and share feature ([3575f35](https://github.com/plmtmbnn/personal-web-v2/commit/3575f35b7c806c3fd1ecbced1938e52dfc5ee98e)), closes [hi#contrast](https://github.com/hi/issues/contrast) [hi#contrast](https://github.com/hi/issues/contrast)

# [0.14.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.13.0...v0.14.0) (2026-04-19)


### Features

* **blog:** enhance UIUX with high-contrast layouts and interactive features ([471c2ca](https://github.com/plmtmbnn/personal-web-v2/commit/471c2ca3cb3a8732399c439553f040c7a56c63a8)), closes [hi#contrast](https://github.com/hi/issues/contrast) [hi#contrast](https://github.com/hi/issues/contrast)

# [0.13.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.12.0...v0.13.0) (2026-04-19)


### Features

* **investment/tasks:** implement integrated hub, batch tasks, and security protocols ([83ac8db](https://github.com/plmtmbnn/personal-web-v2/commit/83ac8dbc590a611ae0f07a02f34afac7ad33e25b))

# [0.12.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.11.0...v0.12.0) (2026-04-18)


### Features

* **investment/tasks:** implement integrated fear & greed hub and batch task initialization ([978674c](https://github.com/plmtmbnn/personal-web-v2/commit/978674ce04783f40121f7df8018fc4ab371f3733))

# [0.11.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.10.3...v0.11.0) (2026-04-18)


### Features

* **tasks:** enhance TaskItem mobile layout and change completion trigger to checkbox ([f1852fb](https://github.com/plmtmbnn/personal-web-v2/commit/f1852fb5ea1e6701b96ea810e501add9a4d70e0d))

## [0.10.3](https://github.com/plmtmbnn/personal-web-v2/compare/v0.10.2...v0.10.3) (2026-04-18)


### Performance Improvements

* **blog:** optimize scrolling performance and implement SSG ([716cc4c](https://github.com/plmtmbnn/personal-web-v2/commit/716cc4c37a64444390d12447bc71f7ae45866b87))

## [0.10.2](https://github.com/plmtmbnn/personal-web-v2/compare/v0.10.1...v0.10.2) (2026-04-18)


### Performance Improvements

* **blog:** optimize scrolling performance and implement SSG ([0c03199](https://github.com/plmtmbnn/personal-web-v2/commit/0c0319909cf63f85633d5aa076498463d0b24bd6))

## [0.10.1](https://github.com/plmtmbnn/personal-web-v2/compare/v0.10.0...v0.10.1) (2026-04-16)


### Bug Fixes

* **tasks:** resolve typescript reduce type mismatch in analytics dashboard ([fc69c03](https://github.com/plmtmbnn/personal-web-v2/commit/fc69c039b6417898333e267f391979e6e206b9a3))

# [0.10.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.9.0...v0.10.0) (2026-04-16)


### Features

* **tasks:** implement punctuality and execution reliability analytics ([9e967d6](https://github.com/plmtmbnn/personal-web-v2/commit/9e967d689fc3806c950336f03795766a70465f32))

# [0.9.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.8.3...v0.9.0) (2026-04-16)


### Features

* **tasks:** implement advanced analytics, operational intel, and zero-truncation reporting ([8d8745c](https://github.com/plmtmbnn/personal-web-v2/commit/8d8745ced27d2779c83a9ea452ffb15b433f9412))

## [0.8.3](https://github.com/plmtmbnn/personal-web-v2/compare/v0.8.2...v0.8.3) (2026-04-13)

## [0.8.2](https://github.com/plmtmbnn/personal-web-v2/compare/v0.8.1...v0.8.2) (2026-04-13)

## [0.8.1](https://github.com/plmtmbnn/personal-web-v2/compare/v0.8.0...v0.8.1) (2026-04-13)


### Bug Fixes

* **tasks:** ensure upcoming tasks are fetched and correctly filtered ([4d7aeea](https://github.com/plmtmbnn/personal-web-v2/commit/4d7aeea867bc1a6fbaf140a52374bf897447c12a))

# [0.8.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.7.0...v0.8.0) (2026-04-13)


### Bug Fixes

* **tasks:** normalize date comparisons using startOfDay ([2c683bc](https://github.com/plmtmbnn/personal-web-v2/commit/2c683bcfa2c940bd3616ccc351cdb96f827f96cb))


### Features

* **tasks:** add sticky headers and swipe-to-action gestures ([4f94146](https://github.com/plmtmbnn/personal-web-v2/commit/4f941465b858f9e2c5fc67fad63200c49f59f66d))
* **tasks:** implement mobile bottom-sheet form and FAB ([00f8a9b](https://github.com/plmtmbnn/personal-web-v2/commit/00f8a9b6a600d6f462943d598b59e13bb7cca5eb))
* **tasks:** optimize category filters for mobile horizontal scroll ([00d0220](https://github.com/plmtmbnn/personal-web-v2/commit/00d02201e679a3726caf05bd1a4cb3b16a9f05a2))

# [0.7.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.6.0...v0.7.0) (2026-04-13)


### Features

* **tasks:** add dynamic category and completion filters ([d0eab24](https://github.com/plmtmbnn/personal-web-v2/commit/d0eab24b0cb170188bc8cff6ff709413fa82646d))
* **tasks:** implement dual-zone drag and drop logic ([a25f7bf](https://github.com/plmtmbnn/personal-web-v2/commit/a25f7bf5053cd914f7238e7376fddccd64ef4c5a))
* **tasks:** update getTasks action for range support ([6cd1653](https://github.com/plmtmbnn/personal-web-v2/commit/6cd1653fbaa73b59c36b26d3be6bbe9022ed1248))

# [0.6.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.5.0...v0.6.0) (2026-04-12)


### Features

* **admin:** add filtering, pagination and inline status toggle to blog management ([585ee9b](https://github.com/plmtmbnn/personal-web-v2/commit/585ee9b0c92de5939977d72252c3de92b86990e5))

# [0.5.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.4.0...v0.5.0) (2026-04-12)


### Features

* refine aesthetic loading states and improve PinGuard UX ([242d968](https://github.com/plmtmbnn/personal-web-v2/commit/242d96889e0678bd8e67611b7b918ebcf45cd3d6))

# [0.4.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.3.0...v0.4.0) (2026-04-12)


### Features

* enhance login and PinGuard with auto-verification and improved UX ([551fd93](https://github.com/plmtmbnn/personal-web-v2/commit/551fd9331f39f180a7de3705982972459df16616))

# [0.3.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.2.0...v0.3.0) (2026-04-12)


### Features

* enhance mobile UX and implement aesthetic loading skeletons ([2d426b6](https://github.com/plmtmbnn/personal-web-v2/commit/2d426b6390ed3a4e8249739c2f994516219f6068))

# [0.2.0](https://github.com/plmtmbnn/personal-web-v2/compare/v0.1.22...v0.2.0) (2026-04-12)


### Features

* refactor management and investment modules to solid productivity UI pattern ([e7a8092](https://github.com/plmtmbnn/personal-web-v2/commit/e7a80927837b2e8195120f39d3f2a5cb6b689039))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.1.22](https://github.com/plmtmbnn/personal-web-v2/compare/v0.1.21...v0.1.22) (2026-04-10)


### Features

* enhance UI ([592ef38](https://github.com/plmtmbnn/personal-web-v2/commit/592ef38d41943d06920eadbf7d50e4ec6cc2acbd))
* enhance UI ([3f43ca1](https://github.com/plmtmbnn/personal-web-v2/commit/3f43ca1f6ef534146d2ed001619b4a1fac5055b0))

### [0.1.21](https://github.com/plmtmbnn/personal-web-v2/compare/v0.1.20...v0.1.21) (2026-04-10)


### Features

* enhance UI ([0511244](https://github.com/plmtmbnn/personal-web-v2/commit/05112449e7637840955607ccc4f45c1a67084d22))
* enhance UI ([09bd675](https://github.com/plmtmbnn/personal-web-v2/commit/09bd67573b732b407bbed838af204573645e8174))
* **travel:** enhance UI ([fdd8697](https://github.com/plmtmbnn/personal-web-v2/commit/fdd8697930e1d5e9bc94b6ce97e9a27ea89ed58e))

### [0.1.20](https://github.com/plmtmbnn/personal-web-v2/compare/v0.1.19...v0.1.20) (2026-04-10)


### Features

* **contact:** enhance ui and integrate automated versioning from package.json ([7693d7d](https://github.com/plmtmbnn/personal-web-v2/commit/7693d7d3dcd3c4e011f3d63369ac35947b544a96))

### [0.1.19](https://github.com/plmtmbnn/personal-web-v2/compare/v0.1.18...v0.1.19) (2026-04-09)


### Features

* implement admin dashboard, blog crud and refactor navigation bar ([e0845c2](https://github.com/plmtmbnn/personal-web-v2/commit/e0845c28f0b3fd28f1a0b82368f9d9e70a64a013))

### [0.1.18](https://github.com/plmtmbnn/personal-web-v2/compare/v0.1.17...v0.1.18) (2026-04-08)


### Features

* task link clickable and refactor blog list and blog reader ([bc133ec](https://github.com/plmtmbnn/personal-web-v2/commit/bc133ecd54a63979ddfaa7cea2a95f5d9387b819))

### [0.1.17](https://github.com/plmtmbnn/personal-web-v2/compare/v0.1.16...v0.1.17) (2026-04-07)

### [0.1.16](https://github.com/plmtmbnn/personal-web-v2/compare/v0.1.15...v0.1.16) (2026-04-07)

### [0.1.15](https://github.com/plmtmbnn/personal-web-v2/compare/v0.1.14...v0.1.15) (2026-04-07)


### Bug Fixes

* **auth:** correct PKCE flow, implement robust callback logging, and handle profile verification gate ([2a07fc4](https://github.com/plmtmbnn/personal-web-v2/commit/2a07fc408cc0ff34f575639d3bdfceca1f0ad1e2))

### [0.1.14](https://github.com/plmtmbnn/personal-web-v2/compare/v0.1.13...v0.1.14) (2026-04-07)


### Features

* **auth:** implement Google OAuth, Redis sessions, and architectural ENV refactor with feature toggles ([bfe31e9](https://github.com/plmtmbnn/personal-web-v2/commit/bfe31e98ab09ef110f0af8752e50a0cee204c2fc))

### [0.1.13](https://github.com/plmtmbnn/personal-web-v2/compare/v0.1.12...v0.1.13) (2026-04-07)


### Features

* **auth/analytics:** implement rate limiting for PinGuard and Redis caching for task analytics ([124f618](https://github.com/plmtmbnn/personal-web-v2/commit/124f6184ddb7db677d7ac6e355c14818b9cc92c9))

### [0.1.12](https://github.com/plmtmbnn/personal-web-v2/compare/v0.1.11...v0.1.12) (2026-04-07)


### Features

* **tasks:** enhance analytics with tabs/velocity, overhaul Focus Mode with full-screen overlay, and refactor QuickNav to a minimalist pill ([9d19fb1](https://github.com/plmtmbnn/personal-web-v2/commit/9d19fb19eb2d3b1f17f6606a548a22962407c96b))
* **tasks:** implement analytics report and productivity stats ([ce00c65](https://github.com/plmtmbnn/personal-web-v2/commit/ce00c65109bdfde91d99f118c4dc5ce36c3b306c))
* **tasks:** implement data maintenance and HealthCheck for stale tasks ([6bedd2b](https://github.com/plmtmbnn/personal-web-v2/commit/6bedd2baa8d1ac40f1f9732d873639d851f0b393))

### [0.1.11](https://github.com/plmtmbnn/personal-web-v2/compare/v0.1.10...v0.1.11) (2026-03-30)


### Bug Fixes

* **tasks:** prevent horizontal card expansion and implement auto-resizing textarea ([7922e5b](https://github.com/plmtmbnn/personal-web-v2/commit/7922e5b0b9f5bf49e68e063f89f93667d062f461))

### [0.1.10](https://github.com/plmtmbnn/personal-web-v2/compare/v0.1.9...v0.1.10) (2026-03-29)


### Features

* implement daily tasks with dnd, investment hub, and zod env validation ([471f6bb](https://github.com/plmtmbnn/personal-web-v2/commit/471f6bbe5b9c11adc9753e34e0466c7109fe6cdc))
* implement daily tasks with dnd, investment hub, and zod env validation ([0d1dcd5](https://github.com/plmtmbnn/personal-web-v2/commit/0d1dcd5037d1b6a4f48fcb15603db62cfa939bfd))
* implement daily tasks with dnd, investment hub, and zod env validation ([8d53059](https://github.com/plmtmbnn/personal-web-v2/commit/8d53059ba12c83dde901ecd4f654e1fed6748a98))

### [0.1.9](https://github.com/plmtmbnn/personal-web-v2/compare/v0.1.8...v0.1.9) (2026-03-29)

### [0.1.8](https://github.com/plmtmbnn/personal-web-v2/compare/v0.1.7...v0.1.8) (2026-03-29)


### Features

* implement daily tasks with dnd, investment hub, and zod env validation ([9c7005b](https://github.com/plmtmbnn/personal-web-v2/commit/9c7005bc39d6139267b04ed48c98da82cbe2e10f))

### [0.1.7](https://github.com/plmtmbnn/personal-web-v2/compare/v0.1.6...v0.1.7) (2026-03-26)


### Bug Fixes

* update error function ([41a564e](https://github.com/plmtmbnn/personal-web-v2/commit/41a564ef5990004a5b42ad28b1b337c8dbc1995b))

### [0.1.6](https://github.com/plmtmbnn/personal-web-v2/compare/v0.1.5...v0.1.6) (2026-03-24)


### Features

* enhance SEO, responsiveness, and navigation ([014d8b5](https://github.com/plmtmbnn/personal-web-v2/commit/014d8b593c9c58382e24b14a232e59192e0c26cd))

### [0.1.5](https://github.com/plmtmbnn/personal-web-v2/compare/v0.1.3...v0.1.5) (2026-03-24)

### [0.1.4](https://github.com/plmtmbnn/personal-web-v2/compare/v0.1.3...v0.1.4) (2026-03-24)

### [0.1.3](https://github.com/plmtmbnn/personal-web-v2/compare/v0.1.2...v0.1.3) (2025-12-26)


### Features

* integrate supabase for blog list ([e5888a2](https://github.com/plmtmbnn/personal-web-v2/commit/e5888a214bde0efbd835a058dbf23ff70e8be258))

### [0.1.2](https://github.com/plmtmbnn/personal-web-v2/compare/v0.1.1...v0.1.2) (2025-12-26)

### 0.1.1 (2025-12-21)


### Features

* init project ([8316639](https://github.com/plmtmbnn/personal-web-v2/commit/8316639558c89e99aae2c79bc285340f03b6fe03))


### Bug Fixes

* header ([f0cb4af](https://github.com/plmtmbnn/personal-web-v2/commit/f0cb4afd33b8289d1045ffd0ec8527d325a84277))
* header ([82080bb](https://github.com/plmtmbnn/personal-web-v2/commit/82080bb3b77ef2ec10e18aa66fd2482c8348c650))
* metadata ([05925a5](https://github.com/plmtmbnn/personal-web-v2/commit/05925a542396431529301749e2587245e7a445da))
* metadata ([bacb2eb](https://github.com/plmtmbnn/personal-web-v2/commit/bacb2eb3d7c5193c9ab7b865c4db2b102f12693d))
* metadata ([5dcbb97](https://github.com/plmtmbnn/personal-web-v2/commit/5dcbb972797eb0cfc0d4bbc71f1338948c255b32))
* navbar and header blog ([433814b](https://github.com/plmtmbnn/personal-web-v2/commit/433814babd0a9d89d3a39d6f41f7482c00fdc629))
* styling ([2cd1170](https://github.com/plmtmbnn/personal-web-v2/commit/2cd1170da1a76565e903787862620acffee678f0))
* styling ([64f5acb](https://github.com/plmtmbnn/personal-web-v2/commit/64f5acb08b911c3a09c16b1603ad0041606c7d93))
* styling ([b3195e2](https://github.com/plmtmbnn/personal-web-v2/commit/b3195e2de45f5f0cd0431739b3497926407868d7))
