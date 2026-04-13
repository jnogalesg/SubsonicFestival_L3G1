import { useState, useEffect } from 'react';
import ModalCheckout from '../../components/ModalCheckout';
import './Tienda.css';

export default function Tienda() {
    // 1. Estados para recibir los productos de tu backend
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);

    // 2. Estado original para controlar tu Modal de Checkout
    const [checkoutData, setCheckoutData] = useState(null);

    const abrirCheckout = (tipo, precio, evento, fecha, lugar) => {
        setCheckoutData({ tipo, precio, evento, fecha, lugar });
    };

    // 3. Conexión al backend (FastAPI + SQLite)
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/merchandising")
            .then((respuesta) => respuesta.json())
            .then((resultado) => {
                setProductos(resultado.data);
                setCargando(false);
            })
            .catch((error) => {
                console.error("Error al conectar con el backend:", error);
                setCargando(false);
            });
    }, []);

    return (
        <>
            <div id="tienda" className="bg-gradient">
                <section>
                    <div className="section-label">Official Merch</div>
                    <h2>TIENDA SUBSONIC</h2>

                    {/* Si está cargando mostramos un texto, si no, pintamos el grid */}
                    {cargando ? (
                        <p style={{textAlign: "center", color: "white"}}>Cargando catálogo desde el servidor...</p>
                    ) : (
                        <div className="tienda-grid">
                            {/* Mapeamos los productos reales de la Base de Datos */}
                            {productos.map((producto) => (
                                <div key={producto.id_producto} className="producto-card">
                                    <img src={`/${producto.imagen}`} alt={producto.nombre} />
                                    <div className="producto-info">
                                        <span>{producto.nombre}</span>
                                        <strong>{producto.precio}€</strong>
                                        <button
                                            className="btn-nav"
                                            onClick={() => abrirCheckout(
                                                producto.nombre, 
                                                producto.precio, 
                                                'Subsonic Store', 
                                                'Envío: 2-3 días', 
                                                producto.descripcion // Usamos la descripción de la BD como 'lugar/talla'
                                            )}
                                        >
                                            Comprar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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