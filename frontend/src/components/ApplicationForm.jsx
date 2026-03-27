import { useState, useEffect } from 'react';
import { CheckCircle, X, User, Users as UsersIcon, Baby, MapPin } from 'lucide-react';

const ApplicationForm = ({ event, onClose, onSubmit }) => {
    const [regType, setRegType] = useState('self'); // 'self', 'guest', 'child'
    const [paymentMethod, setPaymentMethod] = useState('physical');
    const [selectedSite, setSelectedSite] = useState('');
    const [guestData, setGuestData] = useState({ nom: '', prenom: '', email: '', localisation: '', whatsapp: '' });
    const [childData, setChildData] = useState({ nom: '', prenom: '', grade: 'Jeunesse A entre 6 et 9 ans' });
    const [cond1, setCond1] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isPayant = event.price_fcfa > 0;

    useEffect(() => {
        // Auto-select site if only one is available
        if (event.sites && event.sites.length === 1) {
            setSelectedSite(event.sites[0]);
        }
    }, [event.sites]);

    const GRADES = [
        'Jeunesse A entre 6 et 9 ans', 
        'Jeunesse B entre 9 et 12 ans', 
        'Jeunesse C entre 12 et 15 ans', 
        'Jeunesse D entre 15 et 18 ans', 
        'JR entre 18 et 30 ans'
    ];

    // Helper for 24h date display
    const formatDate = (dateStr) => {
        return new Intl.DateTimeFormat('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false
        }).format(new Date(dateStr));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (event.sites && event.sites.length > 0 && !selectedSite) { setError("Veuillez sélectionner un site de participation."); return; }
        if (isPayant && !paymentMethod) { setError("Veuillez sélectionner une méthode de paiement."); return; }
        if (!cond1) { setError("Veuillez accepter les conditions."); return; }

        if (regType === 'guest' && (!guestData.nom || !guestData.prenom)) { setError("Veuillez remplir le nom et le prénom de l'invité."); return; }
        if (regType === 'child' && (!childData.nom || !childData.prenom)) { setError("Veuillez remplir le nom et le prénom de l'enfant."); return; }

        setError('');
        setLoading(true);

        const payload = {
            activity_id: event.id,
            selected_site: selectedSite,
            motivation: regType === 'self' ? 'Inscription directe.' : `Inscription ${regType}.`,
            experience: '',
            attentes: '',
            payment_method: paymentMethod
        };

        if (regType === 'guest') payload.guest_info = guestData;
        if (regType === 'child') payload.child_info = childData;

        await onSubmit(payload);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-stone-900/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto pt-24 pb-12">
            <div className="bg-white max-w-2xl w-full rounded-sm shadow-xl p-4 sm:p-8 border border-stone-200 relative my-auto">
                <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-stone-400 hover:text-stone-800 transition-colors">
                    <X size={24} />
                </button>

                <div className="mb-6 border-b border-stone-100 pb-4">
                    <h2 className="text-2xl font-serif text-stone-800 mb-1">Inscription à l'événement</h2>
                    <div className="text-sm text-stone-500 font-semibold mb-3 tracking-wider text-[#b89047]">{event.title} <span className="opacity-70 text-xs uppercase ml-2">({event.type})</span></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-600">
                        <div><strong>Début:</strong> {formatDate(event.date_start)}</div>
                        <div><strong>Fin:</strong> {formatDate(event.date_end)}</div>
                        <div className="col-span-1 sm:col-span-2 font-bold text-[#b89047]"><strong>Prix:</strong> {isPayant ? `${event.price_fcfa} FCFA` : 'Gratuit'}</div>
                    </div>
                </div>

                {error && <p className="mb-4 text-red-700 bg-red-50 p-3 text-xs border border-red-200 font-bold">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* SITE SELECTION */}
                    {event.sites && event.sites.length > 0 && (
                        <div className="space-y-3">
                            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1"><MapPin size={12}/> Choisir votre Site de Participation *</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {event.sites.map(site => (
                                    <button
                                        key={site}
                                        type="button"
                                        onClick={() => setSelectedSite(site)}
                                        className={`flex items-center gap-2 p-3 border text-[10px] font-bold transition-all text-left ${selectedSite === site ? 'bg-stone-800 text-white border-stone-800 shadow-md' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}
                                    >
                                        <div className={`w-3 h-3 rounded-full border ${selectedSite === site ? 'bg-[#b89047] border-white' : 'border-stone-300'}`}></div>
                                        {site}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* A. Type selection */}
                    <div className="space-y-3">
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest">Type d'Inscription</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <button 
                                type="button"
                                onClick={() => setRegType('self')}
                                className={`flex items-center justify-center gap-2 p-3 border text-[10px] font-bold transition-all ${regType === 'self' ? 'bg-stone-800 text-white border-stone-800 shadow-md' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}
                            >
                                <User size={16} /> MOI-MÊME
                            </button>
                            <button 
                                type="button"
                                onClick={() => setRegType('guest')}
                                className={`flex items-center justify-center gap-2 p-3 border text-[10px] font-bold transition-all ${regType === 'guest' ? 'bg-stone-800 text-white border-stone-800 shadow-md' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}
                            >
                                <UsersIcon size={16} /> UN INVITÉ
                            </button>
                            <button 
                                type="button"
                                onClick={() => setRegType('child')}
                                className={`flex items-center justify-center gap-2 p-3 border text-[10px] font-bold transition-all ${regType === 'child' ? 'bg-stone-800 text-white border-stone-800 shadow-md' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}
                            >
                                <Baby size={16} /> UN ENFANT
                            </button>
                        </div>
                    </div>

                    {/* B. Specific Data */}
                    {regType === 'guest' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 border border-stone-200 rounded-sm">
                            <input type="text" placeholder="Nom" required value={guestData.nom} onChange={e => setGuestData({...guestData, nom: e.target.value})} className="p-2 text-sm border border-stone-200" />
                            <input type="text" placeholder="Prénom" required value={guestData.prenom} onChange={e => setGuestData({...guestData, prenom: e.target.value})} className="p-2 text-sm border border-stone-200" />
                            <input type="email" placeholder="Email" value={guestData.email} onChange={e => setGuestData({...guestData, email: e.target.value})} className="p-2 text-sm border border-stone-200" />
                            <input type="text" placeholder="WhatsApp" value={guestData.whatsapp} onChange={e => setGuestData({...guestData, whatsapp: e.target.value})} className="p-2 text-sm border border-stone-200" />
                            <input type="text" placeholder="Localisation" value={guestData.localisation} onChange={e => setGuestData({...guestData, localisation: e.target.value})} className="p-2 text-sm border border-stone-200 sm:col-span-2" />
                        </div>
                    )}

                    {regType === 'child' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 border border-stone-200 rounded-sm">
                            <input type="text" placeholder="Nom de l'enfant" required value={childData.nom} onChange={e => setChildData({...childData, nom: e.target.value})} className="p-2 text-sm border border-stone-200" />
                            <input type="text" placeholder="Prénom de l'enfant" required value={childData.prenom} onChange={e => setChildData({...childData, prenom: e.target.value})} className="p-2 text-sm border border-stone-200" />
                            <select value={childData.grade} onChange={e => setChildData({...childData, grade: e.target.value})} className="p-2 text-sm border border-stone-200 bg-white sm:col-span-2 font-bold">
                                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                    )}

                    {/* C. Payment */}
                    {isPayant && (
                        <div className="bg-stone-50 p-4 border border-stone-200 rounded-sm">
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Méthode de Paiement <span className="text-red-500">*</span></label>
                            <div className="flex flex-col gap-3">
                                <label className="flex items-center gap-3 cursor-pointer p-3 border border-stone-200 hover:border-[#b89047] bg-white transition-colors">
                                    <input type="radio" name="payment" value="physical" checked={paymentMethod === 'physical'} onChange={e => setPaymentMethod(e.target.value)} />
                                    <span className="text-lg">💵</span> <span className="text-xs font-bold">Paiement en espèces (sur place lors de l'événement)</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* D. Conditions */}
                    <div className="space-y-3 mt-6 border-t border-stone-100 pt-6">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" checked={cond1} onChange={e => setCond1(e.target.checked)} className="mt-1 accent-[#b89047]" />
                            <span className="text-xs text-stone-600 italic">Je confirme l'exactitude des informations fournies et m'engage à participer à cet événement.</span>
                        </label>
                    </div>

                    {/* E. Processus Alert */}
                    <div className="bg-[#b89047]/5 p-4 border border-[#b89047]/20 rounded-sm flex gap-3 text-xs text-stone-600 mt-6">
                        <CheckCircle className="shrink-0 mt-0.5 text-[#b89047]" size={18} />
                        <p>Votre inscription est directe. Une confirmation vous sera demandée sur place si des frais s'appliquent.</p>
                    </div>

                    <div className="flex gap-4 justify-end pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 border border-stone-300 text-stone-600 hover:bg-stone-50 transition-colors uppercase tracking-widest text-[10px] font-bold">
                            Annuler
                        </button>
                        <button type="submit" disabled={loading} className="px-8 py-2 bg-[#b89047] text-white hover:bg-[#a37b3b] uppercase tracking-widest text-[10px] font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50">
                            {loading ? "Envoi..." : "Valider l'inscription"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplicationForm;
