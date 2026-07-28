---
title: "From Reactive IT Support to Proactive Monitoring: How I Built PingOS
  with Python"
date: 2026-07-28
excerpt: Designing a lightweight desktop application for multi-host monitoring,
  actionable alerts, and faster incident response.
category: Monitoring
featured: true
translation_key: "1"
---
In IT operations, many incidents begin with a deceptively simple question: is the affected device actually offline, or is the reported problem caused by temporary packet loss, a delayed response, or another part of the infrastructure?

Answering that question manually is easy when only one device is involved. The situation becomes more complicated when an IT team needs visibility across multiple access points, switches, printers, servers, workstations, or other network-connected devices. Opening several command-line windows and repeatedly running ping commands may provide a temporary answer, but it does not create a reliable monitoring workflow. It also does not preserve context, prioritize failures, or inform the right people when the state of a device changes.

This practical problem led me to build **PingOS**, a lightweight desktop network-monitoring application developed with Python and PyQt5. My goal was not to recreate a large enterprise monitoring platform. I wanted to create a focused tool that could provide immediate visibility, reduce repetitive checks, and make everyday troubleshooting more efficient.

The current version, PingOS 2.1.0, can monitor multiple IPv4 hosts concurrently, track latency and packet-loss statistics, detect outages using configurable thresholds, and send alerts through Windows notifications, email, and Microsoft Teams.

## The problem I wanted to solve

Traditional ping commands are useful diagnostic tools, but they are reactive by nature. Someone first needs to notice a problem, report it, and ask the IT team to investigate. The technician then checks the suspected device and tries to determine whether the failure is current, intermittent, or already resolved.

This process creates several limitations. A single unsuccessful ping can generate a false impression of an outage. Monitoring many devices manually is difficult to organize. Important failures can become lost among healthy results. There is also no automatic mechanism for informing the team when a device goes offline or returns to service.

I wanted PingOS to address these limitations through a simple visual workflow. The application needed to continuously check multiple devices without freezing the interface, distinguish temporary packet loss from a sustained outage, highlight the most urgent results, and send notifications only when a meaningful state transition occurred.

From the beginning, I defined several practical requirements:

1. Monitor multiple hosts concurrently.
2. Keep the desktop interface responsive during continuous checks.
3. Track latency, successful responses, and lost packets.
4. Avoid declaring a device offline after one isolated failure.
5. Notify users when a device goes down and when it recovers.
6. Allow different environments or device groups to be saved and loaded.
7. Preserve host aliases and application preferences between sessions.
8. Keep the tool simple enough to use during an active incident.

These requirements shaped both the architecture and the interface of the application.

## Choosing the technology stack

I selected Python because it allowed me to move quickly while maintaining access to strong libraries for networking, desktop interfaces, databases, HTTP communication, and email integration.

The main user interface is built with **PyQt5**. Unlike a basic command-line utility, a graphical application can present the status of many devices in a single view and make critical results immediately visible. PyQt5 also provides signals, slots, background threads, dialogs, system-tray integration, menus, and configurable interface components.

For network checks, PingOS uses the **ping3** library. Local data is stored with **SQLite**, while JSON files are used for portable host groups and application settings. Email alerts are delivered through SMTP with TLS, and Microsoft Teams notifications are sent through a Teams Workflows webhook using Adaptive Card payloads.

The main technologies used in the project are:

`Python`

`PyQt5`

`ping3`

`SQLite`

`JSON`

`SMTP with STARTTLS`

`Microsoft Teams Workflows`

`Adaptive Cards`

`Requests`

`QThread and PyQt signals`

Each technology has a focused responsibility. PyQt5 manages presentation and user interaction. `ping3` performs the network checks. SQLite retains aliases and supports host suggestions. JSON handles settings and portable host collections. SMTP and Teams provide external notification channels.

## Designing a responsive monitoring architecture

One of the most important technical decisions was separating network monitoring from the graphical interface.

A continuous ping operation should never run directly inside the main UI thread. Network requests involve waiting, timeouts, retries, and unpredictable response times. If those tasks are performed in the same thread that draws and updates the interface, the entire application can become unresponsive.

PingOS therefore creates an independent `QThread` worker for each monitored host. Every worker performs its own ping cycle, maintains its own counters, and reports results to the main interface through a PyQt signal.

