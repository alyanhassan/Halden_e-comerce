import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, CheckCircle2, Clock, AlertCircle, PackageCheck, Truck, ShieldCheck } from 'lucide-react';
import { getOrderByNumberAndEmail } from '../services/orderService';
import { Order, OrderStatus } from '../types';
import { formatCurrency } from '../utils/currency';
import { usePageMeta } from '../hooks/usePageMeta';

const STATUS_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'Placed', label: 'Placed', desc: 'Order received and registered' },
  { status: 'Processing', label: 'Processing', desc: 'Garments verified & boxed at depot' },
  { status: 'Shipped', label: 'Shipped', desc: 'Handed over to carrier dispatch' },
  { status: 'Out for delivery', label: 'Out for Delivery', desc: 'Courier on local delivery route' },
  { status: 'Delivered', label: 'Delivered', desc: 'Delivered to recipient address' },
];

export const TrackOrderPage: React.FC = () => {
  usePageMeta({
    title: 'Track Order',
    description: 'Track the delivery status and timeline of your Halden shipment.',
  });

  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('orderId') || '';
  const initialEmail = searchParams.get('email') || '';

  const [orderIdInput, setOrderIdInput] = useState(initialId);
  const [emailInput, setEmailInput] = useState(initialEmail);
  const [order, setOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialId && initialEmail) {
      handleLookup(initialId, initialEmail);
    }
  }, [initialId, initialEmail]);

  const handleLookup = async (idToUse?: string, emailToUse?: string) => {
    const id = (idToUse || orderIdInput).trim();
    const email = (emailToUse || emailInput).trim();

    if (!id || !email) {
      setErrorMessage('Please provide both your order number and customer email address.');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setErrorMessage(null);

    const found = await getOrderByNumberAndEmail(id, email);
    setLoading(false);

    if (found) {
      setOrder(found);
    } else {
      setOrder(null);
      setErrorMessage(
        `No order found matching "${id}" for "${email}". Please verify the order number and email from your confirmation receipt.`
      );
    }
  };

  const getStepIndex = (status: OrderStatus): number => {
    return STATUS_STEPS.findIndex((s) => s.status.toLowerCase() === status.toLowerCase());
  };

  const currentStepIdx = order ? getStepIndex(order.status) : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Page Header */}
      <div className="pb-4 border-b-2 border-[#111111] mb-8">
        <h1 className="font-display text-4xl sm:text-5xl text-[#111111]">
          Track Your Delivery
        </h1>
        <p className="text-xs text-[#111111]/70 font-mono mt-1">
          Enter your order reference (e.g. HLD-XXXXXX) and email to view real-time fulfillment milestones.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="border-2 border-[#111111] bg-[#FAEDCD] p-6 mb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-cta uppercase mb-1">
                Order Number *
              </label>
              <input
                type="text"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="HLD-842910"
                className="w-full px-3 py-2.5 bg-[#FEFAE0] border border-[#111111] text-xs font-mono uppercase focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-cta uppercase mb-1">
                Customer Email *
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="julian@halden.com"
                className="w-full px-3 py-2.5 bg-[#FEFAE0] border border-[#111111] text-xs focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase hover:bg-[#333333] transition-colors flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Locating Record...' : 'Track Order'}</span>
          </button>
        </form>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-red-100 border border-red-800 text-red-900 text-xs flex items-center gap-3 mb-8">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-800" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Order Status Display */}
      {order && (
        <div className="border-2 border-[#111111] bg-[#FEFAE0] p-6 sm:p-10 space-y-8">
          
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-[#111111]">
            <div>
              <p className="text-[10px] font-cta uppercase tracking-widest text-[#111111]/60">
                Logistics Dispatch Status
              </p>
              <h2 className="font-display text-3xl text-[#111111]">
                Order {order.id}
              </h2>
              <p className="text-xs text-[#111111]/80 mt-0.5">
                Recipient: <strong>{order.customer.name}</strong> · Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="px-4 py-2 bg-[#CCD5AE] border border-[#111111] text-[#111111] text-center w-fit">
              <p className="text-[10px] uppercase font-mono">Current Status</p>
              <p className="font-cta text-sm uppercase">{order.status}</p>
            </div>
          </div>

          {/* Status Timeline */}
          <div>
            <h3 className="font-cta text-xs uppercase tracking-wider text-[#111111] mb-6">
              Milestone Timeline
            </h3>

            {/* Desktop / Tablet Timeline Step Bar */}
            <div className="hidden md:grid grid-cols-5 gap-2 relative">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                const isFuture = idx > currentStepIdx;

                const historyEntry = order.statusHistory?.find(
                  (h) => h.status.toLowerCase() === step.status.toLowerCase()
                );

                return (
                  <div
                    key={step.status}
                    className={`p-3 border-2 transition-colors relative flex flex-col justify-between ${
                      isCurrent
                        ? 'border-[#111111] bg-[#CCD5AE]'
                        : isPassed
                        ? 'border-[#111111] bg-[#E9EDC9]'
                        : 'border-[#111111]/30 bg-[#FAEDCD]/40 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] font-bold">0{idx + 1}</span>
                        {isPassed || isCurrent ? (
                          <CheckCircle2 className="w-4 h-4 text-[#111111]" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 opacity-40" />
                        )}
                      </div>
                      <p className="font-cta text-xs uppercase">{step.label}</p>
                      <p className="text-[10px] text-[#111111]/70 mt-1 leading-snug">
                        {step.desc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#111111]/20 font-mono text-[10px]">
                      {historyEntry ? (
                        <span className="text-[#111111] font-bold">
                          {new Date(historyEntry.timestamp).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      ) : (
                        <span className="text-[#111111]/40">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Vertical Timeline */}
            <div className="md:hidden space-y-3">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                const historyEntry = order.statusHistory?.find(
                  (h) => h.status.toLowerCase() === step.status.toLowerCase()
                );

                return (
                  <div
                    key={step.status}
                    className={`p-3 border-2 flex items-start gap-3 ${
                      isCurrent
                        ? 'border-[#111111] bg-[#CCD5AE]'
                        : isPassed
                        ? 'border-[#111111] bg-[#E9EDC9]'
                        : 'border-[#111111]/20 bg-[#FAEDCD]/40 opacity-50'
                    }`}
                  >
                    <span className="font-mono text-xs font-bold pt-0.5">0{idx + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-cta text-xs uppercase">{step.label}</p>
                        {historyEntry && (
                          <span className="font-mono text-[10px] text-[#111111]/70">
                            {new Date(historyEntry.timestamp).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#111111]/80 mt-0.5">{step.desc}</p>
                      {historyEntry?.note && (
                        <p className="text-[10px] font-mono italic text-[#111111]/70 mt-1">
                          "{historyEntry.note}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Event Log Notes */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="p-4 bg-[#FAEDCD] border border-[#111111] space-y-2">
              <h4 className="font-cta text-xs uppercase tracking-wider text-[#111111]">
                Fulfillment Event Logs
              </h4>
              <div className="space-y-1.5 text-xs font-mono divide-y divide-[#111111]/15">
                {order.statusHistory.map((item, i) => (
                  <div key={i} className="pt-1.5 flex flex-col sm:flex-row justify-between text-[#111111]">
                    <span>
                      <strong>{item.status}:</strong> {item.note || 'Milestone logged.'}
                    </span>
                    <span className="text-[#111111]/60 text-[11px]">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Package Details & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="p-4 bg-[#E9EDC9] border border-[#111111] space-y-1.5 text-xs">
              <h4 className="font-cta text-[11px] uppercase tracking-wider text-[#111111]">
                Delivery Destination
              </h4>
              <p className="font-bold">{order.customer.name}</p>
              <p>{order.customer.address} {order.customer.apartment && `· ${order.customer.apartment}`}</p>
              <p>{order.customer.city}, {order.customer.state || ''} {order.customer.postalCode}</p>
              <p>{order.customer.country}</p>
            </div>

            <div className="p-4 bg-[#FAEDCD] border border-[#111111] space-y-1.5 text-xs">
              <h4 className="font-cta text-[11px] uppercase tracking-wider text-[#111111]">
                Package Contents ({order.items.length} items)
              </h4>
              <div className="max-h-28 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
                {order.items.map((i, idx) => (
                  <p key={idx} className="truncate">
                    • {i.name} ({i.color}, {i.size}) × {i.quantity}
                  </p>
                ))}
              </div>
              <p className="text-xs pt-1 border-t border-[#111111]/20 font-bold">
                Total: {formatCurrency(order.total)}
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
