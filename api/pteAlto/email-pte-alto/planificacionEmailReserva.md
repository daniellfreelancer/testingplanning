# Envio de validacion de reserva

## Pasos y parametros:
- El email se enviara al correo del usuario que reservo el espacio o taller
- En el email se debe enviar con el detalle de la reserva y un QR generado que contenga el id de la reserva
- El QR debe ser generado con la libreria qrcode o  qrcode-generator que sea mas simple de implementar
- El QR debe ser generado con el id de la reserva
- El QR debe ser generado con el siguiente formato: https://api.vitalmoveglobal.com/reservas-pte-alto/validar-reserva/{id_reserva}
- El email debe ser enviado con el siguiente contenido:
- Datos de la reserva
- unicamente cuando la reserva es 'usuario' y que contenga el campo usuario.