`class PingThread(QThread):`

`    result_signal = pyqtSignal(`

`        str,`

`        float,`

`        int,`

`        int,`

`        int,`

`        bool,`

`        bool`

`    )`

The signal carries the host address, response time, packet counters, success status, and current offline state. The main application receives this information and safely updates the corresponding item in the user interface.

Conceptually, the application follows this structure:

This design keeps the application responsive while several devices are being checked simultaneously. It also isolates the state of each host, which makes the monitoring logic easier to understand and maintain.

A thread-per-host architecture is appropriate for the intended scale of the current application. For much larger environments containing hundreds or thousands of targets, I would consider an asynchronous model or a controlled worker pool to reduce the number of operating-system threads.

## Reducing false alerts with state-based monitoring

A monitoring application should not treat every lost packet as a confirmed outage. Networks can experience brief interruptions, delayed responses, rate limiting, or isolated packet loss without a device being genuinely unavailable.

PingOS uses configurable retries and a consecutive-loss threshold before changing a host to an offline state. During each monitoring cycle, the worker can perform multiple attempts before recording the check as unsuccessful.

When no response is received, the worker increments both the total number of lost packets and the number of consecutive failures. A device is marked offline only after the configured threshold has been reached.

This approach creates a simple state model:

The distinction between packet loss and a confirmed outage is important. It reduces alert fatigue and gives the displayed status more operational value. A temporary failure is still visible, but it does not immediately trigger the same response as a sustained interruption.

The application also tracks the total number of packets sent, received, and lost for each host. When a response is successful, the result is converted into milliseconds and displayed alongside those statistics.

## Turning monitoring data into actionable information

Collecting results is only one part of a monitoring tool. The information must also be presented in a way that helps someone make decisions quickly.

PingOS uses three visual states:

Each entry displays the alias, IP address, current latency or status, and packet statistics. The colors can be customized from the display settings, along with the font size.

One of the most practical interface decisions was automatically moving an offline host to the top of the list. In an environment containing many devices, a critical result should not remain hidden somewhere in the middle of the interface.

This is a small implementation detail, but it reflects an important principle in operational software: the interface should prioritize exceptions rather than force the user to search for them.

PingOS also provides controls for starting or stopping all monitors, as well as a context menu for managing individual hosts. Users can start or stop a selected check, edit an alias, or remove an entry without interrupting the rest of the monitoring session.

## Alerting only when the state changes

Repeated alerts can quickly make a monitoring system unusable. If a device remains offline for ten minutes, sending a new notification after every failed check would create noise instead of helping the team.

PingOS keeps track of both the current and previous offline state. Notifications are triggered when the application detects a meaningful transition, such as a host changing from online to offline or from offline back to online.

The application currently supports three alert channels.

### Windows system notifications

The built-in system-tray integration can display immediate local notifications. This is useful when PingOS is running on an administrator’s workstation and the application is not currently in the foreground.

### Email notifications

Email alerts are sent through a configurable SMTP server. The connection uses `STARTTLS`, and users can define the SMTP host, port, sender account, recipient, and authentication details.

Email is useful when an event needs to remain visible outside the application or when alerts must reach someone who is not currently monitoring the desktop interface.

### Microsoft Teams notifications

PingOS also integrates with Microsoft Teams through a Workflows webhook. The application generates an Adaptive Card containing the event title, device information, timestamp, and a status color.

A device-down event is shown with an attention state, while a recovery uses a positive state. The payload is sent through an HTTP request, and the application records whether the request was accepted or rejected.

This integration was especially valuable as a development exercise because it required more than simply sending text to a URL. I needed to structure the payload correctly, handle HTTP response codes, catch connection exceptions, and provide useful logging when delivery failed.

## Saving hosts, aliases, and monitoring groups

IP addresses are not always easy to recognize during an incident. An address such as `192.168.1.25` is less meaningful than an alias such as `Reception Printer` or `Main Office Switch`.

PingOS stores IP addresses and aliases in a local SQLite database. Parameterized SQL statements are used when reading and writing records.

The same database supports autocomplete suggestions. As the user enters text, the application searches both saved IP addresses and aliases and displays matching results.

Monitoring environments can also be exported to and imported from JSON files. A user can create separate groups for different offices, buildings, departments, or device categories and load the appropriate collection when needed.

