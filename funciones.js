//FUNCIONES LOGIN
function limpiar_errores(){
    console.log("funcion limpiar errores");
            const lista_errores = document.getElementsByClassName("mensaje-error");
            for(var elemento of lista_errores){
                elemento.innerHTML = "";
            }
        }

function irDashboard(rol){
    window.location.href="dashboard.html?rol=" +rol;
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
        return null;}}


//FUNCIONES DASHBOARD
        const rol = localStorage.getItem("rol");
        mostrarBotones(rol)
        
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
        document.getElementById("boton_mostrarProductos").style.display = "none";
        document.getElementById("boton_Clientes").style.display = "none";
        document.getElementById("boton_inventario").style.display = "none";
        document.getElementById("boton_proveedores").style.display = "none";
        document.getElementById("boton_reportes").style.display = "none";
        document.getElementById("boton_notificaciones").style.display = "none";
        document.getElementById("boton_usuarios").style.display = "none";
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
            <button id="btn-buscar-cli">buscar</button>

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
    console.log("mostrando clientes");
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

            <button id="btn-mov-inventario" onclick="movimientoInventario()"> VER MOVIMIENTOS</button>
            <button id="btn-bajo-stock" onclick="bajoStock()"> BAJO STOCK </button>
            <button id="btn-actualizar-stock" onclick="actualizarStockMinimo()"> ACTUALIZAR STOCK MÍNIMO </button>
        </div>
    </div>
    `;
}

function movimientoInventario(){
    console.log("mostrando movimientos inventario")
}

function bajoStock(){
    console.log("mostrando stock bajo")
}

function actualizarStockMinimo(){
    console.log("mostrando actualizar stock mínimo")
}

function mostrarProveedores(){
    console.log("mostrando proovedores");
}

function mostrarReportes(){
    console.log("mostrando reportes");
}

function mostrarNotificaciones(){
    console.log("mostrando notificaciones");
}

function mostrarUsuarios(){
    console.log("mostrando usuarios");
}



/*FUNCIONES PEDRO*/ 
function mostrarDashboard(){
    console.log("mostrando dashboard");
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
}

function mostrarPagos(){
    console.log("mostrando pagos");
}

function mostrarFacturas(){
    console.log("mostrando facturas");
}

function mostrarSalir(){
    console.log("salir");
}
