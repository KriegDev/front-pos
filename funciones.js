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

function mostrarDashboard(){
    console.log("mostrando dashboard");
}

function mostrarNuevaVenta(){
    console.log("nueva venta");
}

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
