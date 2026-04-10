/**
 * URL pública del detalle de reserva en el front (template-dashboard-vm: /reserva/[id]).
 * Configurar PTE_ALTO_FRONTEND_BASE_URL sin barra final (ej. https://deportespte.vitalmoveglobal.com).
 * En local: http://localhost:3000
 */
function getReservaPublicDetailUrl(reservaId) {
    const base = (
        process.env.PTE_ALTO_FRONTEND_BASE_URL || "https://deportespuentealto.cl"
    ).replace(/\/$/, "");
    return `${base}/reserva/${String(reservaId)}`;
}

module.exports = { getReservaPublicDetailUrl };
