//FUNCIONES LOGIN
function limpiar_errores(){
    console.log("funcion limpiar errores");
            const lista_errores = document.getElementsByClassName("mensaje-error");
            for(var elemento of lista_errores){
                elemento.innerHTML = "";
            }
        }

function ingresar(){
    console.log("Procesando...")
    limpiar_errores();
    const formulario = document.getElementById("form-login");
    const datos_formulario = new FormData(formulario);
    var usuario = datos_formulario.get("campo-usuario");
    var contraseña = datos_formulario.get("campo-contraseña");
    const rol = validarUsuario(usuario,contraseña);
    
    if(rol=="admin"){
        localStorage.setItem("rol",rol);
        window.location.href="dashboard.html";
        console.log("Usuario: "+usuario+" Rol: "+rol);
    }else if (rol == "vendedor"){
            localStorage.setItem("rol",rol);
            window.location.href="dashboard.html";   
            console.log("Usuario: "+usuario+" Rol: "+rol) ;   
    }else{
            document.getElementById("mensaje-usuario").innerHTML = "Credenciales incorrectas";
           console.log("credenciales incorrectas");}}

    const admin = {
    usuario : "admin",
    contraseña: "12345",
    rol: "admin"}

        const vendedor = {
    usuario : "vendedor",
    contraseña : "123",
    rol : "vendedor"}


function validarUsuario(usuario,contraseña){
    
    if(admin.contraseña == contraseña && admin.usuario == usuario){
        
        return admin.rol;
    }else if(vendedor.contraseña==contraseña && vendedor.usuario==usuario){
        return vendedor.rol;
    }else{
        return null;
    }
}


//FUNCIONES DASHBOARD
const rol = localStorage.getItem("rol");
mostrarBotones(rol);
mostrarDashboard();
        
function mostrarBotones(rol){
    if(rol=="admin"){
        document.getElementById("boton_dashboard").style.display = "block";
        document.getElementById("boton_nuevaVenta").style.display = "block";
        document.getElementById("boton_mostrarProductos").style.display = "block";
        document.getElementById("boton_Clientes").style.display = "block";
        document.getElementById("boton_inventario").style.display = "block";
        document.getElementById("boton_ventas").style.display = "block";
        document.getElementById("boton_pagos").style.display = "block";
        document.getElementById("boton_facturas").style.display = "block";
        document.getElementById("boton_proveedores").style.display = "block";
        document.getElementById("boton_reportes").style.display = "block";
        document.getElementById("boton_notificaciones").style.display = "block";
        document.getElementById("boton_usuarios").style.display = "block";
        document.getElementById("boton_salir").style.display = "block";
    }else if(rol=="vendedor"){
        document.getElementById("boton_facturas").style.display = "none";
        document.getElementById("boton_pagos").style.display = "none";
        document.getElementById("boton_mostrarProductos").style.display = "none";
        document.getElementById("boton_Clientes").style.display = "none";
        document.getElementById("boton_inventario").style.display = "none";
        document.getElementById("boton_proveedores").style.display = "none";
        document.getElementById("boton_reportes").style.display = "none";
        document.getElementById("boton_notificaciones").style.display = "none";
        document.getElementById("boton_usuarios").style.display = "none";
    } else {
        document.getElementById("boton_dashboard").style.display = "block";
        document.getElementById("boton_nuevaVenta").style.display = "none";
        document.getElementById("boton_mostrarProductos").style.display = "none";
        document.getElementById("boton_Clientes").style.display = "none";
        document.getElementById("boton_inventario").style.display = "none";
        document.getElementById("boton_ventas").style.display = "none";
        document.getElementById("boton_pagos").style.display = "none";
        document.getElementById("boton_facturas").style.display = "none";
        document.getElementById("boton_proveedores").style.display = "none";
        document.getElementById("boton_reportes").style.display = "none";
        document.getElementById("boton_notificaciones").style.display = "none";
        document.getElementById("boton_usuarios").style.display = "none";
        document.getElementById("boton_salir").style.display = "none";
    }
}
 
