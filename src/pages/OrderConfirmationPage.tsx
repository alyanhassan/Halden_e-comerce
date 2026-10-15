import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Truck, Mail, MapPin } from 'lucide-react';
import { getOrderById } from '../services/orderService';
import { getStoredProducts } from '../services/productService';
import { Order } from '../types';
import { formatCurrency } from '../utils/currency';
import { Img } from '../components/common/Img';
import { usePageMeta } from '../hooks/usePageMeta';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  usePageMeta({
    title: id ? `Order ${id}` : 'Order Confirmation',
    description: 'Confirmation and receipt details for your Halden order.',
  });
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getOrderById(id).then((ord) => {
        setOrder(ord);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-24 text-center font-mono text-xs">
        Loading receipt confirmation...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-display text-3xl text-[#111111]">Order Not Found</h2>
        <p className="text-xs text-[#111111]/70">
          We could not locate an order with ID "{id}".
        </p>
        <Link
          to="/shop"
          className="inline-block px-6 py-3 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="border-2 border-[#111111] bg-[#FAEDCD] p-6 sm:p-10 space-y-8">
        
        {/* Thank You Header */}
        <div className="text-center space-y-3 pb-6 border-b border-[#111111]">
          <div className="inline-flex p-3 bg-[#CCD5AE] border border-[#111111] text-[#111111]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <p className="font-cta text-xs uppercase tracking-widest text-[#111111]/70">
            Order Confirmed
          </p>
          <h1 className="font-display text-3xl sm:text-4xl text-[#111111]">
            Thank you, {order.customer.name.split(' ')[0]}.
          </h1>
          <p className="text-xs text-[#111111]/80 max-w-md mx-auto">
            Your garments are now registered in our fulfillment system and scheduled for dispatch.
          </p>
        </div>

        {/* Mock Confirmation Email Sent Note */}
        <div className="p-3 bg-[#FEFAE0] border border-[#111111] flex items-center gap-3 text-xs">
          <Mail className="w-4 h-4 text-[#111111] flex-shrink-0" />
          <p className="text-[#111111]/90">
            A confirmation receipt and courier tracking link has been sent to{' '}
            <strong className="underline">{order.customer.email}</strong>.
          </p>
        </div>

        {/* Order Meta Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#FEFAE0] border border-[#111111] text-xs font-mono">
          <div>
            <p className="text-[#111111]/60 uppercase text-[10px]">Order Number</p>
            <p className="font-bold text-[#111111]">{order.id}</p>
          </div>
          <div>
            <p className="text-[#111111]/60 uppercase text-[10px]">Date Placed</p>
            <p className="font-bold text-[#111111]">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-[#111111]/60 uppercase text-[10px]">Delivery Mode</p>
            <p className="font-bold text-[#111111] capitalize">{order.deliveryMethod || 'Standard'}</p>
          </div>
          <div>
            <p className="text-[#111111]/60 uppercase text-[10px]">Status</p>
            <p className="font-bold text-emerald-800">{order.status}</p>
          </div>
        </div>

        {/* Items Ordered List */}
        <div className="space-y-3">
          <h3 className="font-cta text-xs uppercase tracking-wider text-[#111111]">
            Garments in Order ({order.items.length})
          </h3>
          <div className="border border-[#111111] bg-[#FEFAE0] divide-y divide-[#111111]">
            {order.items.map((item, idx) => {
              const matchedProd = getStoredProducts().find((p) => p.id === item.productId);
              const itemImg = matchedProd?.images?.[0] || '';

              return (
                <div key={idx} className="p-3 sm:p-4 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    {itemImg && (
                      <div className="w-12 h-14 flex-shrink-0 overflow-hidden border border-[#111111]/30">
                        <Img
                          src={itemImg}
                          alt={item.name}
                          aspectRatio="4:5"
                          size={500}
                          objectPosition="center 20%"
                          className="w-full h-full"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm text-[#111111]">{item.name}</p>
                      <p className="text-[#111111]/70 font-mono mt-0.5">
                        Size: {item.size} · Color: {item.color} · Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-mono tabular-nums font-bold text-sm whitespace-nowrap">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Address, Delivery & Payment Methods, Totals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          
          {/* Shipping Address */}
          <div className="p-4 bg-[#E9EDC9] border border-[#111111] space-y-2 text-xs">
            <h4 className="font-cta text-[11px] uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Shipping Address</span>
            </h4>
            <p className="font-bold">{order.customer.name}</p>
            <p>{order.customer.address} {order.customer.apartment && `· ${order.customer.apartment}`}</p>
            <p>{order.customer.city}, {order.customer.state || ''} {order.customer.postalCode}</p>
            <p>{order.customer.country}</p>
            {order.customer.phone && <p className="font-mono text-[11px] pt-1">Tel: {order.customer.phone}</p>}
          </div>

          {/* Totals Summary */}
          <div className="p-4 bg-[#FEFAE0] border border-[#111111] space-y-2 text-xs">
            <h4 className="font-cta text-[11px] uppercase tracking-wider text-[#111111]">
              Totals & Payment
            </h4>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono tabular-nums">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-800">
                <span>Discount ({order.promoCode || '10%'}):</span>
                <span className="font-mono tabular-nums">-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>
                Shipping ({order.deliveryMethod === 'express' ? 'Express Courier' : 'Standard Delivery'}):
              </span>
              <span className="font-mono tabular-nums">
                {order.shipping === 0 ? 'FREE' : formatCurrency(order.shipping)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-[#111111] pt-2">
              <span>Total Paid:</span>
              <span className="font-mono tabular-nums">{formatCurrency(order.total)}</span>
            </div>
            <p className="text-[10px] text-[#111111]/70 font-mono pt-1">
              Payment Method:{' '}
              {order.paymentMethod === 'cod'
                ? 'Cash on Delivery'
                : order.paymentDetails?.last4
                ? `Card (${order.paymentDetails.brand ? order.paymentDetails.brand.toUpperCase() : 'CARD'} ending in ${order.paymentDetails.last4})`
                : 'Credit Card (Prepaid)'}
            </p>
          </div>

        </div>

        {/* Buttons "TRACK ORDER" and "CONTINUE SHOPPING" */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-[#111111]">
          <Link
            to={`/track?orderId=${order.id}&email=${encodeURIComponent(order.customer.email)}`}
            className="w-full sm:w-auto px-6 py-3.5 border-2 border-[#111111] bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase hover:bg-[#333333] transition-colors text-center"
          >
            Track Order
          </Link>
          <Link
            to="/shop"
            className="w-full sm:w-auto px-6 py-3.5 border-2 border-[#111111] bg-[#FEFAE0] text-[#111111] font-cta text-xs uppercase hover:bg-[#E9EDC9] transition-colors text-center"
          >
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
};
