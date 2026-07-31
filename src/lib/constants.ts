export const ORDER_STATUS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  IN_TRANSIT: "In Transit",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
} as const;

export const PAYMENT_METHODS = {
  COD: "Cash on Delivery",
  ONLINE: "Online Payment",
} as const;

export const PAYMENT_STATUS = {
  UNPAID: "Unpaid",
  PAID: "Paid",
  REFUNDED: "Refunded",
} as const;

export const USER_ROLES = {
  CUSTOMER: "CUSTOMER",
  OWNER: "OWNER",
  ADMIN: "ADMIN",
} as const;

export const TRUCK_TYPES = [
  { name: "Small Truck (3-wheel)", capacity: 1000, label: "~1,000 bricks" },
  { name: "Mini Truck (6-wheel)", capacity: 2000, label: "~2,000 bricks" },
  { name: "Medium Truck (6-wheel)", capacity: 3500, label: "~3,500 bricks" },
  { name: "Large Truck (10-wheel)", capacity: 6000, label: "~6,000 bricks" },
  { name: "Tractor Trolley", capacity: 2500, label: "~2,500 bricks" },
  { name: "Heavy Trailer", capacity: 10000, label: "~10,000 bricks" },
] as const;

export const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-300",
  PROCESSING: "bg-indigo-100 text-indigo-800 border-indigo-300",
  IN_TRANSIT: "bg-purple-100 text-purple-800 border-purple-300",
  DELIVERED: "bg-green-100 text-green-800 border-green-300",
  CANCELLED: "bg-red-100 text-red-800 border-red-300",
};