function mostrarProductos(){
    console.log("mostrando productos");
    document.getElementById("zona_principal").innerHTML = `
    <div id="productos">
        <h1>
            PRODUCTOS
        </h1>

        <div id="buscadores">
            <span>🔎</span><input id="buscador" type="search" placeholder="Ingrese producto...">
            <button id="btn-buscar-producto">buscar</button>
            <label for="combo-categoria"> Categoría: </label>
            <select name="categoria" id="combo-categoria">
                <option value="">Todas ▼</option>
                <option value="">Abarrotes</option>
                <option value="">Lácteos</option>
                <option value="">Verduras</option>
            </select>
        </div>
        <div id="contenedor-tabla-productos">
            <table id="tabla-productos">
                <tr class="impar">
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                </tr>
                <tr class="par">
                    <td>P001</td>
                    <td>Leche</td>
                    <td>Lácteos</td>
                    <td>$1500</td>
                    <td>20</td>
                </tr>
                <tr class="impar">
                    <td>P002</td>
                    <td>Arroz Tucapel 1kg</td>
                    <td>Abarrotes</td>
                    <td>2000</td>
                    <td>12</td>
                </tr>

            </table>
        </div>
    </div>`;
}

function mostrarClientes(){
    console.log("mostrando clientes");
    document.getElementById("zona_principal").innerHTML =`
    <div id="clientes">
        <h1>
            CLIENTES 
        </h1>

        <div id="buscadores-cliente">
            <span>🔎</span><input id="buscador-cliente" type="search" placeholder="Ingrese RUN...">
            <button id="btn-buscar-cli" >buscar</button>

        </div>
        <div>
            <table id="tabla-clientes">
                <tr class="impar">
                    <th>RUN</th>
                    <th>NOMBRE</th>
                    <th>ESTADO</th>
                </tr>
                <tr class="par">
                    <td>123456789</td>
                    <td>Jhon Doe</td>
                    <td>✓ Activo</td>
                </tr>
                <tr class="impar">
                    <td>987654321</td>
                    <td>Juan Pérez</td>
                    <td>✓ Activo</td>
                </tr>

            </table>
        </div>
    </div> `;
}

function mostrarInventario(){
    console.log("mostrando inventario");
    document.getElementById("zona_principal").innerHTML =`
    <div id="inventario">
        <h1>
            STOCK ACTUAL 
        </h1>

        <div>
            <table id="tabla-inventario">
                <tr class="impar">
                    <th>Producto</th>
                    <th>Stock Actual</th>
                    <th>Stock Mínimo</th>
                </tr>
                <tr class="par">
                    <td>Leche</td>
                    <td>20</td>
                    <td>15</td>
                </tr>
                <tr class="impar">
                    <td>Arroz</td>
                    <td>12</td>
                    <td>10</td>
                </tr>
            </table>

            <button class="botones-inventario" id="btn-mov-inventario" onclick="movimientoInventario()"> VER MOVIMIENTOS</button>
            <button class="botones-inventario" id="btn-bajo-stock" onclick="bajoStock()"> BAJO STOCK </button>
            <button class="botones-inventario" id="btn-actualizar-stock" onclick="actualizarStockMinimo()"> ACTUALIZAR STOCK MÍNIMO </button>
        </div>
    </div>
    `;
}

function movimientoInventario(){
    console.log("mostrando movimientos inventario")
    document.getElementById("movimientos").classList.remove("tabla-oculta");
}

function cerrarMovimiento(){
    document.getElementById("movimientos").classList.add("tabla-oculta");
    document.getElementById("bajo-stock").classList.add("tabla-oculta");
    document.getElementById("actualizar-stock-minimo").classList.add("tabla-oculta");
    document.getElementById("form-nuevo-proveedor").classList.add("tabla-oculta");
    document.getElementById("nuevo-notificacion").classList.add("tabla-oculta");
}

function bajoStock(){
    console.log("mostrando stock bajo")
    document.getElementById("bajo-stock").classList.remove("tabla-oculta");
}

function actualizarStockMinimo(){
    console.log("mostrando actualizar stock mínimo");
    document.getElementById("actualizar-stock-minimo").classList.remove("tabla-oculta");
}

