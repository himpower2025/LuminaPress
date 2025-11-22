
import React, { useState, useMemo } from 'react';
import { Book, PaymentMethod } from '../types';
import { FaCreditCard, FaCoins, FaCheckCircle, FaGift, FaCcVisa, FaCcMastercard, FaTimes } from 'react-icons/fa';
import { priceToNumber } from '../utils/currency';

interface PurchaseModalProps {
  book: Book;
  userPoints: number;
  onClose: () => void;
  onConfirmPurchase: (book: Book, paymentMethod: PaymentMethod) => void;
  onConfirmGift: (book: Book, recipientEmail: string, message: string, paymentMethod: PaymentMethod) => void;
}

type View = 'main' | 'pay_options' | 'gift' | 'success_purchase' | 'success_gift';

const fonepayLogo = "data:image/png;base64,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---";

const PurchaseModal: React.FC<PurchaseModalProps> = ({ book, userPoints, onClose, onConfirmPurchase, onConfirmGift }) => {
  const [view, setView] = useState<View>('main');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [giftMessage, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isGifting, setIsGifting] = useState(false);

  const bookPrice = useMemo(() => priceToNumber(book.price), [book.price]);
  const canAffordWithPoints = userPoints >= bookPrice;

  const handlePurchase = () => {
    if (isGifting) {
      // Basic validation
      if (!recipientEmail || !/^\S+@\S+\.\S+$/.test(recipientEmail)) {
        alert("Please enter a valid recipient email.");
        return;
      }
      onConfirmGift(book, recipientEmail, giftMessage, paymentMethod);
      setView('success_gift');
    } else {
      onConfirmPurchase(book, paymentMethod);
      setView('success_purchase');
    }
  };

  const renderMainView = () => (
    <>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Your Purchase</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">You're about to get a great new book!</p>
      </div>
      <div className="flex gap-6 my-6">
        <img src={book.coverUrl} alt={book.title} className="w-24 h-36 object-cover rounded-md shadow-lg flex-shrink-0" />
        <div className="text-left">
          <h3 className="text-lg font-bold">{book.title}</h3>
          <p className="text-sm text-gray-500">{book.author}</p>
          <p className="text-xl font-extrabold text-primary-600 mt-4">{book.price}</p>
        </div>
      </div>
      <div className="space-y-4">
        <button onClick={() => { setIsGifting(false); setView('pay_options'); }} className="w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary-700 transition-all duration-300">
          Buy for Myself
        </button>
        <button onClick={() => { setIsGifting(true); setView('gift'); }} className="w-full flex items-center justify-center gap-2 bg-secondary-200 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-100 font-bold py-3 px-4 rounded-lg hover:bg-secondary-300 dark:hover:bg-secondary-600 transition-colors">
          <FaGift />
          Send as a Gift
        </button>
      </div>
    </>
  );

  const renderPayOptionsView = () => (
    <>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How would you like to pay?</h2>
        <p className="font-bold text-primary-600 text-lg mt-2">{book.price}</p>
      </div>
      <div className="my-6 space-y-4">
        <button onClick={() => setPaymentMethod('card')} className={`w-full text-left p-4 border rounded-lg flex items-center justify-between transition-all ${paymentMethod === 'card' ? 'border-primary-500 ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600'}`}>
          <div>
            <p className="font-bold">Credit/Debit Card</p>
            <p className="text-xs text-gray-500">Earn { (bookPrice * 0.10).toFixed(2) } points</p>
          </div>
          <div className="flex items-center gap-2 text-2xl text-gray-400">
            <FaCcVisa /> <FaCcMastercard />
          </div>
        </button>
        <button onClick={() => setPaymentMethod('fonepay')} className={`w-full text-left p-4 border rounded-lg flex items-center justify-between transition-all ${paymentMethod === 'fonepay' ? 'border-primary-500 ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600'}`}>
          <div>
            <p className="font-bold">Fonepay</p>
            <p className="text-xs text-gray-500">Earn { (bookPrice * 0.10).toFixed(2) } points</p>
          </div>
          <img src={fonepayLogo} alt="Fonepay Logo" className="h-8 object-contain" />
        </button>
        <button onClick={() => { if(canAffordWithPoints) setPaymentMethod('points'); }} disabled={!canAffordWithPoints} className={`w-full text-left p-4 border rounded-lg flex items-center justify-between transition-all ${paymentMethod === 'points' ? 'border-primary-500 ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600'} ${!canAffordWithPoints && 'opacity-50 cursor-not-allowed'}`}>
          <div>
            <p className="font-bold">Use My Points</p>
            <p className="text-xs text-gray-500">You have {userPoints.toFixed(2)} points</p>
          </div>
          <FaCoins className="text-2xl text-yellow-500" />
        </button>
         {!canAffordWithPoints && (
          <p className="text-xs text-center text-red-500">Not enough points for this purchase.</p>
        )}
      </div>
      <div className="space-y-4">
        <button onClick={handlePurchase} className="w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary-700 transition-all duration-300">
          Confirm Purchase
        </button>
        <button onClick={() => isGifting ? setView('gift') : setView('main')} className="w-full text-gray-600 dark:text-gray-300 font-semibold py-2">Back</button>
      </div>
    </>
  );
  
  const renderGiftView = () => (
     <>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gift "{book.title}"</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">A thoughtful gift for a fellow reader.</p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); setView('pay_options'); }} className="my-6 space-y-4">
        <div>
          <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recipient's Email</label>
          <input 
            type="email" 
            id="recipientEmail" 
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div>
          <label htmlFor="giftMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gift Message (Optional)</label>
          <textarea 
            id="giftMessage" 
            value={giftMessage}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
         <div className="space-y-4 pt-2">
          <button type="submit" className="w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary-700 transition-all duration-300">
            Proceed to Payment
          </button>
          <button type="button" onClick={() => setView('main')} className="w-full text-gray-600 dark:text-gray-300 font-semibold py-2">Back</button>
        </div>
      </form>
    </>
  );

  const renderSuccessView = () => (
    <div className="text-center p-8">
        <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isGifting ? 'Gift Sent!' : 'Purchase Successful!'}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
            {isGifting ? `"${book.title}" has been sent to ${recipientEmail}.` : `"${book.title}" has been added to your library.`}
        </p>
        <button onClick={onClose} className="mt-6 w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary-700 transition-all duration-300">
            Continue Reading
        </button>
    </div>
  );

  const renderContent = () => {
    switch(view) {
      case 'main':
        return renderMainView();
      case 'pay_options':
        return renderPayOptionsView();
      case 'gift':
        return renderGiftView();
      case 'success_purchase':
      case 'success_gift':
        return renderSuccessView();
      default:
        return renderMainView();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 ease-out" onClick={(e) => e.stopPropagation()}>
        {view !== 'success_purchase' && view !== 'success_gift' && (
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <FaTimes size={20} />
          </button>
        )}
        {renderContent()}
      </div>
    </div>
  );
};

export default PurchaseModal;
