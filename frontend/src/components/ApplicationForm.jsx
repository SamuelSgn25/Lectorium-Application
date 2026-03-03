import { useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

const ApplicationForm = ({ event, onClose, onSubmit }) => {
    const [motivation, setMotivation] = useState('');
    const [experience, setExperience] = useState('');
    const [attentes, setAttentes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [cond1, setCond1] = useState(false);
    const [cond2, setCond2] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isPayant = event.price_fcfa > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!motivation.trim()) { setError("La motivation est obligatoire."); return; }
        if (isPayant && !paymentMethod) { setError("Veuillez sélectionner une méthode de paiement."); return; }
        if (!cond1 || !cond2) { setError("Veuillez accepter les conditions d'utilisation et le traitement des données."); return; }

        setError('');
        setLoading(true);
        await onSubmit({
            motivation, experience, attentes,
            payment_method: isPayant ? paymentMethod : 'physical'
        });
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto pt-24 pb-12">
            <div className="bg-white max-w-2xl w-full rounded-sm shadow-xl p-8 border border-stone-200 relative my-auto">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-stone-800 transition-colors">
                    <X size={24} />
                </button>

                <div className="mb-6 border-b border-stone-100 pb-4">
                    <h2 className="text-2xl font-serif text-stone-800 mb-1">Candidature à l'événement</h2>
                    <div className="text-sm text-stone-500 font-semibold mb-3 uppercase tracking-wider text-[#b89047]">{event.title}</div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-stone-600">
                        <div><strong>Date:</strong> {new Date(event.date).toLocaleDateString('fr-FR')}</div>
                        <div><strong>Lieu:</strong> {event.location}</div>
                        <div><strong>Prix:</strong> {isPayant ? `${event.price_fcfa} FCFA` : 'Gratuit'}</div>
                        <div><strong>Catégorie:</strong> {event.is_public ? 'Public' : 'Membres uniquement'}</div>
                    </div>
                </div>

                {error && <p className="mb-4 text-red-700 bg-red-50 p-3 text-sm border border-red-200">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* A. Candidature */}
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">Motivation <span className="text-red-500">*</span></label>
                        <textarea
                            value={motivation}
                            onChange={e => setMotivation(e.target.value)}
                            placeholder="Expliquez pourquoi vous souhaitez participer à cet événement..."
                            required
                            rows="4"
                            className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-2 px-3 focus:outline-none focus:border-[#b89047] text-sm resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">Expérience Antérieure (Optionnel)</label>
                        <textarea
                            value={experience}
                            onChange={e => setExperience(e.target.value)}
                            placeholder="Décrivez votre expérience avec les enseignements rosicruciens ou spirituels..."
                            rows="3"
                            className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-2 px-3 focus:outline-none focus:border-[#b89047] text-sm resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">Attentes (Optionnel)</label>
                        <textarea
                            value={attentes}
                            onChange={e => setAttentes(e.target.value)}
                            placeholder="Que espérez-vous retirer de cette expérience ?"
                            rows="3"
                            className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-2 px-3 focus:outline-none focus:border-[#b89047] text-sm resize-none"
                        />
                    </div>

                    {/* C. Payment */}
                    {isPayant && (
                        <div className="bg-stone-50 p-4 border border-stone-200 rounded-sm">
                            <label className="block text-sm font-semibold text-stone-700 mb-3">Méthode de Paiement <span className="text-red-500">*</span></label>
                            <div className="flex flex-col gap-3">
                                <label className="flex items-center gap-3 cursor-pointer p-3 border border-stone-200 hover:border-[#b89047] bg-white transition-colors">
                                    <input type="radio" name="payment" value="Flutterwave" onChange={e => setPaymentMethod(e.target.value)} />
                                    <span className="text-lg">💳</span> <span className="text-sm font-medium">Flutterwave</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer p-3 border border-stone-200 hover:border-[#b89047] bg-white transition-colors">
                                    <input type="radio" name="payment" value="FedaPay" onChange={e => setPaymentMethod(e.target.value)} />
                                    <span className="text-lg">💰</span> <span className="text-sm font-medium">FedaPay</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer p-3 border border-stone-200 hover:border-[#b89047] bg-white transition-colors">
                                    <input type="radio" name="payment" value="CinetPay" onChange={e => setPaymentMethod(e.target.value)} />
                                    <span className="text-lg">🏦</span> <span className="text-sm font-medium">CinetPay</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer p-3 border border-stone-200 hover:border-[#b89047] bg-white transition-colors">
                                    <input type="radio" name="payment" value="physical" onChange={e => setPaymentMethod(e.target.value)} />
                                    <span className="text-lg">💵</span> <span className="text-sm font-medium">Paiement sur place (Especes)</span>
                                </label>
                            </div>
                            <p className="mt-3 text-sm font-bold text-stone-800">Montant à payer : {event.price_fcfa} FCFA</p>
                        </div>
                    )}

                    {/* D. Conditions */}
                    <div className="space-y-3 mt-6 border-t border-stone-100 pt-6">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" checked={cond1} onChange={e => setCond1(e.target.checked)} className="mt-1 accent-[#b89047]" />
                            <span className="text-xs text-stone-600">J'accepte les conditions générales de participation et comprends que ma candidature sera examinée par les organisateurs. <span className="text-red-500">*</span></span>
                        </label>
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" checked={cond2} onChange={e => setCond2(e.target.checked)} className="mt-1 accent-[#b89047]" />
                            <span className="text-xs text-stone-600">J'autorise le traitement de mes données personnelles dans le cadre de cette candidature. <span className="text-red-500">*</span></span>
                        </label>
                    </div>

                    {/* E. Processus Alert */}
                    <div className="bg-[#b89047]/10 p-4 border border-[#b89047]/30 rounded-sm flex gap-3 text-sm text-[#8c6b30] mt-6">
                        <CheckCircle className="shrink-0 mt-0.5" size={18} />
                        <p>Votre candidature sera examinée par notre équipe. Vous recevrez une notification par email dans les 48h concernant l'acceptation ou le refus de votre demande.</p>
                    </div>

                    <div className="flex gap-4 justify-end pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 border border-stone-300 text-stone-600 hover:bg-stone-50 transition-colors uppercase tracking-wider text-sm font-semibold">
                            Annuler
                        </button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-[#b89047] text-white hover:bg-[#a37b3b] uppercase tracking-wider text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? "Envoi en cours..." : "Envoyer la candidature"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplicationForm;
