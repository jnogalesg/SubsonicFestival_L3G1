import { useState, useEffect } from 'react';
import ModalCheckout from '../../components/ModalCheckout';
import { auth } from '../../firebase/firebaseConfig';
import './Tienda.css';

export default function Tienda() {
    // 1. Estados para recibir los productos de tu backend
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);

    // 2. Estado original para controlar tu Modal de Checkout
    const [checkoutData, setCheckoutData] = useState(null);

    // Fíjate que el primer parámetro tiene que ser idProducto
    const abrirCheckout = (idProducto, tipo, precio, evento, fecha, lugar) => {
        setCheckoutData({ idProducto, tipo, precio, evento, fecha, lugar });
    };

    // 3. Lógica que se conecta con el nuevo endpoint protegido
    const procesarCompraFinal = async () => {
        // Cogemos el token que se guarda en Firebase para saber quién es el usuario actual cuando el usuario hace login
        const currentUser = auth.currentUser; 

        // Si no hay nadie, no le dejamos pasar
        if (!currentUser) {
            alert("Debes iniciar sesión para poder comprar merchandising.");
            return;
        }

        try {
            const token = await currentUser.getIdToken();
            //Esto lo pongo por si necesito ver lo que ocurre en la consola del navegador
            console.log("Datos que envío a Python:", {
                id_producto: checkoutData.idProducto,
                cantidad: 1
            });
            const response = await fetch("http://127.0.0.1:8000/api/merchandising/comprar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // Ahora sí enviamos el token real
                },
                body: JSON.stringify({
                    id_producto: checkoutData.idProducto,
                    cantidad: 1
                })
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.mensaje); // ¡Compra realizada con éxito!
                setCheckoutData(null); // Cerramos el modal
            } else if (response.status === 403) {
                alert("Acceso denegado: Solo los usuarios registrados como 'cliente' pueden comprar.");
            } else if (response.status === 400) {
                alert("Error: No hay stock suficiente de este producto.");
            } else {
                alert("Error de conexión al procesar la compra.");
            }
        } catch (error) {
            console.error("Error al procesar la compra:", error);
        }
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
                                                producto.id_producto, // Pasamos el ID real del producto
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
                onConfirm={procesarCompraFinal}
            />
        </>
    );
}