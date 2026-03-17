"use client";
import "./orders.css";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { orderApi } from "@/lib/endpoints";
import { normalizeOrder } from "@/lib/normalizers";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
  { key: "returned", label: "Returned" },
];

function getStatusGroup(status) {
  const s = status?.toLowerCase();
  if (s === "delivered") return "delivered";
  if (s === "cancelled") return "cancelled";
  if (["return_requested", "return_approved", "returned", "refunded"].includes(s)) return "returned";
  return "active";
}

function getStatusClass(status) {
  const group = getStatusGroup(status?.toLowerCase());
  return `orders-status orders-status-${group === "active" ? "processing" : group}`;
}

/* SVG Icons */
function PackageIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6h12l1.5 12H4.5L6 6z" />
      <path d="M9 6V4a3 3 0 016 0v2" />
    </svg>
  );
}

function ReorderIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function RotateIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  );
}

function StatusIcon({ status }) {
  const s = status?.toLowerCase();
  if (s === "delivered") return <CheckCircleIcon />;
  if (s === "cancelled") return <XCircleIcon />;
  if (["return_requested", "return_approved", "returned", "refunded"].includes(s)) return <RotateIcon />;
  if (["shipped", "in_transit", "out_for_delivery"].includes(s)) return <TruckIcon />;
  return <ClockIcon />;
}

export default function OrdersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [returnOrderId, setReturnOrderId] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnSubmitted, setReturnSubmitted] = useState({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?redirect=/orders");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    orderApi.getMyOrders()
      .then((data) => {
        setOrders((data.orders || data || []).map(normalizeOrder));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const filteredOrders = filter === "all"
    ? orders
    : orders.filter((o) => getStatusGroup(o.status) === filter);

  const handleReorder = async (order) => {
    try {
      await orderApi.reorder(order._id || order.orderId);
    } catch {
      order.items.forEach((item) => {
        addToCart({ name: item.name, price: item.price, _id: item.product });
      });
    }
  };

  const handleReturnSubmit = async (orderId) => {
    if (!returnReason) return;
    try {
      await orderApi.requestReturn(orderId, returnReason);
      setReturnSubmitted((prev) => ({ ...prev, [orderId]: true }));
      setReturnOrderId(null);
      setReturnReason("");
    } catch { /* ignore */ }
  };

  if (authLoading) return null;
  if (!isAuthenticated) return null;

  return (
    <div className="orders-page">
      <div className="orders-header">
        <p className="orders-header-label">Your Account</p>
        <h1 className="orders-header-title">Orders</h1>
      </div>

      <div className="orders-content">
        {loading ? (
          <div className="orders-loading">
            <div className="orders-spinner" />
            <p className="orders-loading-text">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">
              <PackageIcon />
            </div>
            <h3 className="orders-empty-title">No Orders Yet</h3>
            <p className="orders-empty-text">Your order history will appear here</p>
            <Link href="/wardrobe" className="orders-shop-btn">Start Shopping</Link>
          </div>
        ) : (
          <>
            <div className="orders-filters">
              {STATUS_FILTERS.map(({ key, label }) => (
                <button
                  key={key}
                  className={`orders-filter-btn ${filter === key ? "active" : ""}`}
                  onClick={() => setFilter(key)}
                >
                  {label}
                  {key !== "all" && (
                    <> ({orders.filter((o) => getStatusGroup(o.status) === key).length})</>
                  )}
                </button>
              ))}
            </div>

            <div className="orders-list">
              {filteredOrders.length === 0 ? (
                <div className="orders-empty">
                  <p className="orders-empty-text">No orders in this category</p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const oid = order._id || order.orderId || order.id;
                  return (
                    <div key={oid} className="orders-card">
                      <div className="orders-card-header">
                        <div>
                          <p className="orders-card-id">Order #{order.orderId || order.id}</p>
                          <p className="orders-card-date">{order.date}</p>
                        </div>
                        <span className={getStatusClass(order.status)}>
                          <StatusIcon status={order.status} />
                          {order.status}
                        </span>
                      </div>

                      <div className="orders-items">
                        {order.items.map((item, idx) => {
                          const img = item.image || item.product?.primaryImage || "/images/placeholder.jpg";
                          return (
                            <div key={idx} className="orders-item">
                              <img src={img} alt={item.name} className="orders-item-img" />
                              <div className="orders-item-info">
                                <p className="orders-item-name">{item.name}</p>
                                <p className="orders-item-meta">
                                  Qty: {item.qty || item.quantity}
                                  {item.size ? ` / ${item.size}` : ""}
                                </p>
                              </div>
                              <span className="orders-item-price">
                                &#8377;{item.price * (item.qty || item.quantity)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="orders-card-footer">
                        <div>
                          <p className="orders-total-label">Total</p>
                          <p className="orders-total-amount">&#8377;{order.total || order.pricing?.total}</p>
                        </div>
                        <div className="orders-actions">
                          <button className="orders-reorder-btn" onClick={() => handleReorder(order)}>
                            <ReorderIcon />
                            Order Again
                          </button>
                          {order.status?.toLowerCase() === "delivered" && !returnSubmitted[oid] && (
                            <button
                              className="orders-return-btn"
                              onClick={() => setReturnOrderId(returnOrderId === oid ? null : oid)}
                            >
                              Return / Refund
                            </button>
                          )}
                          {returnSubmitted[oid] && (
                            <span className="orders-return-submitted">
                              <CheckCircleIcon />
                              Request submitted
                            </span>
                          )}
                        </div>
                      </div>

                      {returnOrderId === oid && (
                        <div className="orders-return-form">
                          <label className="orders-return-label">Reason for return</label>
                          <select
                            className="orders-return-select"
                            value={returnReason}
                            onChange={(e) => setReturnReason(e.target.value)}
                          >
                            <option value="">Select a reason</option>
                            <option value="Damaged product">Damaged product</option>
                            <option value="Wrong product">Wrong product</option>
                            <option value="Not as described">Not as described</option>
                            <option value="Size issue">Size issue</option>
                            <option value="Other">Other</option>
                          </select>
                          <button
                            className="orders-return-submit"
                            onClick={() => handleReturnSubmit(oid)}
                            disabled={!returnReason}
                          >
                            Submit Request
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