function guardarActualizarStock(){
    console.log("guardando stock actualizado");

    const tablaStockMinimo = document.getElementById("tabla-actualizar-stock-minimo");
    const tablaStock = document.getElementById("tabla-inventario");
    let stockMinActualizado = [];
    
    for (let i = 1; i < tablaStockMinimo.rows.length; i++){
        const celdas = tablaStockMinimo.rows[i].cells;

        const producto = celdas[0].textContent;
        const stockNuevo = celdas[2].textContent;
        stockMinActualizado[i - 1] = {
            producto: celdas[0].textContent,     
            stockActual: celdas[1].textContent,
            stockNuevo: stockNuevo
        };

        celdas[1].textContent = stockNuevo;

        if(tablaStock){
            for(let j = 1; j < tablaStock.rows.length; j++){
                let celdasTablaInventario = tablaStock.rows[j].cells;
                if(celdasTablaInventario[0].textContent.trim()==producto.trim()){
                    celdasTablaInventario[2].textContent = stockNuevo;
                }
            }
        }
    }
    console.log("Datos actualizados: ");
}

function mostrarProveedores(){
    console.log("mostrando proovedores");
    document.getElementById("zona_principal").innerHTML =`
    <div id="proveedores">
        <h1>
            PROVEEDORES
        </h1>

        <button id="btn-nuevo-proveedor" onclick="nuevoProveedor()">Nuevo Proveedor</button>
        <div>
            <table id="tabla-proveedores">
                <tr class="impar">
                    <th>Empresa</th>
                    <th>Contacto</th>
                    <th>Estado</th>
                </tr>
                <tr class="par">
                    <td>Andina</td>
                    <td>andina@gmail.com</td>
                    <td>Activo</td>
                </tr>
                <tr class="impar">
                    <td>Soprole</td>
                    <td>soprole@gmail.com</td>
                    <td>Activo</td>
                </tr>
                <tr class="par">
                    <td>Cial</td>
                    <td>cial@gmail.com</td>
                    <td>Activo</td>
                </tr>
            </table>
        </div>
    </div>
    `;
}

function nuevoProveedor(){
    document.getElementById("form-nuevo-proveedor").classList.remove("tabla-oculta");
}

function mostrarReportes(){
    console.log("mostrando reportes");
    document.getElementById("zona_principal").innerHTML =`
        <div id="reportes">

        <h1>REPORTE DE VENTAS</h1> 
    <label for="combo-categoria"> Periodos: </label>
            <select name="categoria" id="combo-categoria">
                <option value="">Meses ▼</option>
                <option value="">Septiembre</option>
                <option value="">Agosto</option>
                <option value="">Julio</option>
    </select>

    <h3>VENTAS TOTALES DÍARIAS: 450.000</h3> 
    <h3>ÓRDENES: 20</h3>
    <button id="btn-generar-reporte" onclick="console.log('GENERARA REPORTE')">GENERAR REPORTE</button>
    </div>
    `;
}

function mostrarNotificaciones(){
    console.log("mostrando notificaciones");
    document.getElementById("zona_principal").innerHTML =`
    <div id="notificaciones">
        <h3>🔴 Stock crítico <br>
        Pan Hallulla tiene solo 2 unidades.</h3>

       <h3>🔴 Stock crítico <br>
        Leche SemiDescremada Colun 3un.</h3>

        <h3>🔴 Stock crítico <br>
        Arroz Pregraneado 1kg Banquete 5un.</h3>

        <button id="btn-nueva-notificacion" onclick="nuevaNotificacion()"> GENERAR NUEVA NOTIFICACIÓN</button>
    </div>
    `;
}

function nuevaNotificacion(){
    console.log("creando nueva notificacion")
    document.getElementById("nuevo-notificacion").classList.remove("tabla-oculta"); 
}

function mostrarUsuarios(){
    console.log("mostrando usuarios");
    document.getElementById("zona_principal").innerHTML =`
    <div id="usuarios">
        <h1>
            USUARIOS
        </h1>

        <div>
            <table id="tabla-usuarios">
                <tr class="impar">
                    <th>USUARIO</th>
                    <th>NOMBRE</th>
                    <th>ROL</th>
                    <th>ESTADO</th>
                </tr>
                <tr class="par">
                    <td>admin</td>
                    <td>Pedro Toledo</td>
                    <td>Administrador</td>
                    <td>✓ Activo</td>
                </tr>
                <tr class="impar">
                    <td>vendedor</td>
                    <td>Carolina Hermosilla</td>
                    <td>Vendedor</td>
                    <td>✓ Activo</td>
                </tr>
            </table>
                <button id="crear-nuevo-usuario" onclick="console.log('creando usuario')">Crear Nuevo Usuario</button>
        </div>
    </div>
    `;
}

