const About = () => {
    return (
        <div className="mt-8 space-y-12 mb-16 max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-serif text-stone-800 mb-4">À Propos du Lectorium Rosicrucianum</h1>
                <div className="w-16 h-0.5 bg-[#b89047] mx-auto mb-6"></div>
                <p className="text-stone-500 font-light max-w-2xl mx-auto text-lg">
                    L'École Internationale de la Rose-Croix d'Or
                </p>
            </div>

            <section className="bg-white p-8 border border-stone-200 shadow-sm content-block">
                <h2 className="text-2xl font-serif text-[#b89047] mb-4">Notre Histoire & Mission</h2>
                <p className="text-stone-600 leading-relaxed mb-4">
                    Le Lectorium Rosicrucianum (École Internationale de la Rose-Croix d'Or) est une école spirituelle gnostique contemporaine.
                    Son but est de guider les chercheurs de vérité vers la renaissance de l'âme originelle, un processus intérieur fondamental
                    que nous appelons la transfiguration.
                </p>
                <p className="text-stone-600 leading-relaxed">
                    Nous proposons un chemin pratique d'éveil spirituel, ancré dans l'amour universel, la connaissance (Gnose)
                    et le service à l'humanité. Nos centres à travers le monde, et particulièrement au Bénin, offrent un espace
                    de silence, de réflexion et d'enseignement pour soutenir les chercheurs dans leur quête intérieure.
                </p>
            </section>

            <section className="bg-[#fdfbf7] p-8 border border-stone-100 mt-8">
                <h2 className="text-2xl font-serif text-stone-800 mb-6 text-center">Nos Centres au Bénin</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                    <div className="p-4 border border-stone-200 bg-white shadow-sm">
                        <h3 className="font-semibold text-stone-800 mb-1">Foyer Sole Novo</h3>
                        <p className="text-stone-500 text-sm">Djèrègbé (Sèmè-Kpodji)</p>
                    </div>
                    <div className="p-4 border border-stone-200 bg-white shadow-sm">
                        <h3 className="font-semibold text-stone-800 mb-1">Centre de Ville</h3>
                        <p className="text-stone-500 text-sm">Cotonou</p>
                    </div>
                    <div className="p-4 border border-stone-200 bg-white shadow-sm">
                        <h3 className="font-semibold text-stone-800 mb-1">Centre de Ville</h3>
                        <p className="text-stone-500 text-sm">Lokossa</p>
                    </div>
                    <div className="p-4 border border-stone-200 bg-white shadow-sm">
                        <h3 className="font-semibold text-stone-800 mb-1">Centre de Ville</h3>
                        <p className="text-stone-500 text-sm">Natitingou</p>
                    </div>
                    <div className="p-4 border border-stone-200 bg-white shadow-sm sm:col-span-2">
                        <h3 className="font-semibold text-stone-800 mb-1">Centre de Ville</h3>
                        <p className="text-stone-500 text-sm">Porto-Novo</p>
                    </div>
                </div>
            </section>

            <section className="bg-stone-800 text-stone-100 p-8 text-center shadow-md">
                <h2 className="text-2xl font-serif text-[#b89047] mb-4">Contact</h2>
                <p className="text-stone-300 font-light mb-6">
                    Pour toute question concernant l'école, nos enseignements ou le processus d'adhésion, n'hésitez pas à nous contacter.
                </p>
                <div className="flex justify-center gap-6 text-sm text-stone-400">
                    <p>Email: contact@lectorium.bj</p>
                    <p>Tél: +229 XX XX XX XX</p>
                </div>
            </section>
        </div>
    );
};

export default About;
