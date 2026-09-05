# Notifications — Bildirishnomalar

## Waiter calling / ready-order notification

- `table:waiter_called` and kitchen/bar `READY` notifications are Waiter-only.
- Ready notifications listen to the existing `order:status_updated` / `order:status_changed` events.
- When an order becomes `tayyor`, the Waiter receives table, order number and food items in real time.
- If the backend includes an assigned waiter on the order/table, the frontend filters the event to that waiter.
- Duplicate ready events for the same order are ignored.
