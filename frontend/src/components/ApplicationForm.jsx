import { useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

const ApplicationForm = ({ event, onClose, onSubmit }) => {
    const [paymentMethod, setPaymentMethod] = useState('');
    const [cond1, setCond1] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isPayant = event.price_fcfa > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isPayant && !paymentMethod) { setError("Veuillez sélectionner une méthode de paiement."); return; }
        if (!cond1) { setError("Veuillez accepter les conditions."); return; }

        setError('');
        setLoading(true);
        await onSubmit({
            motivation: '', experience: '', attentes: '',
            payment_method: isPayant ? paymentMethod : 'physical'
        });
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-stone-900/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto pt-24 pb-12">
            <div className="bg-white max-w-2xl w-full rounded-sm shadow-xl p-8 border border-stone-200 relative my-auto">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-stone-800 transition-colors">
                    <X size={24} />
                </button>

                <div className="mb-6 border-b border-stone-100 pb-4">
                    <h2 className="text-2xl font-serif text-stone-800 mb-1">Inscription à l'événement</h2>
                    <div className="text-sm text-stone-500 font-semibold mb-3 tracking-wider text-[#b89047]">{event.title} <span className="opacity-70 text-xs uppercase ml-2">({event.type})</span></div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-stone-600">
                        <div className="col-span-2 sm:col-span-1"><strong>Début:</strong> {new Date(event.date_start).toLocaleString('fr-FR')}</div>
                        <div className="col-span-2 sm:col-span-1"><strong>Fin:</strong> {new Date(event.date_end).toLocaleString('fr-FR')}</div>
                        <div className="col-span-2"><strong>Sites :</strong> {event.sites ? event.sites.join(', ') : 'À définir'}</div>
                        <div><strong>Prix:</strong> {isPayant ? `${event.price_fcfa} FCFA` : 'Gratuit'}</div>
                        <div><strong>Catégorie:</strong> {event.is_public ? 'Public' : 'Réservé aux membres'}</div>
                    </div>
                </div>

                {error && <p className="mb-4 text-red-700 bg-red-50 p-3 text-sm border border-red-200">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <p className="text-sm text-stone-600 mb-6 font-medium">Votre inscription sera immédiatement confirmée vis à vis de l'événement.</p>

                    {/* C. Payment */}
                    {isPayant && (
                        <div className="bg-stone-50 p-4 border border-stone-200 rounded-sm">
                            <label className="block text-sm font-semibold text-stone-700 mb-3">Méthode de Paiement <span className="text-red-500">*</span></label>
                            <div className="flex flex-col gap-3">
                                <label className="flex items-center gap-3 cursor-pointer p-3 border border-stone-200 hover:border-[#b89047] bg-white transition-colors">
                                    <input type="radio" name="payment" value="physical" onChange={e => setPaymentMethod(e.target.value)} />
                                    <span className="text-lg">💵</span> <span className="text-sm font-medium">Paiement en espèces (sur place lors de l'événement)</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 border border-stone-200 bg-white transition-colors opacity-50 cursor-not-allowed">
                                    <input type="radio" name="payment" value="momo" disabled />
                                    <span className="text-lg">📱</span> <span className="text-sm font-medium border-l border-stone-300 pl-3">Paiement par Mobile Money (Fonctionnalité future)</span>
                                </label>
                            </div>
                            <p className="mt-3 text-sm font-bold text-stone-800">Montant : {event.price_fcfa} FCFA</p>
                        </div>
                    )}

                    {/* D. Conditions */}
                    <div className="space-y-3 mt-6 border-t border-stone-100 pt-6">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" checked={cond1} onChange={e => setCond1(e.target.checked)} className="mt-1 accent-[#b89047]" />
                            <span className="text-xs text-stone-600">J'accepte de m'inscrire officiellement à cet événement.</span>
                        </label>
                    </div>

                    {/* E. Processus Alert */}
                    <div className="bg-[#b89047]/10 p-4 border border-[#b89047]/30 rounded-sm flex gap-3 text-sm text-[#8c6b30] mt-6">
                        <CheckCircle className="shrink-0 mt-0.5" size={18} />
                        <p>Votre inscription est directe et ne nécessite pas de validation des administrateurs.</p>
                    </div>

                    <div className="flex gap-4 justify-end pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 border border-stone-300 text-stone-600 hover:bg-stone-50 transition-colors uppercase tracking-wider text-sm font-semibold">
                            Annuler
                        </button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-[#b89047] text-white hover:bg-[#a37b3b] uppercase tracking-wider text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? "Envoi en cours..." : "Valider l'inscription"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplicationForm;
