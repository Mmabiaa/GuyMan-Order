# Changelog - Guy Man Order Management System

All notable changes made during this session are documented below.

## [2.3.0] - 2026-05-13

### Added
- **Triple-View Mobile Interface**: Split the Orders page into three dedicated tabs for mobile users: **New Order** (Form), **Active** (Pending List), and **History** (Transactions). This maximizes screen space and focus for each task.
- **Improved Navigation**: Added a **Logout (Exit)** button to the mobile bottom navigation for faster session management.
- **Smart View Transition**: Added logic to automatically switch to the 'Active' orders view after placing a new order on mobile, streamlining the workflow.
- **App-Like Feel**: Enhanced the bottom navigation with high-definition icons, backdrop blur effects, and active state animations.

## [2.2.0] - 2026-05-13

### Added
- **Order Editing**: Active (Pending) orders can now be edited directly from the Orders list. You can update customer details and individual item quantities.
- **Order Deletion**: Added a delete (trash) icon for active orders to allow removal of mistakes.
- **Improved Spacing**: Increased the vertical gap between the Place Order form and the Orders List for better visual separation.
- **"Orders List" Header**: Standardized the header for the pending orders section.
- **Swagger Documentation**: Automated OpenAPI specification and Swagger UI (at `/v1/docs`) for easy API testing and reference.
- **Analytical Logging**: Implemented a custom server-side logger that tracks request methods, URLs, and payloads for real-time debugging. It includes automatic **security redaction** to ensure passwords and sensitive tokens are never stored in logs.

### Fixed
- **Quantity Input Fix**: Quantity inputs in the order form can now be easily erased (empty state supported) without being forced back to "1" instantly.
- **Selective Date Filtering**: Date range filtering now only applies to the "All History" tab. Daily transactions remain focused on today's logs only.
- **Docs Redirection**: Added root and `/docs` redirects to the versioned documentation endpoint.

### Improved
- **Transaction Visibility**: History view now shows all transactions regardless of payment status, while the revenue card continues to track only confirmed PAID amounts.

## [2.1.0] - 2026-05-13

### Added
- **Flexible Payment Management**: Payment status (Paid, Unpaid, Pending) can now be edited directly from the "Daily Transactions" table.
- **Advanced Date Filtering**: Added date range filters (Start Date & End Date) to both Daily and Historical transaction views.
- **24-Hour Revenue Rule**: Implemented a logic where transactions only join the "All History" total revenue after they are older than 24 hours.
- **UI Improvements**: 
    - Added "Available Orders" header to the active orders list.
    - Updated Transaction view header to display the current date dynamically.
    - Added "Clear All" functionality to filters.
    - Enhanced table responsiveness and visual hierarchy with bold typography and refined spacing.

### Changed
- **Unified Update Endpoint**: Consolidated payment confirmation into a flexible `update-payment-status` API.
- **Filtering Logic**: Transactions history now keeps payment status filters active even when filtering by date.
- **Revenue Calculation**: historical revenue now strictly follows the 24-hour maturation rule to avoid mixing current day's volatile data with finalized history.

### Security & Data Integrity
- **Atomicity**: All status updates use atomic database operations (`findOneAndUpdate`) to prevent data loss or race conditions.
- **Persistence**: Transactions are archived immediately upon order completion; payment status changes are persisted in real-time.

---
*Powered by Mmabiaa-CS*