function nuevoUsuario(){
    
}



/*FUNCIONES PEDRO*/ 
function mostrarDashboard(){
    console.log("mostrando dashboard");

    const rolActual = localStorage.getItem("rol");
    let etiquetaRol = "Invitado";

    if(rolActual == "admin"){
        etiquetaRol = "Administrador";
    } else if (rolActual=="vendedor") {
        etiquetaRol = "Cajero/a";
    }

    document.getElementById("zona_principal").innerHTML=`
    <div id="contenedor-dashboard">
        <h2>Bienvenid@, ${etiquetaRol}</h2> 

        <div id="informe-diario">
            <div class="tarjeta">
                <h3>Ventas hoy</h3>
                <p>$850.000</p>
            </div>
            <div class="tarjeta">
                <h3>Órdenes</h3>
                <p>25</p>
            </div>
            <div class="tarjeta">
                <h3>Stock Crítico</h3>
                <p>6</p>
            </div>
        </div>

        <div id="ventas-recientes">
            <h2>Ventas Recientes</h2>
            <table id="tabla-total-ventas">
                <tr class="impar">
                    <td>#2025</td>
                    <td>18:32</td>
                    <td>$15.900</td>
                    <td>Pagado</td>                  
                </tr>
                <tr class="par">
                    <td>#2024</td>
                    <td>18:20</td>
                    <td>$32.500</td>
                    <td>Pagado</td>  
                </tr>
                <tr class="impar">
                    <td>#2023</td>
                    <td>18:04</td>
                    <td>$8.990</td>
                    <td>Pendiente</td>                  
                </tr>
            </table>
        </div>

        <div id="alertas">
            <h2>⚠️ Alertas ⚠️</h2>
            <p>🔴 6 Productos con stock crítico</p>
            <p>⚠️ 3 Productos con bajo stock</p>
            <p>⚠️ 2 Pagos pendientes</p>
        </div>
    </div>
    `;
}

//funciones para ventas

const productos = [
    { sku: "BEB-01", codigo: "7801", nombre: "Bebida", descripcion: "Coca-cola 1lt retornable", precio: 1500},
    { sku: "GAL-01", codigo: "7802", nombre: "Galleta", descripcion: "Galletas Costa", precio: 990 },
    { sku: "LEC-01", codigo: "7803", nombre: "Leche", descripcion: "Leche entera 1 litro Colún", precio: 1200 },
    { sku: "PAN-01", codigo: "7804", nombre: "Pan", descripcion: "Marraqueta granel (1kg)", precio: 1900 },
    { sku: "MON-01", codigo: "7805", nombre: "Monster", descripcion: "Bebida energética 473ml", precio: 1990}
];

let carrito = [];

function mostrarNuevaVenta(){
    console.log("Cargando pantalla de venta...");
    carrito = []; // Reiniciamos el carrito para una venta limpia

    // Inyectamos todo el HTML de la venta dentro de zona_principal
    document.getElementById("zona_principal").innerHTML = `
        <div id="contenedor-venta">
            <div id="cabecera">
                <h1>NUEVA VENTA</h1>
                <h2>#00000001</h2>
            </div>

            <div id="datos-cliente">
                <h3>Cliente</h3>
                <div id="datos-cliente-contenido">
                    <label for="campo-cliente">Buscar cliente por rut</label>
                    <input id="campo-cliente" type="text" placeholder="ej: 11111111-1">
                    <button type="button">Buscar</button>
                </div>
            </div>

            <div id="datos-productos">
                <h3>Productos</h3>
                <label for="campo-producto">Buscar producto</label>
                <input id="campo-producto" type="text" placeholder="SKU, Nombre o Código">
                <button type="button" onclick="filtrarProductos()">Buscar</button>
                <br>
                <div id="contenedor-productos"></div>
            </div>

            <div id="detalle">
                <h3>Detalle</h3>
                <div id="tabla-detalle">
                    <table id="tabla-carrito">
                        <thead>
                            <tr class="impar">
                                <th><strong>Producto</strong></th>
                                <th><strong>Cant.</strong></th>
                                <th><strong>Precio</strong></th>
                                <th><strong>Total</strong></th>
                            </tr>
                        </thead>
                        <tbody id="cuerpo-detalle"></tbody>               
                    </table>
                </div>
                <p id="texto-subtotal">SUBTOTAL: $0</p>
                <p id="texto-total"><strong>TOTAL: $0</strong></p>

                <button type="button" id="btn-cancelar" onclick="cancelarVenta()">CANCELAR</button>
                <button type="button" id="btn-cobrar" onclick="generarVenta()">COBRAR</button>
            </div>
        </div>
    `;
    mostrarCatalogo(productos);
}

