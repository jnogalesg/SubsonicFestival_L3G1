
import { useState } from 'react';
import ModalCheckout from '../../components/ModalCheckout';
import './Tienda.css';

export default function Tienda() {
    const [checkoutData, setCheckoutData] = useState(null);

    const abrirCheckout = (tipo, precio, evento, fecha, lugar) => {
        setCheckoutData({ tipo, precio, evento, fecha, lugar });
    };

    return (
        <>
            <div id="tienda" className="bg-gradient">
                <section>
                    <div className="section-label">Official Merch</div>
                    <h2>TIENDA SUBSONIC</h2>

                    <div className="tienda-grid">
                        {/* CAMISETA */}
                        <div className="producto-card">
                            <img src="/camiseta.jpg" alt="Camiseta" />
                            <div className="producto-info">
                                <span>Camiseta Oficial Subsonic 2026</span>
                                <strong>29.99€</strong>
                                <button
                                    className="btn-nav"
                                    onClick={() => abrirCheckout('Camiseta Oficial', 29.99, 'Subsonic Store', 'Envío: 2-3 días', 'Tallas: S / M / L / XL')}
                                >
                                    Comprar
                                </button>
                            </div>
                        </div>

                        {/* GORRA */}
                        <div className="producto-card">
                            <img src="/gorra.jpg" alt="Gorra" />
                            <div className="producto-info">
                                <span>Gorra Subsonic Black</span>
                                <strong>19.99€</strong>
                                <button
                                    className="btn-nav"
                                    onClick={() => abrirCheckout('Gorra Black', 19.99, 'Subsonic Store', 'Envío: 2-3 días', 'Talla Única Ajustable')}
                                >
                                    Comprar
                                </button>
                            </div>
                        </div>

                        {/* SUDADERA */}
                        <div className="producto-card">
                            <img src="/sudadera.jpg" alt="Sudadera" />
                            <div className="producto-info">
                                <span>Sudadera Festival Red</span>
                                <strong>49.99€</strong>
                                <button
                                    className="btn-nav"
                                    onClick={() => abrirCheckout('Sudadera Red', 49.99, 'Subsonic Store', 'Envío: Gratis', 'Tallas: S / M / L / XL')}
                                >
                                    Comprar
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* MODAL DE COMPRA */}
            <ModalCheckout
                isOpen={!!checkoutData}
                onClose={() => setCheckoutData(null)}
                ticketData={checkoutData}
            />
        </>
    );
}
