---
title: How I Built TableMaster with Flask
date: 2026-07-28
excerpt: From Restaurant Operations to a Complete Platform
category: Automation
tags:
  - Python
  - Flask
  - SQLite
  - Restaurant Management
  - POS
  - PWA
  - ESC/POS
  - JavaScript
  - Jinja2
  - Excel Automation
  - Software Architecture
  - Full Stack Development
cover: https://i.ibb.co/gbpCxbSp/Chat-GPT-Image-28-2026-01-04-09.png
featured: true
translation_key: building-tablemaster-flask-restaurant-pos
---
Running a restaurant, café, or bar depends on a sequence of actions that must be completed quickly, accurately, and consistently. A table is opened, an order is entered, products must reach the correct printer, the bill may need to be divided, payment must be recorded, and the table must eventually become available again.

Each action appears simple when considered in isolation. When all of them need to work together in real time, inside an environment where speed is essential, the problem becomes significantly more complex.

This was the main idea behind TableMaster. I did not want to build another basic order-entry form or a visual demonstration with limited functionality. My objective was to design a complete web application capable of following the real operational workflow of a hospitality business, from table management and ordering to printing and billing.

TableMaster was developed with Python and Flask. It combines table management, order entry, billing, catalogue administration, staff access, audit history, backups, and ESC/POS network printing in a responsive interface.

## The problem I wanted to solve

In many hospitality environments, operational information is distributed across different tools and manual procedures. Table availability may be tracked visually, orders may be written down or entered into a separate system, and changes may be communicated verbally between the service area, kitchen, and bar.

This approach can work during quiet periods. When activity increases, the possibility of errors grows. An order may be sent to the wrong printer, a deleted item may leave no trace, a table may remain incorrectly marked as occupied, or a split payment may require manual calculations.

TableMaster was designed so that these processes could become parts of the same connected workflow. A table’s status is connected to its active order. The order is connected to its items, the staff member who created it, and the relevant printers. Payments affect both the bill and the state of the order, which eventually determines whether the table can be released.

As a result, the application does not operate as a collection of unrelated pages. It behaves as a system in which every action affects the relevant data and updates the surrounding workflow.

## Why I selected Flask

I selected Flask for the backend because it allowed me to shape the application around the actual needs of the project without introducing unnecessary framework complexity.

TableMaster began as a unified application. As the number of features increased, it became necessary to separate the system into clearly defined domains. The routes were divided into modules for tables, orders, billing, catalogue management, settings, and administrative actions.

This separation made the code easier to understand and reduced the coupling between unrelated features. At the same time, the existing URLs and Flask endpoint names were kept stable, allowing the internal architecture to evolve without breaking the user interface.

Jinja templates, HTML, CSS, and JavaScript are used for presentation. The interface is designed to adapt to desktop computers, tablets, and mobile devices, which is particularly important for an application that may be accessed from several locations inside the same venue.

## Using SQLite for local operation

I selected SQLite for data storage. This keeps installation lightweight and allows the application to operate locally without requiring a separate database server.

The main database stores tables, reservations, orders, order items, categories, subcategories, products, users, bills, printers, company information, and general settings.

A second database is used specifically for audit records. Separating operational data from audit information allows important historical actions to be retained independently from the primary transaction database.

SQLite is not treated as a simple storage file. Relationships between records are central to the design. An order is linked to a table and a user. Products belong to categories. Categories are assigned to specific printers. Payments update the quantity of each item that has already been paid.

These relationships allow TableMaster to preserve a consistent view of the venue’s current state.

## Managing tables and the live floor state

The table screen is one of the main areas of the application. Each table has a number, capacity, assigned space, and current status.

The application distinguishes between free, occupied, and reserved tables. These states are not merely visual labels. They are updated as a direct result of actions performed inside the system.

When an order is created, the table becomes occupied. When the payment process is completed and the active order is closed, the table can become available again.

The floor view also considers reservations for the current date. The user therefore sees more than a static layout. The interface represents the operational availability of the venue.

TableMaster also generates a hash representing the current state of all tables. The frontend can check whether that hash has changed and refresh the displayed information only when an actual state change has occurred.

## The complete lifecycle of an order

Entering an order involves more than selecting a few products. Every item can include a quantity, comments, and related subcategory choices or options.

The application checks whether an active order already exists for the selected table. When no active order is found, a new one is created. Otherwise, the new products are added to the existing order.

