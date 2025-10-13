## Ejemplo de Response de pagos por institucion:

```json
{
    "pagos": [
        {
            "_id": "68cae4c0e1ad578c3b2db341",
            "usuario": {
                "_id": "68ade7c194af76fa2b53719d",
                "nombre": "Karys Naelle Adaia",
                "apellido": "Barroso Rojas",
                "email": "KENIEL.BARROSO@GMAIL.COM",
                "rut": "269425202"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "8585",
            "voucher": "52",
            "monto": 5000,
            "fechaPago": "2025-09-17T12:22:46.118Z",
            "recepcion": {
                "_id": "68c410962e7191fd7eb71371",
                "nombre": "Test",
                "apellido": "Prueba",
                "email": "daniellugofreelancer@gmail.com",
                "rut": "272101922"
            },
            "planCurso": {
                "_id": "68cab93e264d3edbb94d0123",
                "tipoPlan": "Curso Adulto 1",
                "plan": "1 dia / semana",
                "dias": [
                    "sabado"
                ],
                "valor": 30000
            },
            "createdAt": "2025-09-17T16:41:36.383Z",
            "updatedAt": "2025-09-17T16:41:36.383Z",
            "__v": 0
        },
        {
            "_id": "68d5ae02ad5e16bc7d332912",
            "usuario": null,
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "123456",
            "voucher": "123",
            "monto": 60000,
            "fechaPago": "2025-09-25T21:02:57.632Z",
            "recepcion": {
                "_id": "68c410962e7191fd7eb71371",
                "nombre": "Test",
                "apellido": "Prueba",
                "email": "daniellugofreelancer@gmail.com",
                "rut": "272101922"
            },
            "createdAt": "2025-09-25T21:02:58.190Z",
            "updatedAt": "2025-09-25T21:02:58.190Z",
            "__v": 0
        },
        {
            "_id": "68d5b1c9ad5e16bc7d332ae7",
            "usuario": null,
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "12121212",
            "voucher": "123",
            "monto": 11000,
            "fechaPago": "2025-09-25T21:19:05.616Z",
            "recepcion": {
                "_id": "6883988cc39c0f04380f04f8",
                "nombre": "Admin",
                "apellido": "Piscina Santiago",
                "email": "adminpiscinastgo@vitalmoveglobal.com",
                "rut": "0"
            },
            "createdAt": "2025-09-25T21:19:05.898Z",
            "updatedAt": "2025-09-25T21:19:05.898Z",
            "__v": 0
        },
        {
            "_id": "68de9749130e2aad07c422b6",
            "usuario": {
                "_id": "68da0e55ad5e16bc7d3374da",
                "nombre": "javier",
                "apellido": "viera",
                "email": "jjviera@vitalmoveglobal.com",
                "rut": "206361603"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "0001",
            "voucher": "52",
            "monto": 30000,
            "beneficio": "Residente-Santiago",
            "fechaPago": "2025-10-02T00:00:00.410Z",
            "recepcion": {
                "_id": "68c410962e7191fd7eb71371",
                "nombre": "Test",
                "apellido": "Prueba",
                "email": "daniellugofreelancer@gmail.com",
                "rut": "272101922"
            },
            "planId": null,
            "createdAt": "2025-10-02T15:16:25.800Z",
            "updatedAt": "2025-10-02T15:16:25.800Z",
            "__v": 0
        },
        {
            "_id": "68e039a494bba864d72573ef",
            "usuario": {
                "_id": "68da0e55ad5e16bc7d3374da",
                "nombre": "javier",
                "apellido": "viera",
                "email": "jjviera@vitalmoveglobal.com",
                "rut": "206361603"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "123456",
            "voucher": "123",
            "monto": 35000,
            "beneficio": "",
            "fechaPago": "2025-10-03T00:00:00.000Z",
            "recepcion": {
                "_id": "68c410962e7191fd7eb71371",
                "nombre": "Test",
                "apellido": "Prueba",
                "email": "daniellugofreelancer@gmail.com",
                "rut": "272101922"
            },
            "planId": null,
            "createdAt": "2025-10-03T21:01:24.012Z",
            "updatedAt": "2025-10-03T21:01:24.012Z",
            "__v": 0
        },
        {
            "_id": "68e3cc67fcd5f0de0ca19fc2",
            "usuario": {
                "_id": "68da0e55ad5e16bc7d3374da",
                "nombre": "javier",
                "apellido": "viera",
                "email": "jjviera@vitalmoveglobal.com",
                "rut": "206361603"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "123456",
            "voucher": "123",
            "monto": 40000,
            "beneficio": "",
            "fechaPago": "2025-10-06T00:00:00.000Z",
            "recepcion": {
                "_id": "68c410962e7191fd7eb71371",
                "nombre": "Test",
                "apellido": "Prueba",
                "email": "daniellugofreelancer@gmail.com",
                "rut": "272101922"
            },
            "planId": null,
            "createdAt": "2025-10-06T14:04:23.332Z",
            "updatedAt": "2025-10-06T14:04:23.332Z",
            "__v": 0
        },
        {
            "_id": "68e3cd00fcd5f0de0ca19fd5",
            "usuario": {
                "_id": "68da0e55ad5e16bc7d3374da",
                "nombre": "javier",
                "apellido": "viera",
                "email": "jjviera@vitalmoveglobal.com",
                "rut": "206361603"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "0001",
            "voucher": "52",
            "monto": 30000,
            "beneficio": "Residente-Santiago",
            "fechaPago": "2025-10-02T00:00:00.410Z",
            "recepcion": {
                "_id": "68c410962e7191fd7eb71371",
                "nombre": "Test",
                "apellido": "Prueba",
                "email": "daniellugofreelancer@gmail.com",
                "rut": "272101922"
            },
            "planId": null,
            "createdAt": "2025-10-06T14:06:56.874Z",
            "updatedAt": "2025-10-06T14:06:56.874Z",
            "__v": 0
        },
        {
            "_id": "68e40ed14f0ff1f111d5124b",
            "usuario": {
                "_id": "68da0e55ad5e16bc7d3374da",
                "nombre": "javier",
                "apellido": "viera",
                "email": "jjviera@vitalmoveglobal.com",
                "rut": "206361603"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "123",
            "voucher": "12312312",
            "monto": 10000,
            "beneficio": "",
            "fechaPago": "2025-10-06T18:40:08.781Z",
            "recepcion": {
                "_id": "6883988cc39c0f04380f04f8",
                "nombre": "Admin",
                "apellido": "Piscina Santiago",
                "email": "adminpiscinastgo@vitalmoveglobal.com",
                "rut": "0"
            },
            "planId": null,
            "createdAt": "2025-10-06T18:47:45.881Z",
            "updatedAt": "2025-10-06T18:47:45.881Z",
            "__v": 0
        },
        {
            "_id": "68e410174f0ff1f111d512ed",
            "usuario": {
                "_id": "68dd7e6d1e986cb9d41d0bce",
                "nombre": "javier",
                "apellido": "viera",
                "email": "jviera@vitalmoveglobal.com",
                "rut": "138360261"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "123456",
            "voucher": "123",
            "monto": 10000,
            "beneficio": "",
            "fechaPago": "2025-10-06T18:53:01.121Z",
            "recepcion": {
                "_id": "6883988cc39c0f04380f04f8",
                "nombre": "Admin",
                "apellido": "Piscina Santiago",
                "email": "adminpiscinastgo@vitalmoveglobal.com",
                "rut": "0"
            },
            "planId": null,
            "createdAt": "2025-10-06T18:53:11.537Z",
            "updatedAt": "2025-10-06T18:53:11.537Z",
            "__v": 0
        },
        {
            "_id": "68e5113cea5fd68d8f70f3de",
            "usuario": {
                "_id": "68da0e55ad5e16bc7d3374da",
                "nombre": "javier",
                "apellido": "viera",
                "email": "jjviera@vitalmoveglobal.com",
                "rut": "206361603"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "0001",
            "voucher": "52",
            "monto": 10000,
            "beneficio": "Residente-Santiago",
            "fechaPago": "2025-10-07T08:00:00.410Z",
            "recepcion": {
                "_id": "68c410962e7191fd7eb71371",
                "nombre": "Test",
                "apellido": "Prueba",
                "email": "daniellugofreelancer@gmail.com",
                "rut": "272101922"
            },
            "planId": null,
            "createdAt": "2025-10-07T13:10:20.339Z",
            "updatedAt": "2025-10-07T13:10:20.339Z",
            "__v": 0
        },
        {
            "_id": "68e5570b4f0ff1f111d531b3",
            "usuario": {
                "_id": "68dd7e6d1e986cb9d41d0bce",
                "nombre": "javier",
                "apellido": "viera",
                "email": "jviera@vitalmoveglobal.com",
                "rut": "138360261"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "123456",
            "voucher": "123",
            "monto": 10000,
            "beneficio": "",
            "fechaPago": "2025-10-07T18:07:56.939Z",
            "recepcion": {
                "_id": "6883988cc39c0f04380f04f8",
                "nombre": "Admin",
                "apellido": "Piscina Santiago",
                "email": "adminpiscinastgo@vitalmoveglobal.com",
                "rut": "0"
            },
            "planId": null,
            "createdAt": "2025-10-07T18:08:11.935Z",
            "updatedAt": "2025-10-07T18:08:11.935Z",
            "__v": 0
        },
        {
            "_id": "68e664b34e3edd13eb6cf698",
            "usuario": {
                "_id": "68e569424f0ff1f111d53491",
                "nombre": "Matias",
                "apellido": "Test",
                "email": "jviera@vitalmoveglobal.com",
                "rut": "202020201"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "123456",
            "voucher": "123",
            "monto": 60000,
            "beneficio": "",
            "fechaPago": "2025-10-08T13:18:31.986Z",
            "recepcion": {
                "_id": "6883988cc39c0f04380f04f8",
                "nombre": "Admin",
                "apellido": "Piscina Santiago",
                "email": "adminpiscinastgo@vitalmoveglobal.com",
                "rut": "0"
            },
            "planId": null,
            "createdAt": "2025-10-08T13:18:43.295Z",
            "updatedAt": "2025-10-08T13:18:43.295Z",
            "__v": 0
        },
        {
            "_id": "68e675394e3edd13eb6d0b24",
            "usuario": {
                "_id": "68da0e55ad5e16bc7d3374da",
                "nombre": "javier",
                "apellido": "viera",
                "email": "jjviera@vitalmoveglobal.com",
                "rut": "206361603"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "0009",
            "voucher": "0",
            "monto": 30000,
            "beneficio": "",
            "fechaPago": "2025-10-08T09:00:00.410Z",
            "recepcion": {
                "_id": "68c410962e7191fd7eb71371",
                "nombre": "Test",
                "apellido": "Prueba",
                "email": "daniellugofreelancer@gmail.com",
                "rut": "272101922"
            },
            "planId": null,
            "createdAt": "2025-10-08T14:29:13.167Z",
            "updatedAt": "2025-10-08T14:29:13.167Z",
            "__v": 0
        },
        {
            "_id": "68e7fb0284584778ad0dbb6a",
            "usuario": {
                "_id": "68da0e55ad5e16bc7d3374da",
                "nombre": "javier",
                "apellido": "viera",
                "email": "jjviera@vitalmoveglobal.com",
                "rut": "206361603"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "0009",
            "voucher": "0",
            "monto": 25000,
            "beneficio": "",
            "fechaPago": "2025-10-09T09:00:00.410Z",
            "recepcion": {
                "_id": "68c410962e7191fd7eb71371",
                "nombre": "Test",
                "apellido": "Prueba",
                "email": "daniellugofreelancer@gmail.com",
                "rut": "272101922"
            },
            "planId": null,
            "createdAt": "2025-10-09T18:12:18.753Z",
            "updatedAt": "2025-10-09T18:12:18.753Z",
            "__v": 0
        },
        {
            "_id": "68e92347c810fbfce021d96d",
            "usuario": {
                "_id": "68da0e55ad5e16bc7d3374da",
                "nombre": "javier",
                "apellido": "viera",
                "email": "jjviera@vitalmoveglobal.com",
                "rut": "206361603"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "12132",
            "voucher": "1231",
            "monto": 10000,
            "beneficio": "",
            "fechaPago": "2025-10-10T14:57:10.594Z",
            "recepcion": {
                "_id": "6883988cc39c0f04380f04f8",
                "nombre": "Admin",
                "apellido": "Piscina Santiago",
                "email": "adminpiscinastgo@vitalmoveglobal.com",
                "rut": "0"
            },
            "planId": null,
            "createdAt": "2025-10-10T15:16:23.750Z",
            "updatedAt": "2025-10-10T15:16:23.750Z",
            "__v": 0
        },
        {
            "_id": "68e9f4655dabe9306c3d10e6",
            "usuario": {
                "_id": "68da0e55ad5e16bc7d3374da",
                "nombre": "javier",
                "apellido": "viera",
                "email": "jjviera@vitalmoveglobal.com",
                "rut": "206361603"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "1123",
            "voucher": "123",
            "monto": 7000,
            "beneficio": "funcionario-municipal",
            "fechaPago": "2025-10-11T06:08:12.955Z",
            "recepcion": {
                "_id": "6883988cc39c0f04380f04f8",
                "nombre": "Admin",
                "apellido": "Piscina Santiago",
                "email": "adminpiscinastgo@vitalmoveglobal.com",
                "rut": "0"
            },
            "planId": null,
            "createdAt": "2025-10-11T06:08:37.803Z",
            "updatedAt": "2025-10-11T06:08:37.803Z",
            "__v": 0
        },
        {
            "_id": "68e9f4e05dabe9306c3d10f0",
            "usuario": {
                "_id": "68da0e55ad5e16bc7d3374da",
                "nombre": "javier",
                "apellido": "viera",
                "email": "jjviera@vitalmoveglobal.com",
                "rut": "206361603"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "0009",
            "voucher": "0",
            "monto": 30000,
            "beneficio": "",
            "fechaPago": "2025-10-08T09:00:00.410Z",
            "recepcion": {
                "_id": "68c410962e7191fd7eb71371",
                "nombre": "Test",
                "apellido": "Prueba",
                "email": "daniellugofreelancer@gmail.com",
                "rut": "272101922"
            },
            "planId": null,
            "createdAt": "2025-10-11T06:10:40.511Z",
            "updatedAt": "2025-10-11T06:10:40.511Z",
            "__v": 0
        },
        {
            "_id": "68e9f7ba5dabe9306c3d14a7",
            "usuario": {
                "_id": "68da0e55ad5e16bc7d3374da",
                "nombre": "javier",
                "apellido": "viera",
                "email": "jjviera@vitalmoveglobal.com",
                "rut": "206361603"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "123",
            "voucher": "123",
            "monto": 24000,
            "beneficio": "vecino-comuna",
            "fechaPago": "2025-10-11T06:22:36.917Z",
            "recepcion": {
                "_id": "6883988cc39c0f04380f04f8",
                "nombre": "Admin",
                "apellido": "Piscina Santiago",
                "email": "adminpiscinastgo@vitalmoveglobal.com",
                "rut": "0"
            },
            "planId": {
                "_id": "68e6fd934e3edd13eb6d294c",
                "tipo": "curso",
                "nombrePlan": "Curso adulto 1",
                "valor": 30000
            },
            "createdAt": "2025-10-11T06:22:50.412Z",
            "updatedAt": "2025-10-11T06:22:50.412Z",
            "__v": 0
        },
        {
            "_id": "68e9f7d25dabe9306c3d14bb",
            "usuario": {
                "_id": "68dd7e6d1e986cb9d41d0bce",
                "nombre": "javier",
                "apellido": "viera",
                "email": "jviera@vitalmoveglobal.com",
                "rut": "138360261"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "123",
            "voucher": "123",
            "monto": 8000,
            "beneficio": "vecino-comuna",
            "fechaPago": "2025-10-11T06:23:02.363Z",
            "recepcion": {
                "_id": "6883988cc39c0f04380f04f8",
                "nombre": "Admin",
                "apellido": "Piscina Santiago",
                "email": "adminpiscinastgo@vitalmoveglobal.com",
                "rut": "0"
            },
            "planId": null,
            "createdAt": "2025-10-11T06:23:14.106Z",
            "updatedAt": "2025-10-11T06:23:14.106Z",
            "__v": 0
        },
        {
            "_id": "68e9f8715dabe9306c3d14c6",
            "usuario": {
                "_id": "68da0e55ad5e16bc7d3374da",
                "nombre": "javier",
                "apellido": "viera",
                "email": "jjviera@vitalmoveglobal.com",
                "rut": "206361603"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "123",
            "voucher": "123",
            "monto": 28800,
            "beneficio": "vecino-comuna",
            "fechaPago": "2025-10-11T06:25:45.475Z",
            "recepcion": {
                "_id": "6883988cc39c0f04380f04f8",
                "nombre": "Admin",
                "apellido": "Piscina Santiago",
                "email": "adminpiscinastgo@vitalmoveglobal.com",
                "rut": "0"
            },
            "planId": {
                "_id": "68e6e7a94e3edd13eb6d2761",
                "tipo": "nadoLibre",
                "nombrePlan": "Nado libre 8",
                "valor": 36000
            },
            "createdAt": "2025-10-11T06:25:53.146Z",
            "updatedAt": "2025-10-11T06:25:53.146Z",
            "__v": 0
        },
        {
            "_id": "68e9f8985dabe9306c3d1840",
            "usuario": {
                "_id": "68da0e55ad5e16bc7d3374da",
                "nombre": "javier",
                "apellido": "viera",
                "email": "jjviera@vitalmoveglobal.com",
                "rut": "206361603"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "123456",
            "voucher": "`12",
            "monto": 8000,
            "beneficio": "vecino-comuna",
            "fechaPago": "2025-10-11T06:26:24.392Z",
            "recepcion": {
                "_id": "6883988cc39c0f04380f04f8",
                "nombre": "Admin",
                "apellido": "Piscina Santiago",
                "email": "adminpiscinastgo@vitalmoveglobal.com",
                "rut": "0"
            },
            "planId": null,
            "createdAt": "2025-10-11T06:26:32.603Z",
            "updatedAt": "2025-10-11T06:26:32.603Z",
            "__v": 0
        },
        {
            "_id": "68e9f94c5dabe9306c3d1843",
            "usuario": {
                "_id": "68da0e55ad5e16bc7d3374da",
                "nombre": "javier",
                "apellido": "viera",
                "email": "jjviera@vitalmoveglobal.com",
                "rut": "206361603"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "123456",
            "voucher": "`12",
            "monto": 8000,
            "beneficio": "vecino-comuna",
            "fechaPago": "2025-10-11T06:26:24.392Z",
            "recepcion": {
                "_id": "6883988cc39c0f04380f04f8",
                "nombre": "Admin",
                "apellido": "Piscina Santiago",
                "email": "adminpiscinastgo@vitalmoveglobal.com",
                "rut": "0"
            },
            "planId": null,
            "createdAt": "2025-10-11T06:29:32.397Z",
            "updatedAt": "2025-10-11T06:29:32.397Z",
            "__v": 0
        },
        {
            "_id": "68e9f96c5dabe9306c3d197a",
            "usuario": {
                "_id": "68da0e55ad5e16bc7d3374da",
                "nombre": "javier",
                "apellido": "viera",
                "email": "jjviera@vitalmoveglobal.com",
                "rut": "206361603"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "123456",
            "voucher": "123",
            "monto": 16000,
            "beneficio": "vecino-comuna",
            "fechaPago": "2025-10-11T06:29:52.281Z",
            "recepcion": {
                "_id": "6883988cc39c0f04380f04f8",
                "nombre": "Admin",
                "apellido": "Piscina Santiago",
                "email": "adminpiscinastgo@vitalmoveglobal.com",
                "rut": "0"
            },
            "planId": {
                "_id": "68e6e78c4e3edd13eb6d2752",
                "tipo": "nadoLibre",
                "nombrePlan": "Nado libre 4",
                "valor": 20000
            },
            "createdAt": "2025-10-11T06:30:04.215Z",
            "updatedAt": "2025-10-11T06:30:04.215Z",
            "__v": 0
        },
        {
            "_id": "68e9fc415dabe9306c3d27e6",
            "usuario": {
                "_id": "68da0e55ad5e16bc7d3374da",
                "nombre": "javier",
                "apellido": "viera",
                "email": "jjviera@vitalmoveglobal.com",
                "rut": "206361603"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "123456",
            "voucher": "123",
            "monto": 20000,
            "beneficio": "vecino-comuna",
            "fechaPago": "2025-10-11T06:42:02.005Z",
            "recepcion": {
                "_id": "6883988cc39c0f04380f04f8",
                "nombre": "Admin",
                "apellido": "Piscina Santiago",
                "email": "adminpiscinastgo@vitalmoveglobal.com",
                "rut": "0"
            },
            "planId": null,
            "createdAt": "2025-10-11T06:42:09.668Z",
            "updatedAt": "2025-10-11T06:42:09.668Z",
            "__v": 0
        },
        {
            "_id": "68ebe0a05dabe9306c3d538c",
            "usuario": {
                "_id": "68da0e55ad5e16bc7d3374da",
                "nombre": "javier",
                "apellido": "viera",
                "email": "jjviera@vitalmoveglobal.com",
                "rut": "206361603"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "12132",
            "voucher": "1231",
            "monto": 40000,
            "beneficio": "",
            "fechaPago": "2025-10-12T17:08:41.330Z",
            "recepcion": {
                "_id": "6883988cc39c0f04380f04f8",
                "nombre": "Admin",
                "apellido": "Piscina Santiago",
                "email": "adminpiscinastgo@vitalmoveglobal.com",
                "rut": "0"
            },
            "planId": null,
            "createdAt": "2025-10-12T17:08:48.226Z",
            "updatedAt": "2025-10-12T17:08:48.226Z",
            "__v": 0
        },
        {
            "_id": "68ece2b75dabe9306c3db3ba",
            "usuario": {
                "_id": "68af284ec9d044dc1b5d325c",
                "nombre": "Yuraima ",
                "apellido": "Castillo ",
                "email": "yrosani9@gmail.com",
                "rut": "269530235"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "2461",
            "voucher": "2461",
            "monto": 28800,
            "beneficio": "vecino-comuna",
            "fechaPago": "2025-10-13T11:27:37.194Z",
            "recepcion": {
                "_id": "68dc42e5ad5e16bc7d338ed5",
                "nombre": "Giselle",
                "apellido": "Palominos",
                "email": "gpalominos@piscinatemperadastgo.cl",
                "rut": "192391415"
            },
            "planId": {
                "_id": "68e6e7a94e3edd13eb6d2761",
                "tipo": "nadoLibre",
                "nombrePlan": "Nado libre 8",
                "valor": 36000
            },
            "createdAt": "2025-10-13T11:29:59.966Z",
            "updatedAt": "2025-10-13T11:29:59.966Z",
            "__v": 0
        },
        {
            "_id": "68ece4695dabe9306c3db412",
            "usuario": {
                "_id": "68ecd5255dabe9306c3d86ec",
                "nombre": "Eliseo",
                "apellido": "Albornoz Riquelme ",
                "email": "eliseo.albornoz@gmail.com",
                "rut": "74622267"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "2462",
            "voucher": "2462",
            "monto": 36000,
            "beneficio": "",
            "fechaPago": "2025-10-15T05:34:00.000Z",
            "recepcion": {
                "_id": "68dc42e5ad5e16bc7d338ed5",
                "nombre": "Giselle",
                "apellido": "Palominos",
                "email": "gpalominos@piscinatemperadastgo.cl",
                "rut": "192391415"
            },
            "planId": {
                "_id": "68e6e7a94e3edd13eb6d2761",
                "tipo": "nadoLibre",
                "nombrePlan": "Nado libre 8",
                "valor": 36000
            },
            "createdAt": "2025-10-13T11:37:13.864Z",
            "updatedAt": "2025-10-13T11:37:13.864Z",
            "__v": 0
        },
        {
            "_id": "68ecf6425dabe9306c3de08f",
            "usuario": {
                "_id": "68ecdffc5dabe9306c3d9f50",
                "nombre": "Camila",
                "apellido": "Ortega Arriagada",
                "email": "camila.oa18@gmail.com",
                "rut": "188629962"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "2466",
            "voucher": "2466",
            "monto": 60000,
            "beneficio": "",
            "fechaPago": "2025-10-13T12:52:56.582Z",
            "recepcion": {
                "_id": "68dc42e5ad5e16bc7d338ed5",
                "nombre": "Giselle",
                "apellido": "Palominos",
                "email": "gpalominos@piscinatemperadastgo.cl",
                "rut": "192391415"
            },
            "planId": {
                "_id": "68e6fe504e3edd13eb6d2962",
                "tipo": "curso",
                "nombrePlan": "Curso adulto 3",
                "valor": 60000
            },
            "createdAt": "2025-10-13T12:53:22.697Z",
            "updatedAt": "2025-10-13T12:53:22.697Z",
            "__v": 0
        },
        {
            "_id": "68ed06c65dabe9306c3df63b",
            "usuario": {
                "_id": "68ae6efadd7324007d6c315b",
                "nombre": "EDUARDO ANDRES",
                "apellido": "VEGA PINO",
                "email": "EDUARDO.VEGA.PINO@GMAIL.COM",
                "rut": "168762550"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "2470",
            "voucher": "2470",
            "monto": 28800,
            "beneficio": "vecino-comuna",
            "fechaPago": "2025-10-13T14:00:04.443Z",
            "recepcion": {
                "_id": "68dc42e5ad5e16bc7d338ed5",
                "nombre": "Giselle",
                "apellido": "Palominos",
                "email": "gpalominos@piscinatemperadastgo.cl",
                "rut": "192391415"
            },
            "planId": {
                "_id": "68e6e7a94e3edd13eb6d2761",
                "tipo": "nadoLibre",
                "nombrePlan": "Nado libre 8",
                "valor": 36000
            },
            "createdAt": "2025-10-13T14:03:50.283Z",
            "updatedAt": "2025-10-13T14:03:50.283Z",
            "__v": 0
        },
        {
            "_id": "68ed0ae15dabe9306c3dfdda",
            "usuario": {
                "_id": "68e3eca88582ce590a24a208",
                "nombre": "Francisca",
                "apellido": "ZAMORANO Peña",
                "email": "franyzp@gmail.com",
                "rut": "200739108"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "2471",
            "voucher": "2471",
            "monto": 5000,
            "beneficio": "",
            "fechaPago": "2025-10-13T14:20:08.570Z",
            "recepcion": {
                "_id": "68dc42e5ad5e16bc7d338ed5",
                "nombre": "Giselle",
                "apellido": "Palominos",
                "email": "gpalominos@piscinatemperadastgo.cl",
                "rut": "192391415"
            },
            "planId": {
                "_id": "68e6e81a4e3edd13eb6d2789",
                "tipo": "nadoLibre",
                "nombrePlan": "Pase diario (Hora baja)",
                "valor": 5000
            },
            "createdAt": "2025-10-13T14:21:21.821Z",
            "updatedAt": "2025-10-13T14:21:21.821Z",
            "__v": 0
        }
    ],
    "success": true
}
```