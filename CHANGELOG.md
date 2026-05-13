# Changelog - Guy Man Order Management System

All notable changes made during this session are documented below.

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
*Powered by Antigravity AI*
