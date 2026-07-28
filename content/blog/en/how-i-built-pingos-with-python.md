---
title: How I Built PingOS with Python
date: 2026-07-28
excerpt: From Reactive IT Support to Proactive Monitoring
category: Monitoring
tags:
  - Python
  - PyQt5
  - Network Monitoring
  - IT Automation
  - Systems Administration
  - Microsoft Teams
  - SQLite
  - Incident Response
  - Desktop Application
cover: https://i.ibb.co/CZNLCLM/dc3248f7-d51d-42a7-b197-ed44e63e7489.png
featured: true
translation_key: building-pingos-python-network-monitoring
---
In day-to-day IT operations, many incidents begin with a deceptively simple question. Is the reported device actually offline, or is the problem caused by temporary packet loss, network latency, or a different part of the infrastructure?

When only one device needs to be checked, the answer can usually be found with a simple ping command. The process becomes more complicated when an environment includes switches, access points, printers, servers, workstations, and other network-connected devices. Opening multiple command-line windows may provide a temporary view, but it does not create a reliable monitoring workflow. It does not preserve context, distinguish intermittent packet loss from a sustained outage, or automatically inform the team when a device changes state.

This practical problem led me to build PingOS, a lightweight Windows desktop application developed with Python and PyQt5. My objective was not to recreate a large enterprise monitoring platform. I wanted to design a focused and accessible tool that could provide immediate visibility, reduce repetitive manual checks, and improve the first stage of incident investigation.

PingOS 2.1.0 can monitor multiple IPv4 hosts concurrently, track latency and packet-loss statistics, identify sustained outages through configurable thresholds, and deliver notifications through Windows, email, and Microsoft Teams.

### The problem behind the project

The ping command remains one of the most useful tools in technical support. However, it is reactive by nature. Someone must first notice a problem, report it, and wait for the IT team to begin investigating. By that time, the device may already be available again, or the failure may be intermittent and difficult to reproduce.

There is also the risk of drawing the wrong conclusion from a single result. One lost packet does not necessarily mean that a device is offline. The cause may be temporary congestion, delayed responses, or ICMP rate limiting. A useful monitoring application needs to evaluate a sequence of results rather than treat one unsuccessful response as a confirmed outage.

For that reason, I wanted PingOS to do more than display whether a device answered. It needed to monitor behaviour over time, distinguish temporary packet loss from a confirmed interruption, and notify the user only when a meaningful state change occurred.

### Moving beyond a basic script

Sending a ping request with Python can be achieved with only a small amount of code. Building a complete application around that request requires considerably more work. It involves state management, concurrent operations, persistent data, notification services, configuration, error handling, and a user interface that remains usable while continuous network checks are taking place.

I selected PyQt5 for the graphical interface. It provides the components required for a complete desktop application, including windows, menus, dialogs, background threads, signals, system tray integration, and configurable controls. Unlike a command-line utility, PingOS can present the condition of multiple devices in a single view and make critical changes immediately visible.

The application uses the ping3 library for ICMP checks. SQLite is used for local alias storage, while JSON files store device groups and application preferences. Email notifications are delivered through SMTP with STARTTLS, and Microsoft Teams integration is implemented through a Teams Workflows webhook using Adaptive Cards.

Each technology has a specific responsibility. PyQt5 manages presentation and interaction. Ping3 performs the network checks. SQLite stores reusable device information. JSON provides portable configuration, while SMTP and Teams deliver alerts outside the application.

### Keeping the interface responsive

One of the most important architectural decisions was separating network activity from the main graphical interface thread.

A ping request does not always return immediately. It may wait for a timeout, be retried several times, or fail because of a temporary network condition. If those operations were performed inside the same thread responsible for drawing and updating the application window, the interface would freeze whenever a device was slow to respond.

To avoid this, PingOS creates an independent QThread worker for each monitored host. Every worker performs its own ping cycle, maintains its packet counters, and tracks the state of the assigned device. Results are transmitted to the main application through PyQt signals, allowing the interface to update safely without blocking user interaction.

This approach is appropriate for the current purpose and intended scale of the application. Each host maintains independent state, and a delay affecting one device does not stop the monitoring of others. For a significantly larger environment involving hundreds or thousands of targets, a future version could use a controlled worker pool or an asynchronous architecture.

### Reducing false alerts

One of the main weaknesses of simple monitoring scripts is that they often treat every unsuccessful response as an outage. This creates unnecessary alerts and eventually reduces confidence in the monitoring system.

PingOS uses configurable retries and a consecutive-loss threshold. Before a monitoring cycle is considered unsuccessful, the application can attempt the ping several times. If the host continues to provide no response, the consecutive-loss counter is increased. The device is marked offline only when the configured threshold has been reached.

A similar principle is applied during recovery. A single successful response does not necessarily mean that the connection has stabilized. PingOS waits for multiple consecutive successful responses before returning the device to an online state.

This creates a simple but effective state model. A device may be available, begin showing packet loss, become offline after repeated failures, and return online once its recovery has been confirmed. This approach gives more operational value to the displayed status and reduces unnecessary notifications.

### Turning monitoring data into actionable information