Application preferences are stored separately in `settings.json`. These include ping intervals, timeouts, packet sizes, retry attempts, alert thresholds, notification preferences, display colors, and font size.

This combination provides two different forms of persistence. SQLite manages reusable local host information, while JSON provides portability for groups and application configuration.

## Configuration without editing source code

A useful operational tool should allow its behaviour to be adjusted without requiring someone to modify Python code.

PingOS includes dedicated settings dialogs for monitoring, appearance, and notifications. Users can configure:

These options make the application adaptable to different environments. A local printer may require a different monitoring interval from a critical server. A slower network connection may need a longer timeout. A team may prefer Teams alerts, while an individual administrator may only need local notifications.

The application also includes an embedded user manual and an About dialog, making the project feel like a complete desktop product rather than an isolated script.

## Technical challenges and design decisions

Building PingOS reinforced several lessons that apply to many IT automation and systems-engineering projects.

### A successful prototype still needs structure

A simple ping script can be written in a few lines. Turning that script into a usable application requires state management, concurrency, configuration, error handling, data persistence, notifications, and interface design.

The difficult part was not sending the ICMP request. The real challenge was coordinating the surrounding workflow reliably.

### Monitoring is based on state, not individual results

A failed check does not always represent an outage. Reliable monitoring requires context. Consecutive failures, retries, previous state, and recovery confirmation are all more meaningful than a single Boolean result.

This principle applies beyond ICMP monitoring. The same approach can be used for services, APIs, scheduled tasks, storage systems, and cloud resources.

### The interface is part of the operational solution

Moving failed hosts to the top, using clear status colors, supporting aliases, and allowing individual monitors to be controlled are not purely visual improvements. They reduce the time required to locate and interpret a problem.

For operational software, usability can directly affect incident-response speed.

### External integrations need defensive error handling

SMTP servers, webhook endpoints, and network requests can fail independently from the monitoring process. PingOS records these errors through Python logging rather than allowing a notification failure to terminate the entire application.

This separation is important. A device’s status should still be monitored even if one alert channel is temporarily unavailable.

## What I would improve next

PingOS 2.1.0 provides a functional foundation, but reviewing the current implementation also identified several valuable next steps.

The first improvement would be secure credential storage. The current configuration model stores application settings locally, including SMTP credentials. A future version should use the operating system’s credential manager or a library such as `keyring`, rather than storing passwords directly in a JSON file.

The application already collects timestamped results in memory, but the next version should expose that history through charts, event timelines, and exportable reports. Persisting results in SQLite would allow users to review outages and latency patterns after the application has restarted.

I would also extend monitoring beyond IPv4 and ICMP. Support for hostnames, TCP ports, HTTP endpoints, DNS checks, and service-level health tests would make the application useful for a wider range of systems.

Other planned technical improvements include:

These improvements would move PingOS from a focused desktop utility toward a more extensible monitoring platform, while preserving the simplicity that motivated the original project.

## What I learned from building PingOS

PingOS started as a solution to a familiar operational problem, but it became a broader exercise in software design.

The project helped me combine several areas of my professional experience: network troubleshooting, Python development, desktop interfaces, concurrent processing, data persistence, notification systems, and user-focused IT operations.

More importantly, it reinforced the value of transforming repeated manual work into a structured process. Automation is not only about reducing the number of clicks required to complete a task. Effective automation should improve visibility, reduce uncertainty, preserve useful context, and help people respond to problems more confidently.

That is the principle behind PingOS. Instead of waiting for someone to report that a device may be unavailable, the application continuously evaluates its state, presents the relevant information, and communicates meaningful changes through the channels the team already uses.

## Final thoughts

PingOS is intentionally lightweight. It does not attempt to replace platforms such as Zabbix, PRTG, Nagios, or Prometheus. Its value lies in providing a focused and accessible workflow for situations where an administrator needs immediate visibility across a selected group of network devices.

Building it allowed me to move beyond a one-off diagnostic script and create a complete desktop application with concurrency, state management, persistence, configuration, notifications, and documentation.

The project also represents the way I approach IT challenges more generally. I begin by understanding the operational problem, identify the repetitive or unreliable parts of the existing process, and then design a practical solution that can be tested, improved, and used by others.

PingOS remains an evolving project, but its central objective is already clear: turn reactive network checks into proactive, actionable monitoring.
