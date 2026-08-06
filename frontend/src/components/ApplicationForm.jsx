import { useState, useEffect, useRef } from 'react';
import { CheckCircle, X, User, Users as UsersIcon, Baby, MapPin, Smartphone, CreditCard, ShieldCheck } from 'lucide-react';

const ApplicationForm = ({ event, onClose, onSubmit }) => {
    const [regType, setRegType] = useState('self'); // 'self', 'other_member', 'child'
    const [paymentMethod, setPaymentMethod] = useState('physical');
    const [selectedSite, setSelectedSite] = useState('');
    const [guestData, setGuestData] = useState({ nom: '', prenom: '', email: '', localisation: '', whatsapp: '' });
    const [childData, setChildData] = useState({ nom: '', prenom: '', grade: 'Jeunesse A entre 6 et 9 ans', matricule: '' });
    const [otherMemberMatricule, setOtherMemberMatricule] = useState('');
    const [foundMember, setFoundMember] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [cond1, setCond1] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [momoPhone, setMomoPhone] = useState('');
    const [pollingState, setPollingState] = useState('idle'); // idle | waiting | success | failed | timeout
    const [mtnReference, setMtnReference] = useState(null);
    const pollTimerRef = useRef(null);

    const isPayant = event.is_paid || event.price_fcfa > 0;
    const [paymentAmount, setPaymentAmount] = useState('');

    useEffect(() => {
        if (event.sites && event.sites.length === 1) setSelectedSite(event.sites[0]);
    }, [event.sites]);

    useEffect(() => {
        if (pollingState !== 'waiting' || !mtnReference) return;

        let attempts = 0;
        const MAX_ATTEMPTS = 30;

        const poll = async () => {
            attempts++;
            if (attempts > MAX_ATTEMPTS) {
                setPollingState('timeout');
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(`/api/payments/status/${mtnReference}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                });
                const data = await res.json();
                if (data.status === 'completed') {
                    setPollingState('success');
                    setLoading(false);
                    pollTimerRef.current = setTimeout(() => onClose(), 3500);
                } else if (data.status === 'failed') {
                    setPollingState('failed');
                    setError(data.reason || 'Paiement refusé ou annulé.');
                    setLoading(false);
                } else {
                    pollTimerRef.current = setTimeout(poll, 3000);
                }
            } catch {
                pollTimerRef.current = setTimeout(poll, 3000);
            }
        };

        pollTimerRef.current = setTimeout(poll, 3000);
        return () => clearTimeout(pollTimerRef.current);
    }, [pollingState, mtnReference]);

    const handleSearchMember = async (mat, target = 'other_member') => {
        if (!mat) return;
        setIsSearching(true);
        setError('');
        try {
            const res = await fetch(`/api/members/matricule/${mat}`);
            if (!res.ok) throw new Error("Membre non trouvé");
            const data = await res.json();
            if (target === 'other_member') {
                setFoundMember(data);
            } else {
                setChildData({ ...childData, nom: data.nom, prenom: data.prenom, matricule: mat });
            }
        } catch (err) {
            setError("Matricule non trouvé. Veuillez vérifier le numéro.");
            if (target === 'other_member') setFoundMember(null);
        } finally {
            setIsSearching(false);
        }
    };

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

    const [receiptPreference, setReceiptPreference] = useState('email');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (event.sites && event.sites.length > 0 && !selectedSite) { setError("Veuillez sélectionner un site de participation."); return; }
        if (isPayant && !paymentMethod) { setError("Veuillez sélectionner une méthode de paiement."); return; }
        if (!cond1) { setError("Veuillez accepter les conditions."); return; }

        if (regType === 'other_member' && !foundMember) { setError("Veuillez d'abord rechercher et valider un membre par son matricule."); return; }
        if (regType === 'child' && (!childData.nom || !childData.prenom)) { setError("Veuillez remplir le nom et le prénom de l'enfant."); return; }
        if (paymentMethod === 'momo') {
            const cleanPhone = momoPhone.replace(/\s+/g, '');
            if (!cleanPhone || cleanPhone.length < 8) {
                setError("Veuillez entrer votre numéro MTN Mobile Money (format international, ex: 22997000000).");
                return;
            }
        }

        setError('');
        setLoading(true);

        const payload = {
            activity_id: event.id,
            selected_site: selectedSite,
            motivation: regType === 'self' ? 'Inscription directe.' : `Inscription ${regType}.`,
            experience: '',
            attentes: '',
            payment_method: paymentMethod,
            receipt_preference: receiptPreference
        };

        if (regType === 'other_member') {
            payload.register_by_matricule = otherMemberMatricule;
        }
        if (regType === 'child') {
            payload.child_info = childData;
            if (childData.matricule) payload.register_by_matricule = childData.matricule;
        }

        if (paymentMethod === 'momo') {
            setLoading(true);
            try {
                const initPayload = {
                    activity_id: event.id,
                    selected_site: selectedSite,
                    phone_number: momoPhone.replace(/\s+/g, ''),
                    amount: paymentAmount || (event.participation_amounts?.length > 0 ? event.participation_amounts[0].amount : event.price_fcfa),
                    receipt_preference: receiptPreference,
                    motivation: payload.motivation,
                    register_by_matricule: payload.register_by_matricule,
                    child_info: payload.child_info,
                };
                const res = await fetch('/api/payments/initiate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify(initPayload),
                });
                const data = await res.json();
                if (!res.ok) {
                    setError(data.message || "Échec de l'initiation du paiement MTN.");
                    setLoading(false);
                    return;
                }
                setMtnReference(data.mtn_reference);
                setPollingState('waiting');
            } catch (err) {
                setError('Erreur réseau. Veuillez réessayer.');
                setLoading(false);
            }
            return;
        }

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
                        <div className="col-span-1 sm:col-span-2 font-bold text-[#b89047]">
                            <strong>Prix:</strong> {isPayant ? (
                                event.participation_amounts && event.participation_amounts.length > 0 ? (
                                    <ul className="list-disc ml-5 font-normal text-sm text-stone-600 mt-1">
                                        {event.participation_amounts.map((amt, idx) => (
                                            <li key={idx}><strong>{amt.label} :</strong> {amt.amount} FCFA</li>
                                        ))}
                                    </ul>
                                ) : `${event.price_fcfa} FCFA`
                            ) : 'Gratuit'}
                        </div>
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
                                onClick={() => setRegType('other_member')}
                                className={`flex items-center justify-center gap-2 p-3 border text-[10px] font-bold transition-all ${regType === 'other_member' ? 'bg-stone-800 text-white border-stone-800 shadow-md' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}
                            >
                                <UsersIcon size={16} /> AUTRE MEMBRE
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
                    {regType === 'other_member' && (
                        <div className="space-y-4 bg-stone-50 p-4 border border-stone-200 rounded-sm">
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Rechercher par matricule..." 
                                    value={otherMemberMatricule} 
                                    onChange={e => setOtherMemberMatricule(e.target.value)} 
                                    className="flex-1 p-2 text-sm border border-stone-200" 
                                />
                                <button 
                                    type="button" 
                                    onClick={() => handleSearchMember(otherMemberMatricule)}
                                    className="bg-stone-800 text-white px-4 text-xs font-bold uppercase tracking-wider"
                                >
                                    {isSearching ? '...' : 'Chercher'}
                                </button>
                            </div>
                            {foundMember && (
                                <div className="p-3 bg-white border border-[#b89047]/30 rounded-sm">
                                    <p className="text-xs font-bold text-stone-700">Membre trouvé :</p>
                                    <p className="text-sm text-[#b89047] font-serif uppercase mt-1">{foundMember.prenom} {foundMember.nom}</p>
                                    <p className="text-[10px] text-stone-500">Centre : {foundMember.center || 'N/A'}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {regType === 'child' && (
                        <div className="space-y-4 bg-stone-50 p-4 border border-stone-200 rounded-sm">
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Matricule de l'enfant (optionnel)" 
                                    value={childData.matricule} 
                                    onChange={e => setChildData({...childData, matricule: e.target.value})} 
                                    className="flex-1 p-2 text-sm border border-stone-200" 
                                />
                                <button 
                                    type="button" 
                                    onClick={() => handleSearchMember(childData.matricule, 'child')}
                                    className="bg-stone-800 text-white px-4 text-xs font-bold uppercase tracking-wider"
                                >
                                    Chercher
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input type="text" placeholder="Nom de l'enfant" required value={childData.nom} onChange={e => setChildData({...childData, nom: e.target.value})} className="p-2 text-sm border border-stone-200 bg-white" />
                                <input type="text" placeholder="Prénom de l'enfant" required value={childData.prenom} onChange={e => setChildData({...childData, prenom: e.target.value})} className="p-2 text-sm border border-stone-200 bg-white" />
                                <select value={childData.grade} onChange={e => setChildData({...childData, grade: e.target.value})} className="p-2 text-sm border border-stone-200 bg-white sm:col-span-2 font-bold">
                                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* C. Payment */}
                    {isPayant && (
                        <div className="bg-stone-50 p-4 border border-stone-200 rounded-sm space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Méthode de Paiement <span className="text-red-500">*</span></label>
                                <div className="flex flex-col gap-3">
                                    <label className="flex items-center gap-3 cursor-pointer p-3 border border-stone-200 hover:border-[#b89047] bg-white transition-colors">
                                        <input type="radio" name="payment" value="physical" checked={paymentMethod === 'physical'} onChange={e => setPaymentMethod(e.target.value)} />
                                        <span className="text-lg">💵</span> <span className="text-xs font-bold">Paiement en espèces (sur place)</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer p-3 border border-stone-200 hover:border-[#b89047] bg-white transition-colors">
                                        <input type="radio" name="payment" value="momo" checked={paymentMethod === 'momo'} onChange={e => setPaymentMethod(e.target.value)} />
                                        <span className="text-lg">📱</span> <span className="text-xs font-bold text-yellow-600">Paiement par MTN Mobile Money</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-stone-200">
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Recevoir mon reçu par :</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setReceiptPreference('email')}
                                        className={`flex items-center justify-center gap-2 p-3 border text-[10px] font-bold transition-all ${receiptPreference === 'email' ? 'bg-[#b89047] text-white border-[#b89047] shadow-md' : 'bg-white text-stone-500 border-stone-200 hover:border-[#b89047]'}`}
                                    >
                                        📧 EMAIL
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setReceiptPreference('whatsapp')}
                                        className={`flex items-center justify-center gap-2 p-3 border text-[10px] font-bold transition-all ${receiptPreference === 'whatsapp' ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-stone-500 border-stone-200 hover:border-green-600'}`}
                                    >
                                        💬 WHATSAPP
                                    </button>
                                </div>
                                <p className="text-[10px] text-stone-400 mt-2 italic">
                                    {receiptPreference === 'whatsapp' ? "Le reçu sera envoyé sur le numéro WhatsApp de votre profil." : "Le reçu sera envoyé sur l'adresse email de votre profil."}
                                </p>
                            </div>
                            
                            {paymentMethod === 'momo' && (
                                <div className="mt-4 space-y-4 border-t border-stone-200 pt-4">
                                    <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded-sm">
                                        <strong>Comment ça marche :</strong> En validant l'inscription, vous recevrez une notification USSD sur votre téléphone MTN. Confirmez le paiement directement sur votre téléphone.
                                    </div>
                                    {event.participation_amounts && event.participation_amounts.length > 0 && (
                                        <div>
                                            <label className="block text-[10px] font-bold text-stone-600 uppercase mb-2">Montant à payer *</label>
                                            <select
                                                value={paymentAmount}
                                                onChange={e => setPaymentAmount(e.target.value)}
                                                className="w-full p-3 text-sm border border-stone-200 outline-none focus:border-[#b89047] bg-white"
                                            >
                                                <option value="">Sélectionnez le montant correspondant</option>
                                                {event.participation_amounts.map((amt, idx) => (
                                                    <option key={idx} value={amt.amount}>{amt.label} — {amt.amount} FCFA</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-[10px] font-bold text-stone-600 uppercase mb-2">Numéro MTN Mobile Money *</label>
                                        <input
                                            type="tel"
                                            placeholder="Ex: 22997000000 (sans le +)"
                                            value={momoPhone}
                                            onChange={e => setMomoPhone(e.target.value)}
                                            className="w-full p-3 text-sm border border-stone-200 outline-none focus:border-[#b89047] bg-white"
                                        />
                                        <p className="text-[10px] text-stone-400 mt-1">Format international sans le + (ex: 22997000000 pour le Bénin)</p>
                                    </div>
                                </div>
                            )}

                            {pollingState === 'failed' && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                                    ❌ {error || 'Paiement refusé.'}
                                    <button type="button" onClick={() => { setPollingState('idle'); setError(''); setMtnReference(null); }} className="ml-3 underline">Réessayer</button>
                                </div>
                            )}
                            {pollingState === 'timeout' && (
                                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold">
                                    ⏱ Délai dépassé (90s). Vérifiez votre téléphone et réessayez.
                                    <button type="button" onClick={() => { setPollingState('idle'); setMtnReference(null); }} className="ml-3 underline">Réessayer</button>
                                </div>
                            )}
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
                        <button type="submit" disabled={loading || pollingState === 'waiting'} className="px-8 py-2 bg-[#b89047] text-white hover:bg-[#a37b3b] uppercase tracking-widest text-[10px] font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50">
                            {loading && pollingState !== 'waiting' ? 'Envoi...' : pollingState === 'waiting' ? 'En cours...' : paymentMethod === 'momo' ? 'Payer par MTN MoMo' : "Valider l'inscription"}
                        </button>
                    </div>
                </form>

                {/* Polling overlay — inside the relative modal div */}
                {pollingState === 'waiting' && (
                    <div className="absolute inset-0 z-10 bg-white/95 flex flex-col items-center justify-center gap-6 p-8 text-center rounded-sm">
                        <div className="w-16 h-16 border-4 border-[#b89047] border-t-transparent rounded-full animate-spin"></div>
                        <div>
                            <h3 className="font-serif text-xl text-stone-800 mb-2">En attente de votre validation</h3>
                            <p className="text-sm text-stone-600 max-w-xs">
                                Une notification USSD a été envoyée sur le numéro <strong className="text-[#b89047]">{momoPhone}</strong>.
                            </p>
                            <p className="text-xs text-stone-400 mt-2">Validez le paiement sur votre téléphone MTN MoMo...</p>
                        </div>
                        <button type="button" onClick={() => { setPollingState('idle'); setLoading(false); clearTimeout(pollTimerRef.current); }} className="text-xs text-stone-400 underline">Annuler</button>
                    </div>
                )}

                {pollingState === 'success' && (
                    <div className="absolute inset-0 z-10 bg-white/95 flex flex-col items-center justify-center gap-6 p-8 text-center rounded-sm">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div>
                            <h3 className="font-serif text-xl text-stone-800 mb-2">Paiement confirmé !</h3>
                            <p className="text-sm text-stone-600">Votre inscription et votre paiement ont bien été enregistrés. Un reçu vous a été envoyé.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationForm;
