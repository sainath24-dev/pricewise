/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  Lock,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  X,
  ArrowLeft,
  Smartphone,
  Building,
} from 'lucide-react';
import { useApp } from '../../store/appContext';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CheckoutStep = 'cart' | 'payment' | 'success';
type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'cod';

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateCartQty, clearCart, cartTotal, formatCurrency } = useApp();

  const [step, setStep] = useState<CheckoutStep>('cart');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [orderNumber, setOrderNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock Form Fields
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardName, setCardName] = useState('Sainath Kumar');
  const [upiId, setUpiId] = useState('sainath@oksbi');

  if (!isOpen) return null;

  const baseTotal = cart.reduce((sum, item) => sum + item.product.basePrice * item.quantity, 0);
  const netSavings = baseTotal - cartTotal;

  const handleStartPayment = () => {
    setStep('payment');
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const generatedOrder = `PW-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderNumber(generatedOrder);
      setStep('success');
    }, 1000);
  };

  const handleFinishAndReset = () => {
    clearCart();
    setStep('cart');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl border border-[#e5e7eb] overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4 shrink-0 bg-white">
          <div className="flex items-center gap-2">
            {step === 'payment' && (
              <button
                onClick={() => setStep('cart')}
                className="rounded-full p-1 text-[#64748b] hover:bg-[#f1f5f9] mr-1 cursor-pointer"
                title="Back to Cart"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <ShoppingBag className="h-4 w-4 text-[#00D4A4]" />
            <h3 className="text-sm sm:text-base font-bold text-[#0c0d0e] tracking-tight">
              {step === 'cart' && `Shopping Cart (${cart.length} item${cart.length === 1 ? '' : 's'})`}
              {step === 'payment' && 'Secure Checkout & Payment'}
              {step === 'success' && 'Order Confirmed'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0c0d0e] transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* STEP 1: CART ITEMS REVIEW */}
        {step === 'cart' && (
          <>
            {cart.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-[#0c0d0e]">Your cart is empty</h4>
                  <p className="text-xs text-[#64748b] max-w-xs mx-auto">
                    Browse our live product catalog to add items with real-time dynamic prices.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full bg-[#0c0d0e] text-white hover:bg-[#1e2025] px-6 py-2.5 text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 divide-y divide-[#e5e7eb]">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="pt-3 first:pt-0 flex items-center justify-between gap-3 sm:gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.product.image}
                          alt={item.product.title}
                          className="h-14 w-14 rounded-xl object-cover bg-neutral-100 shrink-0 border border-[#e5e7eb]"
                        />
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="text-xs font-bold text-[#0c0d0e] truncate max-w-[180px] sm:max-w-xs">
                            {item.product.title}
                          </h4>
                          <p className="text-[11px] text-[#64748b]">{item.product.category}</p>
                          <div className="flex items-baseline gap-2 font-mono text-xs">
                            <span className="font-bold text-[#0c0d0e]">
                              {formatCurrency(item.product.dynamicPrice)}
                            </span>
                            {item.product.dynamicPrice !== item.product.basePrice && (
                              <span className="text-[10px] text-[#94a3b8] line-through">
                                {formatCurrency(item.product.basePrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity & Remove */}
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="flex items-center rounded-full border border-[#e5e7eb] bg-[#f8fafc]">
                          <button
                            onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                            className="px-2.5 py-1 text-xs font-bold text-[#64748b] hover:text-[#0c0d0e] cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="px-1.5 font-mono text-xs font-bold text-[#0c0d0e]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                            className="px-2.5 py-1 text-xs font-bold text-[#64748b] hover:text-[#0c0d0e] cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1.5 text-[#94a3b8] hover:text-rose-600 transition cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Order Summary & Checkout Button */}
                <div className="border-t border-[#e5e7eb] bg-[#f8fafc] p-4 sm:p-5 space-y-3 shrink-0">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#64748b]">
                      <span>List Price Subtotal:</span>
                      <span className="font-mono">{formatCurrency(baseTotal)}</span>
                    </div>

                    {netSavings !== 0 && (
                      <div className="flex justify-between text-[#059669] font-medium">
                        <span className="flex items-center gap-1">
                          Dynamic Pricing Savings:
                        </span>
                        <span className="font-mono font-bold">
                          {netSavings > 0
                            ? `-${formatCurrency(netSavings)}`
                            : `+${formatCurrency(Math.abs(netSavings))}`}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-[#64748b]">
                      <span className="flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5 text-[#00D4A4]" /> Express Delivery:
                      </span>
                      <span className="text-[#059669] font-bold uppercase text-[11px]">FREE</span>
                    </div>

                    <div className="flex justify-between font-bold text-sm text-[#0c0d0e] pt-2 border-t border-[#e5e7eb]">
                      <span>Total to Pay:</span>
                      <span className="font-mono text-base font-bold text-[#0c0d0e]">
                        {formatCurrency(cartTotal)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <button
                      onClick={clearCart}
                      className="rounded-full border border-[#e5e7eb] bg-white px-4 py-2.5 text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9] transition cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleStartPayment}
                      className="flex-1 rounded-full bg-[#0c0d0e] hover:bg-[#1e2025] text-white py-2.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer"
                    >
                      <Lock className="h-3.5 w-3.5 text-[#00D4A4]" />
                      <span>Proceed to Payment ({formatCurrency(cartTotal)})</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* STEP 2: PAYMENT GATEWAY */}
        {step === 'payment' && (
          <form onSubmit={handleExecutePayment} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Shipping Address Summary */}
              <div className="rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-3 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#64748b] tracking-wider block">
                    Delivering To
                  </span>
                  <span className="font-semibold text-[#0c0d0e]">
                    Sainath • 104, Tech Residency, Bengaluru, KA - 560001
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#059669] bg-[#d1fae5] px-2 py-0.5 rounded-full">
                  Express 1-Day
                </span>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0c0d0e]">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`rounded-xl p-2.5 border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                      paymentMethod === 'card'
                        ? 'border-[#0c0d0e] bg-[#f1f5f9] font-bold text-[#0c0d0e]'
                        : 'border-[#e5e7eb] text-[#64748b] hover:bg-[#f8fafc]'
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span className="text-xs">Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`rounded-xl p-2.5 border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                      paymentMethod === 'upi'
                        ? 'border-[#0c0d0e] bg-[#f1f5f9] font-bold text-[#0c0d0e]'
                        : 'border-[#e5e7eb] text-[#64748b] hover:bg-[#f8fafc]'
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                    <span className="text-xs">UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`rounded-xl p-2.5 border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                      paymentMethod === 'netbanking'
                        ? 'border-[#0c0d0e] bg-[#f1f5f9] font-bold text-[#0c0d0e]'
                        : 'border-[#e5e7eb] text-[#64748b] hover:bg-[#f8fafc]'
                    }`}
                  >
                    <Building className="h-4 w-4" />
                    <span className="text-xs">Net Banking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`rounded-xl p-2.5 border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                      paymentMethod === 'cod'
                        ? 'border-[#0c0d0e] bg-[#f1f5f9] font-bold text-[#0c0d0e]'
                        : 'border-[#e5e7eb] text-[#64748b] hover:bg-[#f8fafc]'
                    }`}
                  >
                    <Truck className="h-4 w-4" />
                    <span className="text-xs">Pay on Delivery</span>
                  </button>
                </div>
              </div>

              {/* Card Form */}
              {paymentMethod === 'card' && (
                <div className="rounded-xl border border-[#e5e7eb] p-3.5 space-y-3 bg-white">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#64748b]">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-xs font-mono font-semibold text-[#0c0d0e] focus:border-[#00D4A4] focus:outline-hidden"
                        placeholder="4242 4242 4242 4242"
                        required
                      />
                      <span className="absolute right-3 top-2.5 text-[10px] font-bold text-[#64748b] uppercase">
                        Visa / RuPay
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#64748b]">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-xs font-mono font-semibold text-[#0c0d0e] focus:border-[#00D4A4] focus:outline-hidden"
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#64748b]">CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-xs font-mono font-semibold text-[#0c0d0e] focus:border-[#00D4A4] focus:outline-hidden"
                        placeholder="•••"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#64748b]">Name on Card</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-xs font-semibold text-[#0c0d0e] focus:border-[#00D4A4] focus:outline-hidden"
                      placeholder="Cardholder Name"
                      required
                    />
                  </div>
                </div>
              )}

              {/* UPI Option */}
              {paymentMethod === 'upi' && (
                <div className="rounded-xl border border-[#e5e7eb] p-4 space-y-3 bg-white text-center">
                  <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-xl bg-[#f8fafc] border border-dashed border-[#cbd5e1] p-2">
                    <QrCode className="h-24 w-24 text-[#0c0d0e]" />
                  </div>
                  <p className="text-xs text-[#64748b]">
                    Scan QR code with any UPI App (Google Pay, PhonePe, Paytm, BHIM)
                  </p>
                  <div className="space-y-1 text-left">
                    <label className="text-[11px] font-semibold text-[#64748b]">Or Enter UPI ID / VPA</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-xs font-mono font-semibold text-[#0c0d0e] focus:border-[#00D4A4] focus:outline-hidden"
                      placeholder="username@okhdfcbank"
                    />
                  </div>
                </div>
              )}

              {/* NetBanking */}
              {paymentMethod === 'netbanking' && (
                <div className="rounded-xl border border-[#e5e7eb] p-3.5 space-y-2 bg-white">
                  <label className="text-[11px] font-semibold text-[#64748b]">Popular Banks</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((b) => (
                      <button
                        type="button"
                        key={b}
                        className="rounded-lg border border-[#e5e7eb] p-2.5 text-left font-semibold text-[#0c0d0e] hover:bg-[#f1f5f9] hover:border-[#0c0d0e] cursor-pointer"
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* COD */}
              {paymentMethod === 'cod' && (
                <div className="rounded-xl border border-[#e5e7eb] p-4 bg-[#f8fafc] space-y-2 text-xs">
                  <span className="font-bold text-[#0c0d0e] block">Pay Upon Delivery</span>
                  <p className="text-[#64748b] leading-relaxed">
                    Pay securely using Cash, UPI, or Card at your doorstep when the delivery partner arrives.
                  </p>
                </div>
              )}

              {/* SSL & PCI Trust Badges */}
              <div className="flex items-center justify-center gap-4 text-[11px] text-[#64748b] pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#00D4A4]" /> 256-Bit SSL Encrypted
                </span>
                <span>•</span>
                <span>PCI-DSS Level 1 Compliant</span>
              </div>
            </div>

            {/* Bottom Pay CTA */}
            <div className="border-t border-[#e5e7eb] bg-white p-4 sm:p-5 shrink-0 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-[#64748b] uppercase font-bold block">
                  Amount to Pay
                </span>
                <span className="font-mono text-base font-bold text-[#0c0d0e]">
                  {formatCurrency(cartTotal)}
                </span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="rounded-full bg-[#0c0d0e] hover:bg-[#1e2025] text-white px-6 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-sm transition active:scale-98 disabled:opacity-75 cursor-pointer"
              >
                {isProcessing ? (
                  <span>Processing Payment...</span>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5 text-[#00D4A4]" />
                    <span>Pay {formatCurrency(cartTotal)}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: ORDER CONFIRMED */}
        {step === 'success' && (
          <div className="p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#d1fae5] text-[#059669]">
              <CheckCircle2 className="h-8 w-8 text-[#00D4A4]" />
            </div>

            <div className="space-y-1">
              <span className="rounded-full bg-[#00D4A4]/20 px-3 py-1 text-xs font-bold text-[#059669] inline-block">
                Payment Authorized
              </span>
              <h4 className="text-xl font-bold text-[#0c0d0e]">
                Order Confirmed!
              </h4>
              <p className="font-mono text-xs text-[#64748b]">
                Reference ID: <strong className="text-[#0c0d0e]">{orderNumber}</strong>
              </p>
            </div>

            <p className="text-xs text-[#64748b] max-w-sm mx-auto leading-relaxed">
              Your items have been locked at the real-time dynamic rates and sent to our fulfilment center.
            </p>

            <div className="rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-4 text-xs font-mono space-y-1.5 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-[#64748b]">Total Paid:</span>
                <span className="font-bold text-[#0c0d0e]">{formatCurrency(cartTotal)}</span>
              </div>
              {netSavings > 0 && (
                <div className="flex justify-between text-[#059669] font-bold">
                  <span>Dynamic Savings:</span>
                  <span>{formatCurrency(netSavings)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#64748b] pt-1 border-t border-[#e5e7eb]">
                <span>Status:</span>
                <span className="text-[#059669] font-sans font-semibold">Preparing Dispatch</span>
              </div>
            </div>

            <button
              onClick={handleFinishAndReset}
              className="rounded-full bg-[#0c0d0e] hover:bg-[#1e2025] text-white px-8 py-2.5 text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
