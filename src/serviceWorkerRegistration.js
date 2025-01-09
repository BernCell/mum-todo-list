// src/serviceWorkerRegistration.js

// Fonction pour enregistrer un Service Worker
export function register() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
            navigator.serviceWorker
                .register(swUrl)
                .then((registration) => {
                    console.log('Service Worker enregistré: ', registration);
                })
                .catch((error) => {
                    console.log('Échec de l\'enregistrement du Service Worker: ', error);
                });
        });
    }
}

export function unregister() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then((registration) => {
                registration.unregister();
            })
            .catch((error) => {
                console.error('Échec de la désinscription du Service Worker: ', error);
            });
    }
}