Only active categories and products are presented in the order interface. This allows an administrator to temporarily deactivate an item without deleting the historical records of earlier orders that included it.

TableMaster also records which user created each order. Order history can be filtered by status, table, user, and date range. Administrators can review activity across the whole application, while regular staff members are limited to their own orders.

## Routing products to the correct printers

One of the most important TableMaster features is the ability to connect product categories to different network printers.

In a real restaurant environment, not every product should be printed in the same location. Drinks may need to reach the bar, food items may need to reach the kitchen, and internal receipts may require a separate printer.

An administrator can register ESC/POS printers using their IP addresses and associate each printer with one or more product categories. When an order is submitted, TableMaster groups the items according to their category and creates a separate print job for every relevant printer.

A single customer order can therefore be divided automatically and delivered to the correct operational areas without requiring the user to select printers manually.

## Designing for printer failure

Communication with a network printer cannot always be guaranteed. A printer may be switched off, disconnected from the network, or temporarily unavailable.

The easiest implementation would be to display an error and discard the attempt. In a real operational environment, that is not enough. An order should not disappear because a printer was unavailable for a few minutes.

Before printing, TableMaster checks whether the printer can be reached on the network. When the printer is available, the job is sent immediately. When it is unavailable, the order is stored in a pending print queue inside the database.

A background scheduler periodically checks this queue. When the printer becomes available again, the job is submitted and removed from the pending list.

The same approach is used for both order tickets and internal receipts. Administrators can view pending print jobs and cancel a job when necessary.

This became one of the most important technical aspects of the project because it required me to design not only for the successful path, but also for the moments when an external device fails.

## Billing, split payments, and order completion

A restaurant bill is not always paid as a single amount. Different guests may want to pay for selected products or separate parts of the same order.

TableMaster supports item-level bill splitting. The user can choose which products are being paid, and the application updates the corresponding paid quantities.

When all items in an order have been paid, the order is marked as completed. The system also stores information about the total amount and payment method.

TableMaster can generate and print an internal receipt using company information, prices, VAT rates, and the selected payment method.

This internal document supports the operational workflow of the application. It is not presented as a replacement for a certified fiscal device or legally compliant retail receipt system.

## Transferring orders between tables

Another common restaurant requirement is moving guests from one table to another.

TableMaster allows an active order to be transferred to a different table. When the destination table has no active order, the existing order is moved. When the destination table already contains an order, the items from both orders are merged.

After the transfer, the destination table is marked as occupied. The original table becomes free when it no longer has any active orders.

This feature demonstrates why the application needed to be designed as a connected system. A transfer involves more than changing a number. It must preserve the products, active order, and statuses of both tables consistently.

## Catalogue management and Excel workflows

TableMaster includes complete category, subcategory, and product management.

Categories can contain different VAT rates and can be linked to specific printers. Products can be created, edited, deactivated, and reactivated.

Products and categories use logical deactivation instead of permanent deletion. This allows an item to be removed from the active catalogue without damaging historical orders in which it was previously used.

The application also supports importing catalogue data from Excel files. Uploaded files are validated before processing, while Pandas and OpenPyXL are used to transform spreadsheet information into application records.

Order history can also be exported to a formatted Excel file, with filters for dates, order status, user, and table.

This allows TableMaster to work alongside a tool that businesses already use widely, rather than forcing every administrative process to take place exclusively inside the application.

## Users, roles, and sessions

Users access the application through an individual four-digit PIN. Each account has either an administrator or staff role, determining which areas and actions are available.

Administrative settings are restricted to administrators. Regular users can work with the everyday operational features without receiving access to user management, printer configuration, backups, or company details.

Sessions include a configurable inactivity timeout. Once the timeout is exceeded, the session is cleared and the user must authenticate again.

This is particularly useful on shared workstations or tablets that may be used by different members of staff during the same shift.

## Audit history and accountability

Deleting an item from an active restaurant order is an important action. It should not disappear without leaving a trace.

TableMaster maintains a separate audit log for deleted order items. Each record contains the product, table, user, and exact time of the action.

Administrators can filter the audit history by date and user. This provides a basic accountability layer without mixing audit records with the main operational database.

## Settings, company information, and backups

The application includes a central settings area for products, users, printers, receipt behaviour, company information, and general preferences.

An administrator can select the receipt printer, control whether a receipt should print when a table is closed, and configure the inactivity timeout.