function mostrarCatalogo(lista){
    console.log("función mostrar catálogo")
    const contenedor = document.getElementById("contenedor-productos");
    contenedor.innerHTML="";

    if(lista.length == 0){
        contenedor.innerHTML="<p>No se encontraron productos.</p>";
        return;
    }

    for (let prod of lista){
        contenedor.innerHTML +=`
            <div class="tarjeta-producto" onclick="agregarAlCarrito('${prod.sku}')">
                <h3>${prod.nombre}</h3>
                <p><strong>$${prod.precio.toLocaleString("es-CL")}</strong></p>
                <p>${prod.descripcion}</p>
            </div>
        `;
    }
}

function filtrarProductos(){
    const texto = document.getElementById("campo-producto")
    texto = texto.value.trim();
    const filtrados=[];

    for(let prod of productos){
        if(prod.nombre.includes(texto)|| prod.sku.includes(texto)||prod.codigo.includes(texto)){
            filtrados.push(prod);
        }
    }

    mostrarCatalogo(filtrados);
}

function agregarAlCarrito(sku){
    let itemExistente = null;
    for(let item of carrito){
        if(item.sku == sku){
            itemExistente = item;
            break;
        }
    }

    if(itemExistente){
        itemExistente.cantidad++;
    } else {
        for(let prod of productos){
            if(prod.sku ==sku){
                carrito.push({
                    sku:prod.sku,
                    nombre: prod.nombre,
                    precio: prod.precio,
                    cantidad: 1
                });
                break;
            }
        }
    }
    actualizarTablaDetalle();
}

function actualizarTablaDetalle(){
    const cuerpo = document.getElementById("cuerpo-detalle");
    cuerpo.innerHTML="";
    let total = 0;
    let indice = 0;

    for(let item of carrito){
        const subtotalItem = item.precio * item.cantidad;
        total+=subtotalItem;
        const clase = (indice % 2 == 0) ? "par" : "impar";

        cuerpo.innerHTML+=`
            <tr class="${clase}">
                <td>${item.nombre}</td>
                <td>${item.cantidad}</td>
                <td>$${item.precio.toLocaleString("es-CL")}</td>
                <td>$${subtotalItem.toLocaleString("es-CL")}</td>
            </tr>
        `;
        indice++;
    }
    const totalTexto = "$"+total.toLocaleString("es-CL");
    document.getElementById("texto-subtotal").innerText = "SUBTOTAL: "+totalTexto;
    document.getElementById("texto-total").innerHTML = "<strong>TOTAL: "+totalTexto+"</strong>";
    
}

function cancelarVenta(){
    carrito = [];
    actualizarTablaDetalle()
}

function generarVenta(){
    
    let total = 0;
    for (let item of carrito){
        total+= item.precio * item.cantidad;
    }

    if(total == 0){
        alert("Debes agregar al menos un producto a la venta.");
        return;
    }

    console.log("venta generada, total: $"+total);

    document.getElementById("pago-total").innerText = "Total a pagar: $"+total.toLocaleString("es-CL");
    document.getElementById("cuadro-pago").classList.remove("cuadro-oculto");
}

function procesarPago(metodo){
    console.log("Venta completada con pago en "+metodo);
    cerrarCuadro();
    cancelarVenta();
}

function cerrarCuadro(){
    document.getElementById("cuadro-pago").classList.add("cuadro-oculto");
}

// fin elementos para generar la venta