Collecting network results is not enough if the user cannot quickly identify what requires attention. PingOS therefore uses clear visual states for the main monitoring outcomes.

Successful responses are displayed in green, detected packet loss is shown in yellow, and a confirmed outage appears in red. Each device entry includes its alias, IP address, current latency or condition, and the total number of packets sent, received, and lost.

One of the most practical features is the automatic movement of offline devices to the top of the list. In an environment containing multiple entries, a critical result should not remain hidden among healthy devices. The application prioritizes exceptions and helps the user focus immediately on the host that requires investigation.

PingOS also supports both global and individual controls. The user can start or stop all monitoring operations, while a context menu allows a specific host to be started, stopped, renamed, or removed without interrupting the rest of the session.

### Sending notifications only when the state changes

A monitoring system can quickly become disruptive if it repeatedly sends the same message. If a device remains offline for ten minutes, sending another alert after every unsuccessful ping creates noise rather than useful information.

PingOS tracks both the current and previous state of each host. Notifications are triggered when a real transition is detected, such as a device moving from online to offline or recovering from an outage. This reduces alert fatigue and makes every notification more meaningful.

The application supports three notification channels. Local Windows notifications are displayed through the system tray and are useful when PingOS is running on an administrator’s workstation. Email alerts are delivered through a configurable SMTP server. Microsoft Teams notifications are sent through a Teams Workflows webhook.

For Microsoft Teams, PingOS generates an Adaptive Card containing the event title, device information, timestamp, and a different visual state depending on whether the event represents an outage or a recovery. The application also checks the webhook response and records communication failures without interrupting the main monitoring process.

### Saving devices and configuration

IP addresses are not always easy to recognize, especially when an administrator manages multiple device types. PingOS therefore allows every IP address to be associated with a meaningful alias.

Aliases are stored in a local SQLite database and are also used by the application’s autocomplete function. As the user types, PingOS searches both saved IP addresses and device names for matching suggestions.

Groups of hosts can be exported to JSON files and loaded again in future sessions. This makes it possible to maintain separate monitoring collections for different offices, buildings, departments, or equipment categories.

A separate JSON file stores application preferences, including ping intervals, timeouts, packet sizes, retry attempts, consecutive-loss thresholds, enabled notification channels, interface colors, and font size.

The combination of SQLite and JSON serves two different needs. SQLite retains reusable local device information, while JSON provides portable groups and configuration.

### Building a tool rather than a temporary script

During development, I tried to approach PingOS as a complete product rather than a temporary script. The application therefore includes dedicated dialogs for ping behaviour, display preferences, and notification settings.

Users can change the interval, timeout, packet size, retry count, and loss threshold without editing the source code. They can also customize state colors, font size, email configuration, and the Microsoft Teams webhook.

PingOS also includes an embedded user manual, an About dialog, a system tray icon, context menus, and keyboard shortcuts for common actions. These details are not directly related to the ICMP checks, but they have a significant effect on usability and help turn the project into a complete desktop application.

### What I learned from building PingOS

PingOS began as a solution to a practical operational requirement, but it developed into a broader software-design exercise. The most difficult part was not sending an ICMP request. The real challenge was coordinating everything around it.

The project required concurrent processing, state transitions, communication between workers and the user interface, persistent data, external integrations, and defensive error handling.

It also reinforced an important principle of IT automation. Automation is not valuable only because it reduces the number of manual actions required to complete a task. It creates real value when it improves visibility, reduces uncertainty, organizes information, and helps people respond to incidents faster and with greater confidence.

### Limitations and next steps

PingOS 2.1.0 provides a functional foundation, but there are several areas that can be improved.

The current application focuses on IPv4 addresses and ICMP monitoring. A future release could support hostnames, IPv6, TCP port checks, HTTP endpoints, DNS queries, and service-specific health checks.

Monitoring history is currently retained during the active session, but it is not yet persisted or presented through charts and reports. Storing results and outage events in SQLite would make it possible to introduce incident timelines, latency charts, and historical comparisons.

Secure credential storage is another important improvement. SMTP credentials are currently stored locally with the rest of the application settings. A future version should use the operating system’s credential manager or another secure storage mechanism.

The thread-per-host architecture works well at the scale for which PingOS was designed. For larger deployments, I would consider a controlled worker pool or an asynchronous monitoring engine. Additional improvements include unit and integration tests, structured and rotating logs, report exports, improved packaging, and an update mechanism.

### Final thoughts

PingOS was not created to replace platforms such as Zabbix, PRTG, Nagios, or Prometheus. It was designed to address a more focused requirement. It provides an administrator with immediate visibility across a selected group of network devices without requiring a complex deployment or continuous manual checks.

Building it allowed me to transform a basic diagnostic process into a complete application with concurrency, state management, persistence, configuration, notifications, and a graphical interface.

The project also represents how I generally approach IT challenges. I begin by understanding the operational requirement, identify the repetitive or unreliable parts of the current process, and design a practical solution that can be used, evaluated, and continuously improved.

PingOS remains an evolving project, but its central objective is already clear. It transforms reactive network checks into proactive, organized, and actionable monitoring.
