import React, { useState } from 'react';
import { X, Star, Send } from 'lucide-react';
import { Consultant } from '../types';

interface FeedbackModalProps {
  consultant: Consultant;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: {
    consultantId: string;
    message: string;
    rating: number;
    type: 'positive' | 'constructive' | 'neutral';
  }) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  consultant,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [type, setType] = useState<'positive' | 'constructive' | 'neutral'>('positive');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit({
        consultantId: consultant.id,
        message: message.trim(),
        rating,
        type
      });
      setMessage('');
      setRating(5);
      setType('positive');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Feedback para {consultant.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avaliação
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                >
                  <Star className="h-5 w-5 fill-current" />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Feedback
            </label>
            <div className="flex space-x-3">
              {[
                { value: 'positive', label: 'Positivo', color: 'bg-green-100 text-green-800' },
                { value: 'constructive', label: 'Construtivo', color: 'bg-yellow-100 text-yellow-800' },
                { value: 'neutral', label: 'Neutro', color: 'bg-gray-100 text-gray-800' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value as any)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    type === option.value 
                      ? option.color 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Escreva seu feedback aqui..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Send className="h-4 w-4" />
              <span>Enviar Feedback</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};