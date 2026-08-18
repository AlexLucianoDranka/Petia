'use client';

import React, { useState } from 'react';
import { Star, CheckCircle2, Dog, Heart } from 'lucide-react';
import Link from 'next/link';

export default function AvaliacaoPublicaPage({ params }: { params: { id: string } }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Save review in local storage or DB
    const newReview = {
      id: `rev-${Date.now()}`,
      appointment_id: params.id,
      rating,
      comment,
      created_at: new Date().toISOString(),
      customer_name: 'Mariana Santos',
      pet_name: 'Thor',
    };
    const existing = JSON.parse(localStorage.getItem('petia_reviews') || '[]');
    localStorage.setItem('petia_reviews', JSON.stringify([newReview, ...existing]));
  };

  return (
    <div className="min-h-screen bg-st-navy text-st-arctic flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-8 rounded-2xl border border-st-border shadow-2xl space-y-6 animate-fade-up">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-st-electric/15 border border-st-electric/30 text-st-electric flex items-center justify-center mx-auto">
            <Dog className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Como foi seu atendimento?</h1>
          <p className="text-xs text-st-muted">
            Sua opinião ajuda a <strong className="text-st-arctic">Petia Vila Madalena</strong> a oferecer o melhor cuidado para seu pet!
          </p>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 bg-st-success/20 text-st-success rounded-full flex items-center justify-center mx-auto border border-st-success/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-extrabold text-white">Obrigado pela sua avaliação!</h2>
            <p className="text-xs text-st-muted">
              Sua avaliação de <strong className="text-yellow-400">{rating} estrelas</strong> foi registrada com sucesso.
            </p>
            <div className="pt-2">
              <span className="text-[11px] text-st-muted flex items-center justify-center gap-1">
                Feito com <Heart className="w-3 h-3 text-red-400 fill-current inline" /> no Petia
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating Select */}
            <div className="space-y-2 text-center">
              <label className="block text-xs font-semibold text-st-muted uppercase tracking-wider">
                Sua nota para o atendimento
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-9 h-9 ${
                        (hoverRating || rating) >= star
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-st-muted/40'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-st-electric block">
                {rating === 5 && 'Excelente'}
                {rating === 4 && 'Muito Bom'}
                {rating === 3 && 'Razoável'}
                {rating === 2 && 'Ruim'}
                {rating === 1 && 'Muito Ruim'}
              </span>
            </div>

            {/* Comment Area */}
            <div>
              <label className="block text-xs font-semibold text-st-muted mb-1">
                Deixe um comentário (opcional)
              </label>
              <textarea
                rows={3}
                placeholder="Ex: O Dr. Lucas atendeu o Thor com muito carinho e paciência..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic text-xs focus:border-st-electric outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-st-electric hover:bg-st-steel text-white font-extrabold text-sm shadow-glow transition-all whitespace-nowrap"
            >
              Enviar Avaliação
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