Company details such as the business name, address, tax identification number, tax office, and phone number can be stored and used when generating internal documents.

TableMaster also provides database backup functionality. The main database and audit database are packaged together into a ZIP archive that can be downloaded by an administrator.

The restore process checks whether the archive contains the required database files, backs up the current files, and attempts to replace them with the uploaded versions. If the process fails, the previous databases can be restored.

## Offline-friendly design and PWA assets

TableMaster includes a web app manifest, service worker, and dedicated offline page.

This does not make every dynamic operation fully available offline, since orders and database operations still require communication with the local Flask server. It does, however, provide a more complete installable experience and handles situations in which the application temporarily cannot reach the server.

The responsive interface also allows TableMaster to be accessed from desktop computers, tablets, and mobile devices connected to the same local network.

## Installation licensing

The project includes a local installation licensing mechanism. The application reads an encrypted license key and compares it with an expected key derived from the machine’s MAC address.

When the license file is missing or does not match the current device, the main application does not start and a dedicated information page is displayed.

This is not intended to be a complex cloud licensing platform. It is a practical implementation of encryption, machine binding, and installation-level access control.

## Reorganizing the architecture

As TableMaster gained more functionality, keeping every route inside one application file would have made the project increasingly difficult to maintain.

The routes were therefore organized into separate modules based on their domain. Different modules handle core authentication, tables, orders, billing, catalogue management, settings, and administrative actions.

A similar approach was used on the frontend. Shared CSS components were separated from page-specific styling, while common JavaScript behaviour was organized independently from page-level interactions.

The repository also includes validation checks for Python syntax, database initialization, template parsing, static asset references, route coverage, and the absence of sensitive runtime files from the public source.

This restructuring was an important step because it moved TableMaster from an application that simply worked into a project that could continue to grow.

## The most important technical challenges

The greatest challenge was not creating a specific form or Flask route. It was maintaining consistency across several connected actions.

When an order is transferred, two tables must be updated. When the final product is removed from an order, the system must determine whether the order and table should remain active. When printing fails, the job must be preserved without being printed twice later. When a bill is divided, the application must know which products have already been paid.

SQLite also introduced real challenges when operations were performed from different threads. In areas where a temporary database lock could occur, retry logic was added instead of immediately discarding the operation.

These cases helped me understand that application reliability is not defined by how the system behaves when everything goes correctly. It is defined by its behaviour when a device is unavailable, a database is temporarily locked, or a user performs an unexpected sequence of actions.

## What I learned from building TableMaster

TableMaster was one of the projects that allowed me to connect several different areas of software development inside one system.

I needed to design the database schema, organize Flask routes, create responsive interfaces, manage sessions and permissions, process Excel files, and communicate with physical network devices.

The most important lesson was that a business application should not be designed only around its screens. It should be designed around the real processes of the people who will use it.

The floor view, for example, is not valuable simply because it displays coloured table cards. It is valuable because those cards represent the actual condition of the orders. The print queue is not valuable only as a technical feature. It is valuable because it protects an order when a printer fails.

This connection between technical implementation and operational value is what I consider the strongest aspect of the project.

## Limitations and future development

Although TableMaster already provides a complete functional foundation, several areas can be improved.

Authentication can be strengthened with hashed PINs, CSRF protection, stricter permission enforcement, and more robust secret and configuration management.

The database could eventually move to PostgreSQL for installations involving more simultaneous users or multiple locations. A database migration system would also make future schema changes safer and easier to manage.

The print queue could be moved to an independent worker service with more detailed retry policies, unique job identifiers, and stronger protection against duplicate printing.

Future functionality could also include inventory management, a complete reservation workflow, sales dashboards, a live kitchen display, push notifications, external API integrations, and synchronization between multiple installations.

For production deployment, the application could use a dedicated WSGI server, reverse proxy, HTTPS, centralized logging, and an automated update mechanism.

## Final thoughts

TableMaster began with the need to organize the daily operations of a hospitality venue inside one connected system.

It developed into a complete application combining backend development, database design, responsive frontend work, network communication, background processing, audit logging, and business logic.

It was not created as a theoretical Flask example. It was created as an attempt to translate a real operational process into software.

That is what TableMaster represents to me. The ability to observe a complex everyday workflow, divide it into manageable technical problems, and build a solution that connects every part into a consistent and extensible system.