function mostrarVentas(){
    console.log("mostrando ventas");

    document.getElementById("zona_principal").innerHTML=`

    <div id="informe-ventas">
        <h2>Informe de Ventas</h2>
        <div>
            <table id="tabla-total-ventas">
                <tr class="impar">
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unidad</th>
                    <th>Total</th>
                    <th>Método de Pago</th>
                </tr>
                <tr class="par">
                    <td>Leche</td>
                    <td>2</td>
                    <td>$1.500</td>
                    <td>$3.000</td>
                    <td>Efectivo</td>
                </tr>
                <tr class="impar">
                    <td>Arroz</td>
                    <td>1</td>
                    <td>$1.950</td>
                    <td>$3.900</td>
                    <td>Tarjeta</td>
                </tr>
                <tr class="par">
                    <td>Leche</td>
                    <td>2</td>
                    <td>$1.500</td>
                    <td>$3.000</td>
                    <td>Tarjeta</td>
                </tr>
                <tr class="impar">
                    <td>Monster</td>
                    <td>4</td>
                    <td>$1.600</td>
                    <td>$6.400</td>
                    <td>Tarjeta</td>
                </tr>
            </table>
        </div>
    </div> `;   

}

function mostrarPagos(){
    console.log("mostrando pagos");

    document.getElementById("zona_principal").innerHTML=`
    <div id="informe-ventas">
        <h2>Medios de Pago</h2>
        <div>
            <table id="tabla-total-ventas">
                <tr class="impar">
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Estado</th>
                </tr>
                <tr class="par">
                    <td>MP01</td>
                    <td>Efectivo</td>
                    <td>Activo✅</td>
                    <td><button type="button" onclick="cambiarEstadoMP(this)">✏️</button></td>                  
                </tr>
                <tr class="impar">
                    <td>MP02</td>
                    <td>Débito</td>
                    <td>Activo✅</td>
                    <td><button type="button" onclick="cambiarEstadoMP(this)">✏️</button></td> 
                </tr>
                <tr class="par">
                    <td>MP03</td>
                    <td>Crédito</td>
                    <td>Inactivo❌</td>
                    <td><button type="button" onclick="cambiarEstadoMP(this)">✏️</button></td>
                </tr>
                <tr class="impar">
                    <td>MP04</td>
                    <td>Pago Web</td>
                    <td>Activo✅</td>
                    <td><button type="button" onclick="cambiarEstadoMP(this)">✏️</button></td> 
                </tr>
            </table>
            <button id="btn-mov-inventario" onclick="nuevoMedio()">Agregar Método</button>
        </div>
    </div>`;
}

function nuevoMedio(){
    console.log("Agregando nuevo medio")
}

function cambiarEstadoMP(boton){
    const fila = boton.closest("tr");
    const celdaEstado = fila.cells[2];

    if(celdaEstado.innerHTML.includes("Activo")){
        celdaEstado.innerHTML = "Inactivo❌";
    } else {
        celdaEstado.innerHTML = "Activo✅";
    }
}

function mostrarFacturas(){
    console.log("mostrando facturas");
    document.getElementById("zona_principal").innerHTML=`
    <div id="informe-ventas">
        <h2>Facturas</h2>
        <div>
            <legend>Últimas Facturas</legend>
            <table id="tabla-total-ventas">
                <tr class="impar">
                    <th>N°</th>
                    <th>Orden</th>
                    <th>Total</th>
                    <th>Fecha</th>
                </tr>
                <tr class="par">
                    <td>00045</td>
                    <td>#000126</td>
                    <td>$5.600</td>
                    <td>04/09</td>                  
                </tr>
                <tr class="impar">
                    <td>00044</td>
                    <td>#000125</td>
                    <td>$15.900</td>
                    <td>03/09</td> 
                </tr>
            </table>
            <button id="btn-mov-inventario" onclick="generarFactura()">Generar Factura</button>
        </div>
    </div>`;
}

function generarFactura(){
    console.log("Generar Factura");
    document.getElementById("cuadro-facturas").classList.remove("cuadro-oculto");
}


function generarNuevaFactura(){
    console.log("Generando factura nueva");
}

function editarFactura(){
    console.log("Editando factura actual");
}

function cerrarCuadroFacturas(){
    document.getElementById("cuadro-facturas").classList.add("cuadro-oculto");
}


function mostrarSalir(){
    console.log("salir");

    localStorage.removeItem("rol");
    window.location.href = "index.html";
}

