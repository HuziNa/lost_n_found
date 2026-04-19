export const SAMPLE_ORDERS = [
  {
    id: "SC-20260413-001",
    date: "Today, 1:42 PM",
    name: 'Custom Medium 8" Cake',
    items: [
      "Strawberry frosting",
      "Blush Pink",
      "2 Layers",
      "Fresh Fruits",
    ],
    price: 1310,
    status: "preparing",
    timeline: [
      { label: "Order Placed", icon: "orders", done: true, time: "1:42 PM" },
      { label: "Confirmed", icon: "check", done: true, time: "1:45 PM" },
      { label: "Preparing", icon: "cake", active: true, time: "In progress" },
      { label: "Out for Delivery", icon: "truck", done: false, time: "—" },
      { label: "Delivered", icon: "box", done: false, time: "—" },
    ],
  },
  {
    id: "SC-20260410-087",
    date: "Apr 10, 2026",
    name: "Red Velvet Dream",
    items: ["Standard size"],
    price: 1350,
    status: "delivered",
    timeline: [
      { label: "Order Placed", icon: "orders", done: true, time: "9:15 PM" },
      { label: "Confirmed", icon: "check", done: true, time: "9:18 PM" },
      { label: "Preparing", icon: "cake", done: true, time: "9:40 PM" },
      { label: "Out for Delivery", icon: "truck", done: true, time: "10:05 PM" },
      { label: "Delivered", icon: "box", done: true, time: "10:34 PM" },
    ],
  },
];
