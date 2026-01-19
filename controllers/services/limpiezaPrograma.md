# Objetivo del controlador de limpieza de programas

- Obtener la informacion de los programas y talleres de la institucion por medio del id del programa.

## Ejemplo de respuesta de obtener programa por _id: en /controllers/programController.js

```json
{
    "response": {
        "_id": "656f703e77158b0bea26c324",
        "name": "Colo Colo Dragones de la reina",
        "admins": [
            {
                "_id": "64369a112e5e73d7c29462bd",
                "name": "Andres",
                "lastName": "Alvarado",
                "email": "rodrigo.viera.c@gmail.com",
                "role": "SUPF",
                "rut": "71985552K",
                "logged": "true"
            }
        ],
        "teachers": [
            {
                "_id": "689b9e29f59df80031a42742",
                "name": "Eduardo",
                "lastName": "Alvarez",
                "email": "eduardo.alvarez.monroy@gmail.com",
                "role": "SUPF",
                "rut": "185481582",
                "logged": "false",
                "imgUrl": null,
                "phone": "988082234"
            },
            {
                "_id": "64369a832e5e73d7c29462c5",
                "name": "Eduardo",
                "lastName": "Espinoza",
                "email": "eduardo.espinoza13101@gmail.com",
                "role": "SUPF",
                "rut": "78255552K",
                "logged": "true",
                "imgUrl": "imgUrl-a5cf81a2232b9ca555f5d333ae708f31b0727996c0d981cd6c10dea71e391381.jpg",
                "phone": ""
            },
            {
                "_id": "68d5cf59ad5e16bc7d332e4d",
                "name": "Israel",
                "lastName": "Ormeño",
                "email": "israelormenolopez@gmail.com",
                "role": "SUPF",
                "rut": "900000000k",
                "logged": "false",
                "imgUrl": null,
                "phone": "0"
            },
            {
                "_id": "68c1d01ea082b68c01b1fc9c",
                "name": "Entrenador",
                "lastName": "Test",
                "email": "entrenadortest@vm.cl",
                "role": "SUPF",
                "rut": "8520000",
                "logged": "false",
                "imgUrl": null,
                "phone": "0"
            },
            {
                "_id": "68a1e8c5e797e956941ec26e",
                "name": "Vidal",
                "lastName": "Valdivia",
                "email": "vivaldivia45@gmail.com",
                "role": "SUPF",
                "rut": "900000003k",
                "logged": "true",
                "imgUrl": null,
                "phone": "81534348"
            },
            {
                "_id": "68a1e8ffe797e956941ec27b",
                "name": "Hernan",
                "lastName": "Velazquez",
                "email": "HAVR2002@HOTMAIL.COM",
                "role": "SUPF",
                "rut": "185481584",
                "logged": "false",
                "imgUrl": null,
                "phone": "81534341"
            }
        ],
        "workshops": [
            {
                "_id": "656f70dc77158b0bea26c333",
                "name": "Sub 11",
                "teacher": [
                    {
                        "_id": "64369a832e5e73d7c29462c5",
                        "name": "Eduardo",
                        "lastName": "Espinoza",
                        "email": "eduardo.espinoza13101@gmail.com",
                        "role": "SUPF",
                        "rut": "78255552K",
                        "logged": "true",
                        "age": 39,
                        "gender": "male",
                        "phone": "",
                        "size": 177,
                        "weight": 90
                    },
                    {
                        "_id": "689b9e29f59df80031a42742",
                        "name": "Eduardo",
                        "lastName": "Alvarez",
                        "email": "eduardo.alvarez.monroy@gmail.com",
                        "role": "SUPF",
                        "rut": "185481582",
                        "logged": "false",
                        "phone": "988082234",
                        "gender": "male",
                        "age": 28,
                        "weight": null,
                        "size": null
                    }
                ],
                "students": [
                    {
                        "_id": "68c1cfc4a082b68c01b1fc52",
                        "name": "Jugador",
                        "lastName": "Test",
                        "age": 0,
                        "weight": 0,
                        "size": 0,
                        "email": "jugadortest@vm.cl",
                        "phone": "0",
                        "rut": "93666666000",
                        "gender": "-",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d5739b796948ac45cf4807",
                        "name": "BRUNO",
                        "lastName": "NUÑEZ",
                        "age": 11,
                        "email": "BN39@vm.com",
                        "rut": "4411",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d5739b796948ac45cf480c",
                        "name": "EMILIANO",
                        "lastName": "VIDAL",
                        "age": 11,
                        "email": "EV40@vm.com",
                        "rut": "3842",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d5739b796948ac45cf4811",
                        "name": "LAUTARO",
                        "lastName": "REYES",
                        "age": 10,
                        "email": "LR41@vm.com",
                        "rut": "8159",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d5739c796948ac45cf4816",
                        "name": "LIAM",
                        "lastName": "CHERO",
                        "age": 10,
                        "email": "LC42@vm.com",
                        "rut": "7179",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d5739c796948ac45cf4820",
                        "name": "MAXIMILIANO",
                        "lastName": "GONZALEZ",
                        "age": 11,
                        "email": "MG44@vm.com",
                        "rut": "4716",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d5739d796948ac45cf4825",
                        "name": "AUGUSTO",
                        "lastName": "QUEVEDO",
                        "age": 10,
                        "email": "AQ45@vm.com",
                        "rut": "9830",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d5739d796948ac45cf482a",
                        "name": "SANTIAGO",
                        "lastName": "BRAVO",
                        "age": 11,
                        "email": "SB46@vm.com",
                        "rut": "6374",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d5739d796948ac45cf482f",
                        "name": "CLEMENTE",
                        "lastName": "GONZALEZ",
                        "age": 11,
                        "email": "CG47@vm.com",
                        "rut": "5575",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d5739e796948ac45cf4839",
                        "name": "TOMAS",
                        "lastName": "AYALA",
                        "age": 10,
                        "email": "TA49@vm.com",
                        "rut": "2880",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d5739e796948ac45cf483e",
                        "name": "MAXIMO",
                        "lastName": "REYES",
                        "age": 10,
                        "email": "MR50@vm.com",
                        "rut": "7276",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d5739f796948ac45cf4843",
                        "name": "SEBASTIAN",
                        "lastName": "VERA",
                        "age": 10,
                        "email": "SV51@vm.com",
                        "rut": "2422",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d5739f796948ac45cf4848",
                        "name": "BENJAMIN",
                        "lastName": "OLGUIN",
                        "age": 10,
                        "email": "BO52@vm.com",
                        "rut": "3144",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d5739f796948ac45cf484d",
                        "name": "ALBERT",
                        "lastName": "ROQUE",
                        "age": 10,
                        "email": "AR53@vm.com",
                        "rut": "6244",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a0796948ac45cf4857",
                        "name": "ALEXIS",
                        "lastName": "MORENO",
                        "age": 11,
                        "email": "AM55@vm.com",
                        "rut": "5430",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a0796948ac45cf4861",
                        "name": "BORJA",
                        "lastName": "UNZAGA",
                        "age": 11,
                        "email": "BU57@vm.com",
                        "rut": "9027",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a1796948ac45cf4866",
                        "name": "SEBASTIAN",
                        "lastName": "SOTO",
                        "age": 11,
                        "email": "SS58@vm.com",
                        "rut": "1778",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a3796948ac45cf4884",
                        "name": "IGNACIO",
                        "lastName": "MASFERRER",
                        "age": 11,
                        "email": "IM64@vm.com",
                        "rut": "5187",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a3796948ac45cf4893",
                        "name": "NICOLAS",
                        "lastName": "CONTRERAS",
                        "age": 11,
                        "email": "NC67@vm.com",
                        "rut": "9545",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a5796948ac45cf48b1",
                        "name": "DEMIAN",
                        "lastName": "ALFARO",
                        "age": 11,
                        "email": "DA73@vm.com",
                        "rut": "9344",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b5796948ac45cf49bf",
                        "name": "VICENTE",
                        "lastName": "MARCOS",
                        "age": 10,
                        "email": "VM127@vm.com",
                        "rut": "2725",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    }
                ],
                "planner": [
                    {
                        "_id": "68d7db48ad5e16bc7d33600a",
                        "duration": 90,
                        "content": "Pases ",
                        "learningObjectives": "Dar un buen pase ",
                        "activities": "Enlace de pases ",
                        "materials": [
                            "[{\"value\":\"Balón de futbol\",\"id\":\"4\",\"label\":\"Balón de futbol\"}]"
                        ]
                    },
                    {
                        "_id": "68d7edc3ad5e16bc7d33621f",
                        "duration": 90,
                        "content": "Pases y tiro",
                        "learningObjectives": "Mejorar el pase y el tiro ",
                        "activities": "Enlace de pases con finalización ",
                        "materials": [
                            "[{\"value\":\"Balón de futbol\",\"id\":\"4\",\"label\":\"Balón de futbol\"}]"
                        ]
                    },
                    {
                        "_id": "68d9df62ad5e16bc7d337154",
                        "duration": 90,
                        "content": "Habilidades ",
                        "learningObjectives": "Jajsnajs",
                        "activities": "Jsjsbsusns",
                        "materials": [
                            "[{\"value\":\"Balón de futbol\",\"id\":\"4\",\"label\":\"Balón de futbol\"}]"
                        ]
                    },
                    {
                        "_id": "68e07d4d94bba864d7257777",
                        "duration": 90,
                        "content": "Pases y pasos de la marcación ",
                        "learningObjectives": "Perfeccionar el fundamento técnico del pase y mejorar los pasos de la marcación al rival ",
                        "activities": "Enlaces de pases sin y con oposición.\nJuegos de posesión de balón ",
                        "materials": [
                            "[{\"value\":\"Balón de futbol\",\"id\":\"4\",\"label\":\"Balón de futbol\"}]"
                        ]
                    },
                    {
                        "_id": "68ea46c35dabe9306c3d2b0d",
                        "duration": 90,
                        "content": "Presión post pérdida \nTransición defensiva ",
                        "learningObjectives": "Mejorar la transición defensiva con la presión post pérdida del balón ",
                        "activities": "Enlaces de pases donde generen una presión pasiva \nRondos para ir presionando ",
                        "materials": [
                            "[{\"value\":\"Balón de futbol\",\"id\":\"4\",\"label\":\"Balón de futbol\"}]"
                        ]
                    },
                    {
                        "_id": "68fc1492f396142417043579",
                        "duration": 90,
                        "content": "Conducción ",
                        "learningObjectives": "Generar la conducción con vista levantada y elementos de la conducción ",
                        "activities": "Conducción frente a frente, después con un juego",
                        "materials": [
                            "[{\"value\":\"Balón de futbol\",\"id\":\"4\",\"label\":\"Balón de futbol\"}]"
                        ]
                    }
                ],
                "address": "Talinay 9105, 7880755 La Reina, Región Metropolitana, Chile",
                "email": "colocolodragonesdelareina@vitalmove.cl",
                "phone": "935763252",
                "ageRange": [
                    "10",
                    "12"
                ],
                "days": [
                    "Sábado"
                ],
                "hours": {
                    "start": "10:30:00",
                    "end": "12:00:00"
                }
            },
            {
                "_id": "65b90df4cda2702220b00874",
                "name": "Sub 7",
                "teacher": [
                    {
                        "_id": "64369a832e5e73d7c29462c5",
                        "name": "Eduardo",
                        "lastName": "Espinoza",
                        "email": "eduardo.espinoza13101@gmail.com",
                        "role": "SUPF",
                        "rut": "78255552K",
                        "logged": "true",
                        "age": 39,
                        "gender": "male",
                        "phone": "",
                        "size": 177,
                        "weight": 90
                    },
                    {
                        "_id": "68d5cf59ad5e16bc7d332e4d",
                        "name": "Israel",
                        "lastName": "Ormeño",
                        "email": "israelormenolopez@gmail.com",
                        "role": "SUPF",
                        "rut": "900000000k",
                        "logged": "false",
                        "phone": "0",
                        "gender": "",
                        "age": 0,
                        "weight": null,
                        "size": null
                    }
                ],
                "students": [
                    {
                        "_id": "68d5738f796948ac45cf474e",
                        "name": "JONATHAN",
                        "lastName": "CAMPOS",
                        "age": 6,
                        "email": "JC2@vm.com",
                        "rut": "3337",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57390796948ac45cf4758",
                        "name": "VICENTE",
                        "lastName": "ROBLES",
                        "age": 7,
                        "email": "VR4@vm.com",
                        "rut": "6759",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57390796948ac45cf475d",
                        "name": "MILANO",
                        "lastName": "VASQUEZ",
                        "age": 6,
                        "email": "MV5@vm.com",
                        "rut": "4160",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57390796948ac45cf4762",
                        "name": "RAMON",
                        "lastName": "QUEVEDO",
                        "age": 7,
                        "email": "RQ6@vm.com",
                        "rut": "9738",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57391796948ac45cf4767",
                        "name": "SEBASTIAN",
                        "lastName": "ALTAMIRANO",
                        "age": 7,
                        "email": "SA7@vm.com",
                        "rut": "6395",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57391796948ac45cf476c",
                        "name": "JOAQUIN",
                        "lastName": "MUÑOZ",
                        "age": 7,
                        "email": "JM8@vm.com",
                        "rut": "1995",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57391796948ac45cf4771",
                        "name": "LUKAS",
                        "lastName": "ESPINOZA",
                        "age": 6,
                        "email": "LE9@vm.com",
                        "rut": "8996",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57392796948ac45cf4776",
                        "name": "LUCAS",
                        "lastName": "LACOSTE",
                        "age": 7,
                        "email": "LL10@vm.com",
                        "rut": "6041",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57392796948ac45cf477b",
                        "name": "LUCIANO",
                        "lastName": "VALENZUELA",
                        "age": 7,
                        "email": "LV11@vm.com",
                        "rut": "3632",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57393796948ac45cf4780",
                        "name": "BAUTISTA",
                        "lastName": "PINTO",
                        "age": 6,
                        "email": "BP12@vm.com",
                        "rut": "6870",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57393796948ac45cf4785",
                        "name": "NAHUEL",
                        "lastName": "GONZALEZ-CAPITEL",
                        "age": 6,
                        "email": "NG13@vm.com",
                        "rut": "3541",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57393796948ac45cf478a",
                        "name": "LUCIANO",
                        "lastName": "BUSTAMANTE",
                        "age": 6,
                        "email": "LB14@vm.com",
                        "rut": "8772",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d5739a796948ac45cf47f8",
                        "name": "GABRIEL",
                        "lastName": "SIFUENTES",
                        "age": 7,
                        "email": "GS36@vm.com",
                        "rut": "7223",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    }
                ],
                "planner": [
                    {
                        "_id": "68d804edad5e16bc7d3365f7",
                        "duration": 90,
                        "content": "Conduccion y reaccion",
                        "learningObjectives": "Conduccion y cambios de dirección con visión de juego",
                        "activities": "2 equipos y con balón bota los conos y otro los pone de pie",
                        "materials": [
                            {
                                "value": "Balón de futbol",
                                "id": "4",
                                "label": "Balón de futbol"
                            },
                            {
                                "value": "Conos",
                                "id": "1",
                                "label": "Conos"
                            }
                        ]
                    },
                    {
                        "_id": "68d8062cad5e16bc7d33678a",
                        "duration": 90,
                        "content": "Conduccion y reaccion ",
                        "learningObjectives": "Conducir balón a la vez realizar una acción para la visión de juego",
                        "activities": "2 equipos, equipo 1 con balón conduciendo bota los conos con la mano, equipo 2 los recoge y pone de pie. \n\nPartido de entrenamiento ",
                        "materials": [
                            "[{\"value\":\"Balón de futbol\",\"id\":\"4\",\"label\":\"Balón de futbol\"},{\"value\":\"Conos\",\"id\":\"1\",\"label\":\"Conos\"},{\"value\":\"Petos\",\"id\":\"37\",\"label\":\"Petos\"}]"
                        ]
                    },
                    {
                        "_id": "68e1219f94bba864d7257ab0",
                        "duration": 90,
                        "content": "Defensa y transición ",
                        "learningObjectives": "Defender de manera correcta entre arco y jugador. Adaptarse a las situaciones de cambio de posición ",
                        "activities": "Persecución y cambios de dirección \nSituación defensiva en inferioridad y superioridad numérica.",
                        "materials": [
                            "[{\"value\":\"Balón de futbol\",\"id\":\"4\",\"label\":\"Balón de futbol\"},{\"value\":\"Conos\",\"id\":\"1\",\"label\":\"Conos\"},{\"value\":\"Lentejas\",\"id\":\"2\",\"label\":\"Lentejas\"},{\"value\":\"Petos\",\"id\":\"37\",\"label\":\"Petos\"}]"
                        ]
                    },
                    {
                        "_id": "68ea52545dabe9306c3d2ca4",
                        "duration": 90,
                        "content": "Coordinación con balón, duelos, transición defensiva a ofensiva",
                        "learningObjectives": "Controlar balón en movimiento, reaccionar a una transición defensiva u ofensiva",
                        "activities": "Coordinación con balón por alumno \nTrabajo de duelos por equipo\nPartido de entrenamiento ",
                        "materials": [
                            "[{\"value\":\"Balón de futbol\",\"id\":\"4\",\"label\":\"Balón de futbol\"},{\"value\":\"Conos\",\"id\":\"1\",\"label\":\"Conos\"},{\"value\":\"Lentejas\",\"id\":\"2\",\"label\":\"Lentejas\"},{\"value\":\"Petos\",\"id\":\"37\",\"label\":\"Petos\"}]"
                        ]
                    },
                    {
                        "_id": "68f2f9dfc04a9f0c68159bf4",
                        "duration": 90,
                        "content": "Definición y golpe al balon",
                        "learningObjectives": "Patear balón en movimiento, realizar gesto técnico de manera correcta ",
                        "activities": "Patear balón en movimiento y de primera ",
                        "materials": [
                            {
                                "value": "Balón de futbol",
                                "id": "4",
                                "label": "Balón de futbol"
                            },
                            {
                                "value": "Conos",
                                "id": "1",
                                "label": "Conos"
                            },
                            {
                                "value": "Petos",
                                "id": "37",
                                "label": "Petos"
                            }
                        ]
                    },
                    {
                        "_id": "68fcd7d7f3961424170461ef",
                        "duration": 90,
                        "content": "Coordinación y secuencia técnica ",
                        "learningObjectives": "Dominar el control de balon ",
                        "activities": "Dominio de la posada al balón\nCircuito de coordinación \nPartido",
                        "materials": [
                            "[{\"value\":\"Balón de futbol\",\"id\":\"4\",\"label\":\"Balón de futbol\"},{\"value\":\"Conos\",\"id\":\"1\",\"label\":\"Conos\"},{\"value\":\"Lentejas\",\"id\":\"2\",\"label\":\"Lentejas\"},{\"value\":\"Petos\",\"id\":\"37\",\"label\":\"Petos\"}]"
                        ]
                    },
                    {
                        "_id": "69060d21f396142417080200",
                        "duration": 90,
                        "content": "Desmarca",
                        "learningObjectives": "Aprender a jugar sin balon",
                        "activities": "Desmarca sin balón \nDesmarca con balón y pases\nPartido aplicando lo aprendido",
                        "materials": [
                            "[{\"value\":\"Balón de futbol\",\"id\":\"4\",\"label\":\"Balón de futbol\"},{\"value\":\"Conos\",\"id\":\"1\",\"label\":\"Conos\"},{\"value\":\"Lentejas\",\"id\":\"2\",\"label\":\"Lentejas\"},{\"value\":\"Petos\",\"id\":\"37\",\"label\":\"Petos\"}]"
                        ]
                    },
                    {
                        "_id": "690f45f5f39614241712ae0e",
                        "duration": 90,
                        "content": "Desmarca y juego sin balon",
                        "learningObjectives": "Comprender el desmarque como recurso ",
                        "activities": "Calentamiento movimientos laterales\nEjercicio de desmarca con pase y defensa\nPartido de entrenamiento ",
                        "materials": [
                            "[{\"value\":\"Balón de futbol\",\"id\":\"4\",\"label\":\"Balón de futbol\"},{\"value\":\"Conos\",\"id\":\"1\",\"label\":\"Conos\"},{\"value\":\"Lentejas\",\"id\":\"2\",\"label\":\"Lentejas\"}]"
                        ]
                    }
                ],
                "address": "Talinay 9105, 7880755 La Reina, Región Metropolitana, Chile",
                "email": "dragonesdelareina@vitalmoveglobal.com",
                "phone": "956344351",
                "ageRange": [
                    "7",
                    "8"
                ],
                "days": [
                    "Sábado"
                ],
                "hours": {
                    "start": "09:00:00",
                    "end": "12:00:00"
                }
            },
            {
                "_id": "65baa45d06a665fe5d406024",
                "name": "Sub 9",
                "teacher": [
                    {
                        "_id": "64369a832e5e73d7c29462c5",
                        "name": "Eduardo",
                        "lastName": "Espinoza",
                        "email": "eduardo.espinoza13101@gmail.com",
                        "role": "SUPF",
                        "rut": "78255552K",
                        "logged": "true",
                        "age": 39,
                        "gender": "male",
                        "phone": "",
                        "size": 177,
                        "weight": 90
                    },
                    {
                        "_id": "68a1e8c5e797e956941ec26e",
                        "name": "Vidal",
                        "lastName": "Valdivia",
                        "email": "vivaldivia45@gmail.com",
                        "role": "SUPF",
                        "rut": "900000003k",
                        "logged": "true",
                        "phone": "81534348",
                        "gender": "",
                        "age": 0,
                        "weight": null,
                        "size": null
                    }
                ],
                "students": [
                    {
                        "_id": "68d57394796948ac45cf4794",
                        "name": "BENJAMIN",
                        "lastName": "CORDERO",
                        "age": 9,
                        "email": "BC16@vm.com",
                        "rut": "3944",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57394796948ac45cf4799",
                        "name": "BENJAMIN",
                        "lastName": "OLEA",
                        "age": 9,
                        "email": "BO17@vm.com",
                        "rut": "1668",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57394796948ac45cf479e",
                        "name": "CHRIS",
                        "lastName": "GARIN",
                        "age": 8,
                        "email": "CG18@vm.com",
                        "rut": "3000",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57395796948ac45cf47a3",
                        "name": "CRISTHOPER",
                        "lastName": "TAPIA",
                        "age": 8,
                        "email": "CT19@vm.com",
                        "rut": "9366",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57395796948ac45cf47a8",
                        "name": "FERNANDO",
                        "lastName": "SERRANO",
                        "age": 8,
                        "email": "FS20@vm.com",
                        "rut": "4924",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57395796948ac45cf47ad",
                        "name": "GASPAR",
                        "lastName": "MORALES",
                        "age": 9,
                        "email": "GM21@vm.com",
                        "rut": "7744",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57396796948ac45cf47b2",
                        "name": "GASPAR",
                        "lastName": "RODRIGUEZ",
                        "age": 9,
                        "email": "GR22@vm.com",
                        "rut": "2505",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57396796948ac45cf47b7",
                        "name": "GIAN",
                        "lastName": "PIERO NAJERA",
                        "age": 8,
                        "email": "GP23@vm.com",
                        "rut": "6184",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57396796948ac45cf47bc",
                        "name": "MARTIN",
                        "lastName": "LOPEZ",
                        "age": 8,
                        "email": "ML24@vm.com",
                        "rut": "8718",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57397796948ac45cf47c1",
                        "name": "CRISTOFER",
                        "lastName": "MAYA",
                        "age": 9,
                        "email": "CM25@vm.com",
                        "rut": "5076",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57397796948ac45cf47c6",
                        "name": "ISIDRO",
                        "lastName": "HERNANDEZ",
                        "age": 8,
                        "email": "IH26@vm.com",
                        "rut": "3576",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57397796948ac45cf47cb",
                        "name": "LUIS",
                        "lastName": "LOPEZ",
                        "age": 8,
                        "email": "LL27@vm.com",
                        "rut": "2552",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57397796948ac45cf47d0",
                        "name": "PABLO",
                        "lastName": "ORELLANA",
                        "age": 9,
                        "email": "PO28@vm.com",
                        "rut": "9289",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57398796948ac45cf47d5",
                        "name": "SANTINO",
                        "lastName": "GUTIERREZ",
                        "age": 8,
                        "email": "SG29@vm.com",
                        "rut": "6105",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57398796948ac45cf47da",
                        "name": "JUAN",
                        "lastName": "TINJACA",
                        "age": 8,
                        "email": "JT30@vm.com",
                        "rut": "1189",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57398796948ac45cf47df",
                        "name": "MATEO",
                        "lastName": "DEVESA",
                        "age": 8,
                        "email": "MD31@vm.com",
                        "rut": "9961",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57399796948ac45cf47e4",
                        "name": "MAXIMO",
                        "lastName": "ROBLEDO",
                        "age": 8,
                        "email": "MR32@vm.com",
                        "rut": "5420",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57399796948ac45cf47e9",
                        "name": "PABLO",
                        "lastName": "POMBO",
                        "age": 9,
                        "email": "PP33@vm.com",
                        "rut": "5006",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d57399796948ac45cf47ee",
                        "name": "CRISTOBAL",
                        "lastName": "SILVA",
                        "age": 9,
                        "email": "CS34@vm.com",
                        "rut": "9723",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d5739a796948ac45cf47f3",
                        "name": "CRISTOBAL",
                        "lastName": "PONCE",
                        "age": 8,
                        "email": "CP35@vm.com",
                        "rut": "2579",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d5739a796948ac45cf47fd",
                        "name": "JOSEPH",
                        "lastName": "MUÑOZ",
                        "age": 8,
                        "email": "JM37@vm.com",
                        "rut": "3246",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d5739b796948ac45cf4802",
                        "name": "AGUSTIN",
                        "lastName": "FERNANDEZ",
                        "age": 9,
                        "email": "AF38@vm.com",
                        "rut": "6612",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d5739c796948ac45cf481b",
                        "name": "DIEGO",
                        "lastName": "CABEZA",
                        "age": 9,
                        "email": "DC43@vm.com",
                        "rut": "2090",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d5739e796948ac45cf4834",
                        "name": "AUSTIN",
                        "lastName": "LEON GARCIA",
                        "age": 9,
                        "email": "AL48@vm.com",
                        "rut": "2689",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a0796948ac45cf4852",
                        "name": "MAXIMO",
                        "lastName": "PETERS",
                        "age": 9,
                        "email": "MP54@vm.com",
                        "rut": "5512",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a0796948ac45cf485c",
                        "name": "DONATO",
                        "lastName": "ABRUZZESE",
                        "age": 9,
                        "email": "DA56@vm.com",
                        "rut": "2135",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b7796948ac45cf49d3",
                        "name": "AIRA",
                        "lastName": "SANHUEZA",
                        "age": 9,
                        "email": "AS131@vm.com",
                        "rut": "9259",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b7796948ac45cf49d8",
                        "name": "MARTIN",
                        "lastName": "SANDOVAL",
                        "age": 8,
                        "email": "MS132@vm.com",
                        "rut": "6710",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b7796948ac45cf49dd",
                        "name": "NICOLAS",
                        "lastName": "LORCA",
                        "age": 9,
                        "email": "NL133@vm.com",
                        "rut": "7140",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    }
                ],
                "planner": [
                    {
                        "_id": "68d7edfdad5e16bc7d3362a5",
                        "duration": 90,
                        "content": "Intencion de pases, conducciones cortas y largas",
                        "learningObjectives": "Optimizar fundamentos técnicos individuales",
                        "activities": "Juegos calentamiento.\nEjecución de estaciones de pases ",
                        "materials": [
                            "[{\"value\":\"Balón de hándbol\",\"id\":\"5\",\"label\":\"Balón de hándbol\"},{\"value\":\"Conos\",\"id\":\"1\",\"label\":\"Conos\"},{\"value\":\"Lentejas\",\"id\":\"2\",\"label\":\"Lentejas\"}]"
                        ]
                    }
                ],
                "address": "Talinay 9105, 7880755 La Reina, Región Metropolitana, Chile",
                "email": "dragonesdelareina@vitalmoveglobal.com",
                "phone": "935479999",
                "ageRange": [
                    "9",
                    "10"
                ],
                "days": [
                    "Sábado"
                ],
                "hours": {
                    "start": "07:00:00",
                    "end": "09:00:00"
                }
            },
            {
                "_id": "65bd70c66811be13e74a8470",
                "name": "Sub 13",
                "teacher": [
                    {
                        "_id": "64369a832e5e73d7c29462c5",
                        "name": "Eduardo",
                        "lastName": "Espinoza",
                        "email": "eduardo.espinoza13101@gmail.com",
                        "role": "SUPF",
                        "rut": "78255552K",
                        "logged": "true",
                        "age": 39,
                        "gender": "male",
                        "phone": "",
                        "size": 177,
                        "weight": 90
                    },
                    {
                        "_id": "68d5cf59ad5e16bc7d332e4d",
                        "name": "Israel",
                        "lastName": "Ormeño",
                        "email": "israelormenolopez@gmail.com",
                        "role": "SUPF",
                        "rut": "900000000k",
                        "logged": "false",
                        "phone": "0",
                        "gender": "",
                        "age": 0,
                        "weight": null,
                        "size": null
                    }
                ],
                "students": [
                    {
                        "_id": "68d573a1796948ac45cf4870",
                        "name": "DIEGO",
                        "lastName": "MACAYA",
                        "age": 12,
                        "email": "DM60@vm.com",
                        "rut": "1602",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a2796948ac45cf4875",
                        "name": "EDUARDO",
                        "lastName": "ALARCON",
                        "age": 12,
                        "email": "EA61@vm.com",
                        "rut": "4874",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a2796948ac45cf487a",
                        "name": "FELIPE",
                        "lastName": "QUINTANA",
                        "age": 12,
                        "email": "FQ62@vm.com",
                        "rut": "5132",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a2796948ac45cf487f",
                        "name": "MATIAS",
                        "lastName": "BAEZA",
                        "age": 13,
                        "email": "M 63@vm.com",
                        "rut": "9860",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a3796948ac45cf4889",
                        "name": "LUCAS",
                        "lastName": "ROBLES",
                        "age": 13,
                        "email": "LR65@vm.com",
                        "rut": "2022",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a3796948ac45cf488e",
                        "name": "NAHUEL",
                        "lastName": "EPUL",
                        "age": 13,
                        "email": "NE66@vm.com",
                        "rut": "4685",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a4796948ac45cf4898",
                        "name": "STEFANO",
                        "lastName": "VASQUEZ",
                        "age": 13,
                        "email": "SV68@vm.com",
                        "rut": "8764",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a4796948ac45cf489d",
                        "name": "TOMAS",
                        "lastName": "ALONZO",
                        "age": 12,
                        "email": "TA69@vm.com",
                        "rut": "1803",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a4796948ac45cf48a2",
                        "name": "FELIPE",
                        "lastName": "SOTO",
                        "age": 13,
                        "email": "FS70@vm.com",
                        "rut": "5314",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a5796948ac45cf48a7",
                        "name": "AGUSTIN",
                        "lastName": "PONCE",
                        "age": 12,
                        "email": "AP71@vm.com",
                        "rut": "1781",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a5796948ac45cf48ac",
                        "name": "MATIAS",
                        "lastName": "SAN MARTIN",
                        "age": 13,
                        "email": "MS72@vm.com",
                        "rut": "6313",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a5796948ac45cf48b6",
                        "name": "CARLOS",
                        "lastName": "ABREGU",
                        "age": 12,
                        "email": "CA74@vm.com",
                        "rut": "6735",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a6796948ac45cf48c0",
                        "name": "CRISTOBAL",
                        "lastName": "PRADENAS",
                        "age": 12,
                        "email": "CP76@vm.com",
                        "rut": "4134",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a7796948ac45cf48cf",
                        "name": "ENRIQUE",
                        "lastName": "VALENCIA",
                        "age": 13,
                        "email": "EV79@vm.com",
                        "rut": "5827",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a7796948ac45cf48d4",
                        "name": "DIEGO",
                        "lastName": "LOPEZ",
                        "age": 13,
                        "email": "DL80@vm.com",
                        "rut": "4727",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573aa796948ac45cf48fc",
                        "name": "MARTIN",
                        "lastName": "VEGA",
                        "age": 13,
                        "email": "MV88@vm.com",
                        "rut": "5049",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b0796948ac45cf496a",
                        "name": "ANTONELLA",
                        "lastName": "LAGOS",
                        "age": 12,
                        "email": "AL110@vm.com",
                        "rut": "6145",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b1796948ac45cf496f",
                        "name": "FERNANDA",
                        "lastName": "CASTRO",
                        "age": 12,
                        "email": "F 111@vm.com",
                        "rut": "3570",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b1796948ac45cf4974",
                        "name": "JULIETA",
                        "lastName": "OYARCE",
                        "age": 13,
                        "email": "JO112@vm.com",
                        "rut": "2263",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b1796948ac45cf4979",
                        "name": "AMBAR",
                        "lastName": "REYES",
                        "age": 13,
                        "email": "AR113@vm.com",
                        "rut": "8493",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b2796948ac45cf4983",
                        "name": "ANTONELLA",
                        "lastName": "DIAZ TORRES",
                        "age": 13,
                        "email": "AD115@vm.com",
                        "rut": "1030",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b2796948ac45cf498d",
                        "name": "FERNANDA",
                        "lastName": "SAEZ",
                        "age": 13,
                        "email": "FS117@vm.com",
                        "rut": "2923",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a1796948ac45cf4870",
                        "name": "DIEGO",
                        "lastName": "MACAYA",
                        "age": 12,
                        "email": "DM60@vm.com",
                        "rut": "1602",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a2796948ac45cf4875",
                        "name": "EDUARDO",
                        "lastName": "ALARCON",
                        "age": 12,
                        "email": "EA61@vm.com",
                        "rut": "4874",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a2796948ac45cf487a",
                        "name": "FELIPE",
                        "lastName": "QUINTANA",
                        "age": 12,
                        "email": "FQ62@vm.com",
                        "rut": "5132",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a2796948ac45cf487f",
                        "name": "MATIAS",
                        "lastName": "BAEZA",
                        "age": 13,
                        "email": "M 63@vm.com",
                        "rut": "9860",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a3796948ac45cf4889",
                        "name": "LUCAS",
                        "lastName": "ROBLES",
                        "age": 13,
                        "email": "LR65@vm.com",
                        "rut": "2022",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a3796948ac45cf488e",
                        "name": "NAHUEL",
                        "lastName": "EPUL",
                        "age": 13,
                        "email": "NE66@vm.com",
                        "rut": "4685",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a4796948ac45cf4898",
                        "name": "STEFANO",
                        "lastName": "VASQUEZ",
                        "age": 13,
                        "email": "SV68@vm.com",
                        "rut": "8764",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a4796948ac45cf489d",
                        "name": "TOMAS",
                        "lastName": "ALONZO",
                        "age": 12,
                        "email": "TA69@vm.com",
                        "rut": "1803",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a4796948ac45cf48a2",
                        "name": "FELIPE",
                        "lastName": "SOTO",
                        "age": 13,
                        "email": "FS70@vm.com",
                        "rut": "5314",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a5796948ac45cf48a7",
                        "name": "AGUSTIN",
                        "lastName": "PONCE",
                        "age": 12,
                        "email": "AP71@vm.com",
                        "rut": "1781",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a5796948ac45cf48ac",
                        "name": "MATIAS",
                        "lastName": "SAN MARTIN",
                        "age": 13,
                        "email": "MS72@vm.com",
                        "rut": "6313",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a5796948ac45cf48b6",
                        "name": "CARLOS",
                        "lastName": "ABREGU",
                        "age": 12,
                        "email": "CA74@vm.com",
                        "rut": "6735",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a6796948ac45cf48c0",
                        "name": "CRISTOBAL",
                        "lastName": "PRADENAS",
                        "age": 12,
                        "email": "CP76@vm.com",
                        "rut": "4134",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a7796948ac45cf48cf",
                        "name": "ENRIQUE",
                        "lastName": "VALENCIA",
                        "age": 13,
                        "email": "EV79@vm.com",
                        "rut": "5827",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a7796948ac45cf48d4",
                        "name": "DIEGO",
                        "lastName": "LOPEZ",
                        "age": 13,
                        "email": "DL80@vm.com",
                        "rut": "4727",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573aa796948ac45cf48fc",
                        "name": "MARTIN",
                        "lastName": "VEGA",
                        "age": 13,
                        "email": "MV88@vm.com",
                        "rut": "5049",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b0796948ac45cf496a",
                        "name": "ANTONELLA",
                        "lastName": "LAGOS",
                        "age": 12,
                        "email": "AL110@vm.com",
                        "rut": "6145",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b1796948ac45cf496f",
                        "name": "FERNANDA",
                        "lastName": "CASTRO",
                        "age": 12,
                        "email": "F 111@vm.com",
                        "rut": "3570",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b1796948ac45cf4974",
                        "name": "JULIETA",
                        "lastName": "OYARCE",
                        "age": 13,
                        "email": "JO112@vm.com",
                        "rut": "2263",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b1796948ac45cf4979",
                        "name": "AMBAR",
                        "lastName": "REYES",
                        "age": 13,
                        "email": "AR113@vm.com",
                        "rut": "8493",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b2796948ac45cf4983",
                        "name": "ANTONELLA",
                        "lastName": "DIAZ TORRES",
                        "age": 13,
                        "email": "AD115@vm.com",
                        "rut": "1030",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b2796948ac45cf498d",
                        "name": "FERNANDA",
                        "lastName": "SAEZ",
                        "age": 13,
                        "email": "FS117@vm.com",
                        "rut": "2923",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a1796948ac45cf4870",
                        "name": "DIEGO",
                        "lastName": "MACAYA",
                        "age": 12,
                        "email": "DM60@vm.com",
                        "rut": "1602",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a2796948ac45cf4875",
                        "name": "EDUARDO",
                        "lastName": "ALARCON",
                        "age": 12,
                        "email": "EA61@vm.com",
                        "rut": "4874",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a2796948ac45cf487a",
                        "name": "FELIPE",
                        "lastName": "QUINTANA",
                        "age": 12,
                        "email": "FQ62@vm.com",
                        "rut": "5132",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a2796948ac45cf487f",
                        "name": "MATIAS",
                        "lastName": "BAEZA",
                        "age": 13,
                        "email": "M 63@vm.com",
                        "rut": "9860",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a3796948ac45cf4889",
                        "name": "LUCAS",
                        "lastName": "ROBLES",
                        "age": 13,
                        "email": "LR65@vm.com",
                        "rut": "2022",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a3796948ac45cf488e",
                        "name": "NAHUEL",
                        "lastName": "EPUL",
                        "age": 13,
                        "email": "NE66@vm.com",
                        "rut": "4685",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a4796948ac45cf4898",
                        "name": "STEFANO",
                        "lastName": "VASQUEZ",
                        "age": 13,
                        "email": "SV68@vm.com",
                        "rut": "8764",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a4796948ac45cf489d",
                        "name": "TOMAS",
                        "lastName": "ALONZO",
                        "age": 12,
                        "email": "TA69@vm.com",
                        "rut": "1803",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a4796948ac45cf48a2",
                        "name": "FELIPE",
                        "lastName": "SOTO",
                        "age": 13,
                        "email": "FS70@vm.com",
                        "rut": "5314",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a5796948ac45cf48a7",
                        "name": "AGUSTIN",
                        "lastName": "PONCE",
                        "age": 12,
                        "email": "AP71@vm.com",
                        "rut": "1781",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a5796948ac45cf48ac",
                        "name": "MATIAS",
                        "lastName": "SAN MARTIN",
                        "age": 13,
                        "email": "MS72@vm.com",
                        "rut": "6313",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a5796948ac45cf48b6",
                        "name": "CARLOS",
                        "lastName": "ABREGU",
                        "age": 12,
                        "email": "CA74@vm.com",
                        "rut": "6735",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a6796948ac45cf48c0",
                        "name": "CRISTOBAL",
                        "lastName": "PRADENAS",
                        "age": 12,
                        "email": "CP76@vm.com",
                        "rut": "4134",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a7796948ac45cf48cf",
                        "name": "ENRIQUE",
                        "lastName": "VALENCIA",
                        "age": 13,
                        "email": "EV79@vm.com",
                        "rut": "5827",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a7796948ac45cf48d4",
                        "name": "DIEGO",
                        "lastName": "LOPEZ",
                        "age": 13,
                        "email": "DL80@vm.com",
                        "rut": "4727",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573aa796948ac45cf48fc",
                        "name": "MARTIN",
                        "lastName": "VEGA",
                        "age": 13,
                        "email": "MV88@vm.com",
                        "rut": "5049",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    }
                ],
                "planner": [
                    {
                        "_id": "68d808b6ad5e16bc7d336ad4",
                        "duration": 90,
                        "content": "Pases dirigidos, control y entrega",
                        "learningObjectives": "Controlas con pie lejano y a dos toques",
                        "activities": "Circuito de entrega a dos toques y remplazo de posición \nPartido de entrenamiento ",
                        "materials": [
                            "[{\"value\":\"Balón de futbol\",\"id\":\"4\",\"label\":\"Balón de futbol\"},{\"value\":\"Conos\",\"id\":\"1\",\"label\":\"Conos\"},{\"value\":\"Petos\",\"id\":\"37\",\"label\":\"Petos\"}]"
                        ]
                    },
                    {
                        "_id": "68d80994ad5e16bc7d336c22",
                        "duration": 90,
                        "content": "Pase y control orientado",
                        "learningObjectives": "Controlar con pie lejano y entregar con dos toques",
                        "activities": "Circulación de balón ",
                        "materials": [
                            "[{\"value\":\"Balón de futbol\",\"id\":\"4\",\"label\":\"Balón de futbol\"}]"
                        ]
                    },
                    {
                        "_id": "68e1222394bba864d7257b64",
                        "duration": 90,
                        "content": "Defensa y transición ",
                        "learningObjectives": "Adaptarse a las situaciones de cambio de posesión de balón en defensa ",
                        "activities": "Persecusión\nSituaciones de inferioridad numérica en defensa",
                        "materials": [
                            "[{\"value\":\"Balón de futbol\",\"id\":\"4\",\"label\":\"Balón de futbol\"},{\"value\":\"Conos\",\"id\":\"1\",\"label\":\"Conos\"},{\"value\":\"Lentejas\",\"id\":\"2\",\"label\":\"Lentejas\"},{\"value\":\"Petos\",\"id\":\"37\",\"label\":\"Petos\"}]"
                        ]
                    },
                    {
                        "_id": "68ea53695dabe9306c3d2d7e",
                        "duration": 90,
                        "content": "Duelos y transición ",
                        "learningObjectives": "Duelos de reacción, trabajo en equipo para reaccionar a la transición defensiva u ofensiva ",
                        "activities": "Duelos de reacción\nTrabajo en equipo por duelos en transición defensiva u ofensiva con superioridad e inferioridad numérica ",
                        "materials": [
                            "[{\"value\":\"Balón de futbol\",\"id\":\"4\",\"label\":\"Balón de futbol\"},{\"value\":\"Conos\",\"id\":\"1\",\"label\":\"Conos\"},{\"value\":\"Lentejas\",\"id\":\"2\",\"label\":\"Lentejas\"},{\"value\":\"Petos\",\"id\":\"37\",\"label\":\"Petos\"}]"
                        ]
                    },
                    {
                        "_id": "68f2fa89c04a9f0c68159cbc",
                        "duration": 90,
                        "content": "Definición ",
                        "learningObjectives": "Definir en movimiento de primer toque ",
                        "activities": "Patear balón en movimiento con defensa en persecución ",
                        "materials": [
                            "[{\"value\":\"Balón de futbol\",\"id\":\"4\",\"label\":\"Balón de futbol\"},{\"value\":\"Conos\",\"id\":\"1\",\"label\":\"Conos\"},{\"value\":\"Estacas\",\"id\":\"44\",\"label\":\"Estacas\"},{\"value\":\"Petos\",\"id\":\"37\",\"label\":\"Petos\"}]"
                        ]
                    },
                    {
                        "_id": "68fcd83ff396142417046273",
                        "duration": 90,
                        "content": "Control de balon",
                        "learningObjectives": "Controlar pie lejano y a dos toques",
                        "activities": "Secuencia técnica individual \nCircuito con balón\nPartido",
                        "materials": [
                            "[{\"value\":\"Balón de futbol\",\"id\":\"4\",\"label\":\"Balón de futbol\"},{\"value\":\"Conos\",\"id\":\"1\",\"label\":\"Conos\"},{\"value\":\"Lentejas\",\"id\":\"2\",\"label\":\"Lentejas\"},{\"value\":\"Petos\",\"id\":\"37\",\"label\":\"Petos\"}]"
                        ]
                    },
                    {
                        "_id": "69060df9f39614241708028f",
                        "duration": 90,
                        "content": "Desmarca",
                        "learningObjectives": "Jugar sin balon ",
                        "activities": "Desmarca sin balón \nDesmarca con balón \nPartido aplicando lo aprendido ",
                        "materials": [
                            "[{\"value\":\"Balón de futbol\",\"id\":\"4\",\"label\":\"Balón de futbol\"},{\"value\":\"Conos\",\"id\":\"1\",\"label\":\"Conos\"},{\"value\":\"Lentejas\",\"id\":\"2\",\"label\":\"Lentejas\"},{\"value\":\"Petos\",\"id\":\"37\",\"label\":\"Petos\"}]"
                        ]
                    },
                    {
                        "_id": "690f46b0f39614241712b1c6",
                        "duration": 90,
                        "content": "Desmarca y posesión de balón ",
                        "learningObjectives": "Entender el desmarque como recurso ",
                        "activities": "Calentamiento con movimiento lateral \nEjercicio de desmarca con pase y defensa \nPartido de entrenamiento ",
                        "materials": [
                            "[{\"value\":\"Balón de futbol\",\"id\":\"4\",\"label\":\"Balón de futbol\"},{\"value\":\"Conos\",\"id\":\"1\",\"label\":\"Conos\"},{\"value\":\"Lentejas\",\"id\":\"2\",\"label\":\"Lentejas\"},{\"value\":\"Petos\",\"id\":\"37\",\"label\":\"Petos\"}]"
                        ]
                    }
                ],
                "address": "Talinay 9105, 7880755 La Reina, Región Metropolitana, Chile",
                "email": "dragonesdelareina@vitalmove.cl",
                "phone": "935716204",
                "ageRange": [
                    "12",
                    "13"
                ],
                "days": [
                    "Sábado"
                ],
                "hours": {
                    "start": "08:00:00",
                    "end": "09:30:00"
                }
            },
            {
                "_id": "681bc2df35151522632657e0",
                "name": "Sub 5",
                "teacher": [],
                "students": [
                    {
                        "_id": "68d5523ba00194ab261f079e",
                        "name": "Vicente",
                        "lastName": "Maya",
                        "age": 5,
                        "email": "vm1@vm.com",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d5738f796948ac45cf4753",
                        "name": "KYLIAM",
                        "lastName": "SALINAS",
                        "age": 5,
                        "email": "KS3@vm.com",
                        "rut": "8416",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    }
                ],
                "planner": [],
                "address": "Talinay 9105, 7880755 La Reina, Región Metropolitana, Chile",
                "email": "colocolodragonesdelareina@vitalmove.cl",
                "phone": "+56 935763252",
                "ageRange": [
                    "5",
                    "6"
                ],
                "days": [
                    "Sábado"
                ],
                "hours": {
                    "start": "07:00:00",
                    "end": "09:00:00"
                }
            },
            {
                "_id": "681bc5f13515152263265848",
                "name": "Sub 15",
                "teacher": [
                    {
                        "_id": "64369a832e5e73d7c29462c5",
                        "name": "Eduardo",
                        "lastName": "Espinoza",
                        "email": "eduardo.espinoza13101@gmail.com",
                        "role": "SUPF",
                        "rut": "78255552K",
                        "logged": "true",
                        "age": 39,
                        "gender": "male",
                        "phone": "",
                        "size": 177,
                        "weight": 90
                    },
                    {
                        "_id": "68a1e8c5e797e956941ec26e",
                        "name": "Vidal",
                        "lastName": "Valdivia",
                        "email": "vivaldivia45@gmail.com",
                        "role": "SUPF",
                        "rut": "900000003k",
                        "logged": "true",
                        "phone": "81534348",
                        "gender": "",
                        "age": 0,
                        "weight": null,
                        "size": null
                    }
                ],
                "students": [
                    {
                        "_id": "68d573a8796948ac45cf48d9",
                        "name": "CRISTOBAL",
                        "lastName": "MASFERRER",
                        "age": 15,
                        "email": "CM81@vm.com",
                        "rut": "4270",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a8796948ac45cf48de",
                        "name": "GONZALO",
                        "lastName": "OLAVE",
                        "age": 14,
                        "email": "GO82@vm.com",
                        "rut": "4486",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a8796948ac45cf48e3",
                        "name": "DANIEL",
                        "lastName": "TINJACA",
                        "age": 14,
                        "email": "DT83@vm.com",
                        "rut": "4278",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a8796948ac45cf48e8",
                        "name": "VICENTE",
                        "lastName": "SOTO",
                        "age": 15,
                        "email": "VS84@vm.com",
                        "rut": "1227",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a9796948ac45cf48ed",
                        "name": "ALONSO",
                        "lastName": "OLIVARES",
                        "age": 14,
                        "email": "AO85@vm.com",
                        "rut": "7165",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a9796948ac45cf48f2",
                        "name": "EDGAR",
                        "lastName": "VALLETE",
                        "age": 15,
                        "email": "EV86@vm.com",
                        "rut": "9074",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573a9796948ac45cf48f7",
                        "name": "MATIAS",
                        "lastName": "LOPEZ",
                        "age": 14,
                        "email": "ML87@vm.com",
                        "rut": "9399",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573aa796948ac45cf4901",
                        "name": "ALFONSO",
                        "lastName": "BARRIA",
                        "age": 15,
                        "email": "AB89@vm.com",
                        "rut": "7480",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573ab796948ac45cf4910",
                        "name": "ALVARO",
                        "lastName": "OLAVE",
                        "age": 15,
                        "email": "AO92@vm.com",
                        "rut": "5871",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573ae796948ac45cf4942",
                        "name": "SEBASTIAN",
                        "lastName": "MAGUIÑO",
                        "age": 14,
                        "email": "SM102@vm.com",
                        "rut": "1395",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b6796948ac45cf49c4",
                        "name": "MARCO",
                        "lastName": "ARTEAGA",
                        "age": 14,
                        "email": "MA128@vm.com",
                        "rut": "4040",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    }
                ],
                "planner": [
                    {
                        "_id": "68f2f5eec04a9f0c681598b2",
                        "duration": 90,
                        "content": "Principio de juego vista periférica ",
                        "learningObjectives": "Optimizar visión de juego y pases con ventaja al gol",
                        "activities": "Juegos activación musculares \nControl y conducción de balón en circuito sin oposición \nTransiciones medio ofensivas 3x3 2x3\nRealidad de juego 2 tiempos de 20 minutos.",
                        "materials": [
                            "[{\"value\":\"Lentejas\",\"id\":\"2\",\"label\":\"Lentejas\"},{\"value\":\"Balón de baloncesto\",\"id\":\"6\",\"label\":\"Balón de baloncesto\"},{\"value\":\"Arcos\",\"id\":\"18\",\"label\":\"Arcos\"},{\"value\":\"Conos\",\"id\":\"1\",\"label\":\"Conos\"},{\"value\":\"Petos\",\"id\":\"37\",\"label\":\"Petos\"}]"
                        ]
                    },
                    {
                        "_id": "68f2f83ec04a9f0c68159ae7",
                        "duration": 90,
                        "content": "Fundamento tácticos para jugar ancho de la cancha ",
                        "learningObjectives": "Trabajar aspectos defensivos y ofensivos utilizando todo el ancho de la cancha.",
                        "activities": "Juegos de calentamiento.\nEjercicios de salida defensiva sin oposición para laterales\nFinalización de jugadas con centro desde los costados\nRealidad de juego 2 tiempos de 20 minutos \n",
                        "materials": [
                            "[{\"value\":\"Arcos\",\"id\":\"18\",\"label\":\"Arcos\"},{\"value\":\"Conos\",\"id\":\"1\",\"label\":\"Conos\"},{\"value\":\"Lentejas\",\"id\":\"2\",\"label\":\"Lentejas\"},{\"value\":\"Pelota de hockey\",\"id\":\"9\",\"label\":\"Pelota de hockey\"},{\"value\":\"Petos\",\"id\":\"37\",\"label\":\"Petos\"}]"
                        ]
                    }
                ],
                "address": "Talinay 9105, 7880755 La Reina, Región Metropolitana, Chile",
                "email": "colocolodragonesdelareina@vitalmove.cl",
                "phone": "+56 935763252",
                "ageRange": [
                    "15",
                    "16"
                ],
                "days": [
                    "Sábado"
                ],
                "hours": {
                    "start": "10:00:00",
                    "end": "12:00:00"
                }
            },
            {
                "_id": "681bc6323515152263265855",
                "name": "Sub 17",
                "teacher": [
                    {
                        "_id": "64369a832e5e73d7c29462c5",
                        "name": "Eduardo",
                        "lastName": "Espinoza",
                        "email": "eduardo.espinoza13101@gmail.com",
                        "role": "SUPF",
                        "rut": "78255552K",
                        "logged": "true",
                        "age": 39,
                        "gender": "male",
                        "phone": "",
                        "size": 177,
                        "weight": 90
                    },
                    {
                        "_id": "689b9e29f59df80031a42742",
                        "name": "Eduardo",
                        "lastName": "Alvarez",
                        "email": "eduardo.alvarez.monroy@gmail.com",
                        "role": "SUPF",
                        "rut": "185481582",
                        "logged": "false",
                        "phone": "988082234",
                        "gender": "male",
                        "age": 28,
                        "weight": null,
                        "size": null
                    }
                ],
                "students": [
                    {
                        "_id": "68d573aa796948ac45cf4906",
                        "name": "MARCELO",
                        "lastName": "CASTRO",
                        "age": 17,
                        "email": "MC90@vm.com",
                        "rut": "8838",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573ab796948ac45cf490b",
                        "name": "ANGEL",
                        "lastName": "NAJERA",
                        "age": 17,
                        "email": "AN91@vm.com",
                        "rut": "2341",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573ab796948ac45cf4915",
                        "name": "IGNACIO",
                        "lastName": "BRAVO",
                        "age": 16,
                        "email": "IB93@vm.com",
                        "rut": "3511",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573ab796948ac45cf491a",
                        "name": "JOSUE",
                        "lastName": "LANDAETA",
                        "age": 16,
                        "email": "JL94@vm.com",
                        "rut": "1762",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573ac796948ac45cf491f",
                        "name": "BENJAMIN",
                        "lastName": "GELL",
                        "age": 17,
                        "email": "BG95@vm.com",
                        "rut": "4694",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573ac796948ac45cf4924",
                        "name": "SANTIAGO",
                        "lastName": "LEIVA",
                        "age": 16,
                        "email": "SL96@vm.com",
                        "rut": "3661",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573ac796948ac45cf4929",
                        "name": "MATHIAS",
                        "lastName": "ORIHUELA",
                        "age": 16,
                        "email": "MO97@vm.com",
                        "rut": "5238",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573ad796948ac45cf492e",
                        "name": "PABLO",
                        "lastName": "VIGORENA",
                        "age": 17,
                        "email": "PV98@vm.com",
                        "rut": "1903",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573ad796948ac45cf4933",
                        "name": "TOMAS",
                        "lastName": "ALMONACID",
                        "age": 17,
                        "email": "TA99@vm.com",
                        "rut": "7720",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573ad796948ac45cf4938",
                        "name": "CAMILO",
                        "lastName": "DIEZ",
                        "age": 16,
                        "email": "CD100@vm.com",
                        "rut": "5444",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b6796948ac45cf49c9",
                        "name": "MATIAS",
                        "lastName": "VEAS",
                        "age": 18,
                        "email": "MV129@vm.com",
                        "rut": "1967",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b6796948ac45cf49ce",
                        "name": "JUSTIN",
                        "lastName": "SAEZ",
                        "age": 17,
                        "email": "JS130@vm.com",
                        "rut": "5199",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    }
                ],
                "planner": [
                    {
                        "_id": "68d80752ad5e16bc7d3369b9",
                        "duration": 90,
                        "content": "Pases y tiro",
                        "learningObjectives": "Mejorar el pase y tiro",
                        "activities": "Enlace de pases con finalización ",
                        "materials": [
                            "[{\"value\":\"Balón de futbol\",\"id\":\"4\",\"label\":\"Balón de futbol\"}]"
                        ]
                    },
                    {
                        "_id": "68e07d8494bba864d7257815",
                        "duration": 90,
                        "content": "Pases y pasos de la marcación ",
                        "learningObjectives": "Perfeccionar el fundamento técnico del pase y mejorar los pasos de la marcación al rival ",
                        "activities": "Enlaces de pases sin y con oposición \nJuegos de posesión ",
                        "materials": [
                            {
                                "value": "Balón de futbol",
                                "id": "4",
                                "label": "Balón de futbol"
                            }
                        ]
                    },
                    {
                        "_id": "68ea471e5dabe9306c3d2bd1",
                        "duration": 90,
                        "content": "Presión post pérdida \nTransición defensiva ",
                        "learningObjectives": "Mejorar la transición defensiva con la presión post pérdida del balón ",
                        "activities": "Enlaces de pases donde generen una presión pasiva \nRondos para ir presionando ",
                        "materials": [
                            "[{\"value\":\"Balón de futbol\",\"id\":\"4\",\"label\":\"Balón de futbol\"}]"
                        ]
                    },
                    {
                        "_id": "68fc14c6f396142417043629",
                        "duration": 90,
                        "content": "Conducción ",
                        "learningObjectives": "Generar la conducción con vista levantada y elementos de la conducción ",
                        "activities": "Conducción frente a frente y competencia",
                        "materials": [
                            "[{\"value\":\"Balón de futbol\",\"id\":\"4\",\"label\":\"Balón de futbol\"}]"
                        ]
                    }
                ],
                "address": "Talinay 9105, 7880755 La Reina, Región Metropolitana, Chile",
                "email": "colocolodragonesdelareina@vitalmove.cl",
                "phone": "+56 935763252",
                "ageRange": [
                    "17",
                    "18"
                ],
                "days": [
                    "Sábado"
                ],
                "hours": {
                    "start": "09:00:00",
                    "end": "12:00:00"
                }
            },
            {
                "_id": "68d5d1f7ad5e16bc7d332e95",
                "name": "Femenino",
                "teacher": [
                    {
                        "_id": "68a1e8ffe797e956941ec27b",
                        "name": "Hernan",
                        "lastName": "Velazquez",
                        "email": "HAVR2002@HOTMAIL.COM",
                        "role": "SUPF",
                        "rut": "185481584",
                        "logged": "false",
                        "phone": "81534341",
                        "gender": "",
                        "age": 0,
                        "weight": null,
                        "size": null
                    },
                    {
                        "_id": "64369a832e5e73d7c29462c5",
                        "name": "Eduardo",
                        "lastName": "Espinoza",
                        "email": "eduardo.espinoza13101@gmail.com",
                        "role": "SUPF",
                        "rut": "78255552K",
                        "logged": "true",
                        "age": 39,
                        "gender": "male",
                        "phone": "",
                        "size": 177,
                        "weight": 90
                    }
                ],
                "students": [
                    {
                        "_id": "68d573ae796948ac45cf494c",
                        "name": "ANTONELLA",
                        "lastName": "INFANTE",
                        "age": 9,
                        "email": "AI104@vm.com",
                        "rut": "5573",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573af796948ac45cf4951",
                        "name": "ANTONELLA",
                        "lastName": "MUÑOZ",
                        "age": 8,
                        "email": "AM105@vm.com",
                        "rut": "2659",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573af796948ac45cf4956",
                        "name": "MIA",
                        "lastName": "CASTRO",
                        "age": 9,
                        "email": "MC106@vm.com",
                        "rut": "3239",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573af796948ac45cf495b",
                        "name": "DAPHNE",
                        "lastName": "CANTO",
                        "age": 10,
                        "email": "DC107@vm.com",
                        "rut": "9472",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b0796948ac45cf4960",
                        "name": "MARTINA",
                        "lastName": "GUERRERO",
                        "age": 10,
                        "email": "MG108@vm.com",
                        "rut": "2982",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b0796948ac45cf4965",
                        "name": "IGNACIA",
                        "lastName": "FILGUEIRA",
                        "age": 11,
                        "email": "IF109@vm.com",
                        "rut": "7416",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b0796948ac45cf496a",
                        "name": "ANTONELLA",
                        "lastName": "LAGOS",
                        "age": 12,
                        "email": "AL110@vm.com",
                        "rut": "6145",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b1796948ac45cf496f",
                        "name": "FERNANDA",
                        "lastName": "CASTRO",
                        "age": 12,
                        "email": "F 111@vm.com",
                        "rut": "3570",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b1796948ac45cf4974",
                        "name": "JULIETA",
                        "lastName": "OYARCE",
                        "age": 13,
                        "email": "JO112@vm.com",
                        "rut": "2263",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b1796948ac45cf4979",
                        "name": "AMBAR",
                        "lastName": "REYES",
                        "age": 13,
                        "email": "AR113@vm.com",
                        "rut": "8493",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b1796948ac45cf497e",
                        "name": "EMILIA",
                        "lastName": "FLORES",
                        "age": 15,
                        "email": "EF114@vm.com",
                        "rut": "5458",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b2796948ac45cf4983",
                        "name": "ANTONELLA",
                        "lastName": "DIAZ TORRES",
                        "age": 13,
                        "email": "AD115@vm.com",
                        "rut": "1030",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b2796948ac45cf4988",
                        "name": "JOSEFA",
                        "lastName": "PALMA",
                        "age": 10,
                        "email": "JP116@vm.com",
                        "rut": "7808",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b2796948ac45cf498d",
                        "name": "FERNANDA",
                        "lastName": "SAEZ",
                        "age": 13,
                        "email": "FS117@vm.com",
                        "rut": "2923",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b3796948ac45cf4992",
                        "name": "JULIANA",
                        "lastName": "MORA",
                        "age": 0,
                        "email": "JM118@vm.com",
                        "rut": "5560",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b3796948ac45cf4997",
                        "name": "JOSEFA",
                        "lastName": "PASTEN",
                        "age": 11,
                        "email": "JP119@vm.com",
                        "rut": "6734",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b3796948ac45cf499c",
                        "name": "CONSTANZA",
                        "lastName": "VELOZO",
                        "age": 14,
                        "email": "CV120@vm.com",
                        "rut": "7834",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b4796948ac45cf49a1",
                        "name": "FABIANA",
                        "lastName": "AHUMADA",
                        "age": 17,
                        "email": "FA121@vm.com",
                        "rut": "2314",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    },
                    {
                        "_id": "68d573b4796948ac45cf49a6",
                        "name": "MAGDALENA",
                        "lastName": "MORALES",
                        "age": 10,
                        "email": "MM122@vm.com",
                        "rut": "4949",
                        "role": "ESTU",
                        "logged": "false",
                        "skills": []
                    }
                ],
                "planner": [],
                "address": "Talinay, La Reina. Region Metropolitana",
                "email": "mail@mail.com",
                "phone": "0",
                "ageRange": [
                    "0",
                    "18"
                ],
                "days": [
                    "Sábado"
                ],
                "hours": {
                    "start": "10:00:00 AM",
                    "end": "12:00:00 PM"
                }
            }
        ],
        "students": [
            {
                "_id": "68d573a5796948ac45cf48b6",
                "name": "CARLOS",
                "lastName": "ABREGU",
                "age": 12,
                "classroom": [],
                "school": [],
                "email": "CA74@vm.com",
                "rut": "6735",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    }
                ]
            },
            {
                "_id": "68d573a0796948ac45cf485c",
                "name": "DONATO",
                "lastName": "ABRUZZESE",
                "age": 9,
                "classroom": [],
                "school": [],
                "email": "DA56@vm.com",
                "rut": "2135",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d573b4796948ac45cf49a1",
                "name": "FABIANA",
                "lastName": "AHUMADA",
                "age": 17,
                "classroom": [],
                "school": [],
                "email": "FA121@vm.com",
                "rut": "2314",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "68d5d1f7ad5e16bc7d332e95",
                        "name": "Femenino"
                    }
                ]
            },
            {
                "_id": "68d573a2796948ac45cf4875",
                "name": "EDUARDO",
                "lastName": "ALARCON",
                "age": 12,
                "classroom": [],
                "school": [],
                "email": "EA61@vm.com",
                "rut": "4874",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    }
                ]
            },
            {
                "_id": "68d573a5796948ac45cf48b1",
                "name": "DEMIAN",
                "lastName": "ALFARO",
                "age": 11,
                "classroom": [],
                "school": [],
                "email": "DA73@vm.com",
                "rut": "9344",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "656f70dc77158b0bea26c333",
                        "name": "Sub 11"
                    }
                ]
            },
            {
                "_id": "68d573ad796948ac45cf4933",
                "name": "TOMAS",
                "lastName": "ALMONACID",
                "age": 17,
                "classroom": [],
                "school": [],
                "email": "TA99@vm.com",
                "rut": "7720",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc6323515152263265855",
                        "name": "Sub 17"
                    }
                ]
            },
            {
                "_id": "68d573a4796948ac45cf489d",
                "name": "TOMAS",
                "lastName": "ALONZO",
                "age": 12,
                "classroom": [],
                "school": [],
                "email": "TA69@vm.com",
                "rut": "1803",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    }
                ]
            },
            {
                "_id": "68d57391796948ac45cf4767",
                "name": "SEBASTIAN",
                "lastName": "ALTAMIRANO",
                "age": 7,
                "classroom": [],
                "school": [],
                "email": "SA7@vm.com",
                "rut": "6395",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65b90df4cda2702220b00874",
                        "name": "Sub 7"
                    }
                ]
            },
            {
                "_id": "68d57393796948ac45cf478f",
                "name": "AGUSTIN",
                "lastName": "ARAYA",
                "age": 0,
                "classroom": [],
                "school": [],
                "email": "AA15@vm.com",
                "rut": "1652",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc2df35151522632657e0",
                        "name": "Sub 5"
                    }
                ]
            },
            {
                "_id": "68d573b6796948ac45cf49c4",
                "name": "MARCO",
                "lastName": "ARTEAGA",
                "age": 14,
                "classroom": [],
                "school": [],
                "email": "MA128@vm.com",
                "rut": "4040",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc5f13515152263265848",
                        "name": "Sub 15"
                    }
                ]
            },
            {
                "_id": "68d5739e796948ac45cf4839",
                "name": "TOMAS",
                "lastName": "AYALA",
                "age": 10,
                "classroom": [],
                "school": [],
                "email": "TA49@vm.com",
                "rut": "2880",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "656f70dc77158b0bea26c333",
                        "name": "Sub 11"
                    }
                ]
            },
            {
                "_id": "68d573a2796948ac45cf487f",
                "name": "MATIAS",
                "lastName": "BAEZA",
                "age": 13,
                "classroom": [],
                "school": [],
                "email": "M 63@vm.com",
                "rut": "9860",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    }
                ]
            },
            {
                "_id": "68d573aa796948ac45cf4901",
                "name": "ALFONSO",
                "lastName": "BARRIA",
                "age": 15,
                "classroom": [],
                "school": [],
                "email": "AB89@vm.com",
                "rut": "7480",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc5f13515152263265848",
                        "name": "Sub 15"
                    }
                ]
            },
            {
                "_id": "68d573ab796948ac45cf4915",
                "name": "IGNACIO",
                "lastName": "BRAVO",
                "age": 16,
                "classroom": [],
                "school": [],
                "email": "IB93@vm.com",
                "rut": "3511",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc6323515152263265855",
                        "name": "Sub 17"
                    }
                ]
            },
            {
                "_id": "68d5739d796948ac45cf482a",
                "name": "SANTIAGO",
                "lastName": "BRAVO",
                "age": 11,
                "classroom": [],
                "school": [],
                "email": "SB46@vm.com",
                "rut": "6374",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "656f70dc77158b0bea26c333",
                        "name": "Sub 11"
                    }
                ]
            },
            {
                "_id": "68d57393796948ac45cf478a",
                "name": "LUCIANO",
                "lastName": "BUSTAMANTE",
                "age": 6,
                "classroom": [],
                "school": [],
                "email": "LB14@vm.com",
                "rut": "8772",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65b90df4cda2702220b00874",
                        "name": "Sub 7"
                    }
                ]
            },
            {
                "_id": "68d5739c796948ac45cf481b",
                "name": "DIEGO",
                "lastName": "CABEZA",
                "age": 9,
                "classroom": [],
                "school": [],
                "email": "DC43@vm.com",
                "rut": "2090",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d5738f796948ac45cf474e",
                "name": "JONATHAN",
                "lastName": "CAMPOS",
                "age": 6,
                "classroom": [],
                "school": [],
                "email": "JC2@vm.com",
                "rut": "3337",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65b90df4cda2702220b00874",
                        "name": "Sub 7"
                    }
                ]
            },
            {
                "_id": "68d573af796948ac45cf495b",
                "name": "DAPHNE",
                "lastName": "CANTO",
                "age": 10,
                "classroom": [],
                "school": [],
                "email": "DC107@vm.com",
                "rut": "9472",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "68d5d1f7ad5e16bc7d332e95",
                        "name": "Femenino"
                    }
                ]
            },
            {
                "_id": "68d573b1796948ac45cf496f",
                "name": "FERNANDA",
                "lastName": "CASTRO",
                "age": 12,
                "classroom": [],
                "school": [],
                "email": "F 111@vm.com",
                "rut": "3570",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "68d5d1f7ad5e16bc7d332e95",
                        "name": "Femenino"
                    }
                ]
            },
            {
                "_id": "68d573af796948ac45cf4956",
                "name": "MIA",
                "lastName": "CASTRO",
                "age": 9,
                "classroom": [],
                "school": [],
                "email": "MC106@vm.com",
                "rut": "3239",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "68d5d1f7ad5e16bc7d332e95",
                        "name": "Femenino"
                    }
                ]
            },
            {
                "_id": "68d573aa796948ac45cf4906",
                "name": "MARCELO",
                "lastName": "CASTRO",
                "age": 17,
                "classroom": [],
                "school": [],
                "email": "MC90@vm.com",
                "rut": "8838",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc6323515152263265855",
                        "name": "Sub 17"
                    }
                ]
            },
            {
                "_id": "68d5739c796948ac45cf4816",
                "name": "LIAM",
                "lastName": "CHERO",
                "age": 10,
                "classroom": [],
                "school": [],
                "email": "LC42@vm.com",
                "rut": "7179",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "656f70dc77158b0bea26c333",
                        "name": "Sub 11"
                    }
                ]
            },
            {
                "_id": "68d573a3796948ac45cf4893",
                "name": "NICOLAS",
                "lastName": "CONTRERAS",
                "age": 11,
                "classroom": [],
                "school": [],
                "email": "NC67@vm.com",
                "rut": "9545",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "656f70dc77158b0bea26c333",
                        "name": "Sub 11"
                    }
                ]
            },
            {
                "_id": "68d57394796948ac45cf4794",
                "name": "BENJAMIN",
                "lastName": "CORDERO",
                "age": 9,
                "classroom": [],
                "school": [],
                "email": "BC16@vm.com",
                "rut": "3944",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d573a6796948ac45cf48bb",
                "name": "ANTONY",
                "lastName": "DAZA",
                "age": 0,
                "classroom": [],
                "school": [],
                "email": "AD75@vm.com",
                "rut": "4706",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc2df35151522632657e0",
                        "name": "Sub 5"
                    }
                ]
            },
            {
                "_id": "68d57398796948ac45cf47df",
                "name": "MATEO",
                "lastName": "DEVESA",
                "age": 8,
                "classroom": [],
                "school": [],
                "email": "MD31@vm.com",
                "rut": "9961",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d573a1796948ac45cf486b",
                "name": "JORGE",
                "lastName": "DIAZ",
                "age": 0,
                "classroom": [],
                "school": [],
                "email": "JD59@vm.com",
                "rut": "5989",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc2df35151522632657e0",
                        "name": "Sub 5"
                    }
                ]
            },
            {
                "_id": "68d573b2796948ac45cf4983",
                "name": "ANTONELLA",
                "lastName": "DIAZ TORRES",
                "age": 13,
                "classroom": [],
                "school": [],
                "email": "AD115@vm.com",
                "rut": "1030",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "68d5d1f7ad5e16bc7d332e95",
                        "name": "Femenino"
                    }
                ]
            },
            {
                "_id": "68d573ad796948ac45cf4938",
                "name": "CAMILO",
                "lastName": "DIEZ",
                "age": 16,
                "classroom": [],
                "school": [],
                "email": "CD100@vm.com",
                "rut": "5444",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc6323515152263265855",
                        "name": "Sub 17"
                    }
                ]
            },
            {
                "_id": "68d573a3796948ac45cf488e",
                "name": "NAHUEL",
                "lastName": "EPUL",
                "age": 13,
                "classroom": [],
                "school": [],
                "email": "NE66@vm.com",
                "rut": "4685",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    }
                ]
            },
            {
                "_id": "68d57391796948ac45cf4771",
                "name": "LUKAS",
                "lastName": "ESPINOZA",
                "age": 6,
                "classroom": [],
                "school": [],
                "email": "LE9@vm.com",
                "rut": "8996",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65b90df4cda2702220b00874",
                        "name": "Sub 7"
                    }
                ]
            },
            {
                "_id": "68d5739b796948ac45cf4802",
                "name": "AGUSTIN",
                "lastName": "FERNANDEZ",
                "age": 9,
                "classroom": [],
                "school": [],
                "email": "AF38@vm.com",
                "rut": "6612",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d573b0796948ac45cf4965",
                "name": "IGNACIA",
                "lastName": "FILGUEIRA",
                "age": 11,
                "classroom": [],
                "school": [],
                "email": "IF109@vm.com",
                "rut": "7416",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "68d5d1f7ad5e16bc7d332e95",
                        "name": "Femenino"
                    }
                ]
            },
            {
                "_id": "68d573b1796948ac45cf497e",
                "name": "EMILIA",
                "lastName": "FLORES",
                "age": 15,
                "classroom": [],
                "school": [],
                "email": "EF114@vm.com",
                "rut": "5458",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "68d5d1f7ad5e16bc7d332e95",
                        "name": "Femenino"
                    }
                ]
            },
            {
                "_id": "68d57394796948ac45cf479e",
                "name": "CHRIS",
                "lastName": "GARIN",
                "age": 8,
                "classroom": [],
                "school": [],
                "email": "CG18@vm.com",
                "rut": "3000",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d573ac796948ac45cf491f",
                "name": "BENJAMIN",
                "lastName": "GELL",
                "age": 17,
                "classroom": [],
                "school": [],
                "email": "BG95@vm.com",
                "rut": "4694",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc6323515152263265855",
                        "name": "Sub 17"
                    }
                ]
            },
            {
                "_id": "68d5739c796948ac45cf4820",
                "name": "MAXIMILIANO",
                "lastName": "GONZALEZ",
                "age": 11,
                "classroom": [],
                "school": [],
                "email": "MG44@vm.com",
                "rut": "4716",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "656f70dc77158b0bea26c333",
                        "name": "Sub 11"
                    }
                ]
            },
            {
                "_id": "68d5739d796948ac45cf482f",
                "name": "CLEMENTE",
                "lastName": "GONZALEZ",
                "age": 11,
                "classroom": [],
                "school": [],
                "email": "CG47@vm.com",
                "rut": "5575",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "656f70dc77158b0bea26c333",
                        "name": "Sub 11"
                    }
                ]
            },
            {
                "_id": "68d57393796948ac45cf4785",
                "name": "NAHUEL",
                "lastName": "GONZALEZ-CAPITEL",
                "age": 6,
                "classroom": [],
                "school": [],
                "email": "NG13@vm.com",
                "rut": "3541",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65b90df4cda2702220b00874",
                        "name": "Sub 7"
                    }
                ]
            },
            {
                "_id": "68d573b0796948ac45cf4960",
                "name": "MARTINA",
                "lastName": "GUERRERO",
                "age": 10,
                "classroom": [],
                "school": [],
                "email": "MG108@vm.com",
                "rut": "2982",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "68d5d1f7ad5e16bc7d332e95",
                        "name": "Femenino"
                    }
                ]
            },
            {
                "_id": "68d57398796948ac45cf47d5",
                "name": "SANTINO",
                "lastName": "GUTIERREZ",
                "age": 8,
                "classroom": [],
                "school": [],
                "email": "SG29@vm.com",
                "rut": "6105",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d57397796948ac45cf47c6",
                "name": "ISIDRO",
                "lastName": "HERNANDEZ",
                "age": 8,
                "classroom": [],
                "school": [],
                "email": "IH26@vm.com",
                "rut": "3576",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d573ae796948ac45cf494c",
                "name": "ANTONELLA",
                "lastName": "INFANTE",
                "age": 9,
                "classroom": [],
                "school": [],
                "email": "AI104@vm.com",
                "rut": "5573",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "68d5d1f7ad5e16bc7d332e95",
                        "name": "Femenino"
                    }
                ]
            },
            {
                "_id": "68d57392796948ac45cf4776",
                "name": "LUCAS",
                "lastName": "LACOSTE",
                "age": 7,
                "classroom": [],
                "school": [],
                "email": "LL10@vm.com",
                "rut": "6041",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65b90df4cda2702220b00874",
                        "name": "Sub 7"
                    }
                ]
            },
            {
                "_id": "68d573b0796948ac45cf496a",
                "name": "ANTONELLA",
                "lastName": "LAGOS",
                "age": 12,
                "classroom": [],
                "school": [],
                "email": "AL110@vm.com",
                "rut": "6145",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "68d5d1f7ad5e16bc7d332e95",
                        "name": "Femenino"
                    }
                ]
            },
            {
                "_id": "68d573ab796948ac45cf491a",
                "name": "JOSUE",
                "lastName": "LANDAETA",
                "age": 16,
                "classroom": [],
                "school": [],
                "email": "JL94@vm.com",
                "rut": "1762",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc6323515152263265855",
                        "name": "Sub 17"
                    }
                ]
            },
            {
                "_id": "68d573ac796948ac45cf4924",
                "name": "SANTIAGO",
                "lastName": "LEIVA",
                "age": 16,
                "classroom": [],
                "school": [],
                "email": "SL96@vm.com",
                "rut": "3661",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc6323515152263265855",
                        "name": "Sub 17"
                    }
                ]
            },
            {
                "_id": "68d5739e796948ac45cf4834",
                "name": "AUSTIN",
                "lastName": "LEON GARCIA",
                "age": 9,
                "classroom": [],
                "school": [],
                "email": "AL48@vm.com",
                "rut": "2689",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d573a7796948ac45cf48d4",
                "name": "DIEGO",
                "lastName": "LOPEZ",
                "age": 13,
                "classroom": [],
                "school": [],
                "email": "DL80@vm.com",
                "rut": "4727",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    }
                ]
            },
            {
                "_id": "68d57396796948ac45cf47bc",
                "name": "MARTIN",
                "lastName": "LOPEZ",
                "age": 8,
                "classroom": [],
                "school": [],
                "email": "ML24@vm.com",
                "rut": "8718",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d57397796948ac45cf47cb",
                "name": "LUIS",
                "lastName": "LOPEZ",
                "age": 8,
                "classroom": [],
                "school": [],
                "email": "LL27@vm.com",
                "rut": "2552",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d573a9796948ac45cf48f7",
                "name": "MATIAS",
                "lastName": "LOPEZ",
                "age": 14,
                "classroom": [],
                "school": [],
                "email": "ML87@vm.com",
                "rut": "9399",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc5f13515152263265848",
                        "name": "Sub 15"
                    }
                ]
            },
            {
                "_id": "68d573b7796948ac45cf49dd",
                "name": "NICOLAS",
                "lastName": "LORCA",
                "age": 9,
                "classroom": [],
                "school": [],
                "email": "NL133@vm.com",
                "rut": "7140",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d573a1796948ac45cf4870",
                "name": "DIEGO",
                "lastName": "MACAYA",
                "age": 12,
                "classroom": [],
                "school": [],
                "email": "DM60@vm.com",
                "rut": "1602",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    }
                ]
            },
            {
                "_id": "68d573ae796948ac45cf4942",
                "name": "SEBASTIAN",
                "lastName": "MAGUIÑO",
                "age": 14,
                "classroom": [],
                "school": [],
                "email": "SM102@vm.com",
                "rut": "1395",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc5f13515152263265848",
                        "name": "Sub 15"
                    }
                ]
            },
            {
                "_id": "68d573b5796948ac45cf49bf",
                "name": "VICENTE",
                "lastName": "MARCOS",
                "age": 10,
                "classroom": [],
                "school": [],
                "email": "VM127@vm.com",
                "rut": "2725",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "656f70dc77158b0bea26c333",
                        "name": "Sub 11"
                    }
                ]
            },
            {
                "_id": "68d573a8796948ac45cf48d9",
                "name": "CRISTOBAL",
                "lastName": "MASFERRER",
                "age": 15,
                "classroom": [],
                "school": [],
                "email": "CM81@vm.com",
                "rut": "4270",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc5f13515152263265848",
                        "name": "Sub 15"
                    }
                ]
            },
            {
                "_id": "68d573a3796948ac45cf4884",
                "name": "IGNACIO",
                "lastName": "MASFERRER",
                "age": 11,
                "classroom": [],
                "school": [],
                "email": "IM64@vm.com",
                "rut": "5187",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "656f70dc77158b0bea26c333",
                        "name": "Sub 11"
                    }
                ]
            },
            {
                "_id": "68d57397796948ac45cf47c1",
                "name": "CRISTOFER",
                "lastName": "MAYA",
                "age": 9,
                "classroom": [],
                "school": [],
                "email": "CM25@vm.com",
                "rut": "5076",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d573a6796948ac45cf48c5",
                "name": "AGUSTIN",
                "lastName": "MOLINA",
                "age": 0,
                "classroom": [],
                "school": [],
                "email": "AM77@vm.com",
                "rut": "7967",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc2df35151522632657e0",
                        "name": "Sub 5"
                    }
                ]
            },
            {
                "_id": "68d573b3796948ac45cf4992",
                "name": "JULIANA",
                "lastName": "MORA",
                "age": 0,
                "classroom": [],
                "school": [],
                "email": "JM118@vm.com",
                "rut": "5560",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "68d5d1f7ad5e16bc7d332e95",
                        "name": "Femenino"
                    }
                ]
            },
            {
                "_id": "68d57395796948ac45cf47ad",
                "name": "GASPAR",
                "lastName": "MORALES",
                "age": 9,
                "classroom": [],
                "school": [],
                "email": "GM21@vm.com",
                "rut": "7744",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d573b4796948ac45cf49a6",
                "name": "MAGDALENA",
                "lastName": "MORALES",
                "age": 10,
                "classroom": [],
                "school": [],
                "email": "MM122@vm.com",
                "rut": "4949",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "68d5d1f7ad5e16bc7d332e95",
                        "name": "Femenino"
                    }
                ]
            },
            {
                "_id": "68d573a0796948ac45cf4857",
                "name": "ALEXIS",
                "lastName": "MORENO",
                "age": 11,
                "classroom": [],
                "school": [],
                "email": "AM55@vm.com",
                "rut": "5430",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "656f70dc77158b0bea26c333",
                        "name": "Sub 11"
                    }
                ]
            },
            {
                "_id": "68d573af796948ac45cf4951",
                "name": "ANTONELLA",
                "lastName": "MUÑOZ",
                "age": 8,
                "classroom": [],
                "school": [],
                "email": "AM105@vm.com",
                "rut": "2659",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "68d5d1f7ad5e16bc7d332e95",
                        "name": "Femenino"
                    }
                ]
            },
            {
                "_id": "68d57391796948ac45cf476c",
                "name": "JOAQUIN",
                "lastName": "MUÑOZ",
                "age": 7,
                "classroom": [],
                "school": [],
                "email": "JM8@vm.com",
                "rut": "1995",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65b90df4cda2702220b00874",
                        "name": "Sub 7"
                    }
                ]
            },
            {
                "_id": "68d5739a796948ac45cf47fd",
                "name": "JOSEPH",
                "lastName": "MUÑOZ",
                "age": 8,
                "classroom": [],
                "school": [],
                "email": "JM37@vm.com",
                "rut": "3246",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d5523ba00194ab261f079e",
                "name": "Vicente",
                "lastName": "Maya",
                "age": 5,
                "classroom": [],
                "school": [],
                "email": "vm1@vm.com",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc2df35151522632657e0",
                        "name": "Sub 5"
                    }
                ]
            },
            {
                "_id": "68d573ab796948ac45cf490b",
                "name": "ANGEL",
                "lastName": "NAJERA",
                "age": 17,
                "classroom": [],
                "school": [],
                "email": "AN91@vm.com",
                "rut": "2341",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc6323515152263265855",
                        "name": "Sub 17"
                    }
                ]
            },
            {
                "_id": "68d573ae796948ac45cf493d",
                "name": "ESTEBAN",
                "lastName": "NAVARRO",
                "age": 0,
                "classroom": [],
                "school": [],
                "email": "EN101@vm.com",
                "rut": "4898",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc2df35151522632657e0",
                        "name": "Sub 5"
                    }
                ]
            },
            {
                "_id": "68d5739b796948ac45cf4807",
                "name": "BRUNO",
                "lastName": "NUÑEZ",
                "age": 11,
                "classroom": [],
                "school": [],
                "email": "BN39@vm.com",
                "rut": "4411",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "656f70dc77158b0bea26c333",
                        "name": "Sub 11"
                    }
                ]
            },
            {
                "_id": "68d573ab796948ac45cf4910",
                "name": "ALVARO",
                "lastName": "OLAVE",
                "age": 15,
                "classroom": [],
                "school": [],
                "email": "AO92@vm.com",
                "rut": "5871",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc5f13515152263265848",
                        "name": "Sub 15"
                    }
                ]
            },
            {
                "_id": "68d573a8796948ac45cf48de",
                "name": "GONZALO",
                "lastName": "OLAVE",
                "age": 14,
                "classroom": [],
                "school": [],
                "email": "GO82@vm.com",
                "rut": "4486",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc5f13515152263265848",
                        "name": "Sub 15"
                    }
                ]
            },
            {
                "_id": "68d57394796948ac45cf4799",
                "name": "BENJAMIN",
                "lastName": "OLEA",
                "age": 9,
                "classroom": [],
                "school": [],
                "email": "BO17@vm.com",
                "rut": "1668",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d5739f796948ac45cf4848",
                "name": "BENJAMIN",
                "lastName": "OLGUIN",
                "age": 10,
                "classroom": [],
                "school": [],
                "email": "BO52@vm.com",
                "rut": "3144",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "656f70dc77158b0bea26c333",
                        "name": "Sub 11"
                    }
                ]
            },
            {
                "_id": "68d573a9796948ac45cf48ed",
                "name": "ALONSO",
                "lastName": "OLIVARES",
                "age": 14,
                "classroom": [],
                "school": [],
                "email": "AO85@vm.com",
                "rut": "7165",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc5f13515152263265848",
                        "name": "Sub 15"
                    }
                ]
            },
            {
                "_id": "68d573b5796948ac45cf49ba",
                "name": "FELIPPE",
                "lastName": "ORELLANA",
                "age": 0,
                "classroom": [],
                "school": [],
                "email": "FO126@vm.com",
                "rut": "4472",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc2df35151522632657e0",
                        "name": "Sub 5"
                    }
                ]
            },
            {
                "_id": "68d57397796948ac45cf47d0",
                "name": "PABLO",
                "lastName": "ORELLANA",
                "age": 9,
                "classroom": [],
                "school": [],
                "email": "PO28@vm.com",
                "rut": "9289",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d573ac796948ac45cf4929",
                "name": "MATHIAS",
                "lastName": "ORIHUELA",
                "age": 16,
                "classroom": [],
                "school": [],
                "email": "MO97@vm.com",
                "rut": "5238",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc6323515152263265855",
                        "name": "Sub 17"
                    }
                ]
            },
            {
                "_id": "68d573b1796948ac45cf4974",
                "name": "JULIETA",
                "lastName": "OYARCE",
                "age": 13,
                "classroom": [],
                "school": [],
                "email": "JO112@vm.com",
                "rut": "2263",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "68d5d1f7ad5e16bc7d332e95",
                        "name": "Femenino"
                    }
                ]
            },
            {
                "_id": "68d573b2796948ac45cf4988",
                "name": "JOSEFA",
                "lastName": "PALMA",
                "age": 10,
                "classroom": [],
                "school": [],
                "email": "JP116@vm.com",
                "rut": "7808",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "68d5d1f7ad5e16bc7d332e95",
                        "name": "Femenino"
                    }
                ]
            },
            {
                "_id": "68d573b3796948ac45cf4997",
                "name": "JOSEFA",
                "lastName": "PASTEN",
                "age": 11,
                "classroom": [],
                "school": [],
                "email": "JP119@vm.com",
                "rut": "6734",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "68d5d1f7ad5e16bc7d332e95",
                        "name": "Femenino"
                    }
                ]
            },
            {
                "_id": "68d573a0796948ac45cf4852",
                "name": "MAXIMO",
                "lastName": "PETERS",
                "age": 9,
                "classroom": [],
                "school": [],
                "email": "MP54@vm.com",
                "rut": "5512",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d57396796948ac45cf47b7",
                "name": "GIAN",
                "lastName": "PIERO NAJERA",
                "age": 8,
                "classroom": [],
                "school": [],
                "email": "GP23@vm.com",
                "rut": "6184",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d57393796948ac45cf4780",
                "name": "BAUTISTA",
                "lastName": "PINTO",
                "age": 6,
                "classroom": [],
                "school": [],
                "email": "BP12@vm.com",
                "rut": "6870",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65b90df4cda2702220b00874",
                        "name": "Sub 7"
                    }
                ]
            },
            {
                "_id": "68d57399796948ac45cf47e9",
                "name": "PABLO",
                "lastName": "POMBO",
                "age": 9,
                "classroom": [],
                "school": [],
                "email": "PP33@vm.com",
                "rut": "5006",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d5739a796948ac45cf47f3",
                "name": "CRISTOBAL",
                "lastName": "PONCE",
                "age": 8,
                "classroom": [],
                "school": [],
                "email": "CP35@vm.com",
                "rut": "2579",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d573a5796948ac45cf48a7",
                "name": "AGUSTIN",
                "lastName": "PONCE",
                "age": 12,
                "classroom": [],
                "school": [],
                "email": "AP71@vm.com",
                "rut": "1781",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    }
                ]
            },
            {
                "_id": "68d573a6796948ac45cf48c0",
                "name": "CRISTOBAL",
                "lastName": "PRADENAS",
                "age": 12,
                "classroom": [],
                "school": [],
                "email": "CP76@vm.com",
                "rut": "4134",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    }
                ]
            },
            {
                "_id": "68d5739d796948ac45cf4825",
                "name": "AUGUSTO",
                "lastName": "QUEVEDO",
                "age": 10,
                "classroom": [],
                "school": [],
                "email": "AQ45@vm.com",
                "rut": "9830",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "656f70dc77158b0bea26c333",
                        "name": "Sub 11"
                    }
                ]
            },
            {
                "_id": "68d57390796948ac45cf4762",
                "name": "RAMON",
                "lastName": "QUEVEDO",
                "age": 7,
                "classroom": [],
                "school": [],
                "email": "RQ6@vm.com",
                "rut": "9738",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65b90df4cda2702220b00874",
                        "name": "Sub 7"
                    }
                ]
            },
            {
                "_id": "68d573a2796948ac45cf487a",
                "name": "FELIPE",
                "lastName": "QUINTANA",
                "age": 12,
                "classroom": [],
                "school": [],
                "email": "FQ62@vm.com",
                "rut": "5132",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    }
                ]
            },
            {
                "_id": "68d573a7796948ac45cf48ca",
                "name": "MATIAS",
                "lastName": "QUINTERO",
                "age": 0,
                "classroom": [],
                "school": [],
                "email": "MQ78@vm.com",
                "rut": "8024",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc2df35151522632657e0",
                        "name": "Sub 5"
                    }
                ]
            },
            {
                "_id": "68d5739b796948ac45cf4811",
                "name": "LAUTARO",
                "lastName": "REYES",
                "age": 10,
                "classroom": [],
                "school": [],
                "email": "LR41@vm.com",
                "rut": "8159",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "656f70dc77158b0bea26c333",
                        "name": "Sub 11"
                    }
                ]
            },
            {
                "_id": "68d5739e796948ac45cf483e",
                "name": "MAXIMO",
                "lastName": "REYES",
                "age": 10,
                "classroom": [],
                "school": [],
                "email": "MR50@vm.com",
                "rut": "7276",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "656f70dc77158b0bea26c333",
                        "name": "Sub 11"
                    }
                ]
            },
            {
                "_id": "68d573b1796948ac45cf4979",
                "name": "AMBAR",
                "lastName": "REYES",
                "age": 13,
                "classroom": [],
                "school": [],
                "email": "AR113@vm.com",
                "rut": "8493",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "68d5d1f7ad5e16bc7d332e95",
                        "name": "Femenino"
                    }
                ]
            },
            {
                "_id": "68d57399796948ac45cf47e4",
                "name": "MAXIMO",
                "lastName": "ROBLEDO",
                "age": 8,
                "classroom": [],
                "school": [],
                "email": "MR32@vm.com",
                "rut": "5420",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d57390796948ac45cf4758",
                "name": "VICENTE",
                "lastName": "ROBLES",
                "age": 7,
                "classroom": [],
                "school": [],
                "email": "VR4@vm.com",
                "rut": "6759",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65b90df4cda2702220b00874",
                        "name": "Sub 7"
                    }
                ]
            },
            {
                "_id": "68d573a3796948ac45cf4889",
                "name": "LUCAS",
                "lastName": "ROBLES",
                "age": 13,
                "classroom": [],
                "school": [],
                "email": "LR65@vm.com",
                "rut": "2022",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    }
                ]
            },
            {
                "_id": "68d57396796948ac45cf47b2",
                "name": "GASPAR",
                "lastName": "RODRIGUEZ",
                "age": 9,
                "classroom": [],
                "school": [],
                "email": "GR22@vm.com",
                "rut": "2505",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d5739f796948ac45cf484d",
                "name": "ALBERT",
                "lastName": "ROQUE",
                "age": 10,
                "classroom": [],
                "school": [],
                "email": "AR53@vm.com",
                "rut": "6244",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "656f70dc77158b0bea26c333",
                        "name": "Sub 11"
                    }
                ]
            },
            {
                "_id": "68d573b2796948ac45cf498d",
                "name": "FERNANDA",
                "lastName": "SAEZ",
                "age": 13,
                "classroom": [],
                "school": [],
                "email": "FS117@vm.com",
                "rut": "2923",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "68d5d1f7ad5e16bc7d332e95",
                        "name": "Femenino"
                    }
                ]
            },
            {
                "_id": "68d573b6796948ac45cf49ce",
                "name": "JUSTIN",
                "lastName": "SAEZ",
                "age": 17,
                "classroom": [],
                "school": [],
                "email": "JS130@vm.com",
                "rut": "5199",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc6323515152263265855",
                        "name": "Sub 17"
                    }
                ]
            },
            {
                "_id": "68d5738f796948ac45cf4753",
                "name": "KYLIAM",
                "lastName": "SALINAS",
                "age": 5,
                "classroom": [],
                "school": [],
                "email": "KS3@vm.com",
                "rut": "8416",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc2df35151522632657e0",
                        "name": "Sub 5"
                    }
                ]
            },
            {
                "_id": "68d573a5796948ac45cf48ac",
                "name": "MATIAS",
                "lastName": "SAN MARTIN",
                "age": 13,
                "classroom": [],
                "school": [],
                "email": "MS72@vm.com",
                "rut": "6313",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    }
                ]
            },
            {
                "_id": "68d573ae796948ac45cf4947",
                "name": "EIKYN",
                "lastName": "SANDOVAL",
                "age": 0,
                "classroom": [],
                "school": [],
                "email": "ES103@vm.com",
                "rut": "6551",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc2df35151522632657e0",
                        "name": "Sub 5"
                    }
                ]
            },
            {
                "_id": "68d573b7796948ac45cf49d8",
                "name": "MARTIN",
                "lastName": "SANDOVAL",
                "age": 8,
                "classroom": [],
                "school": [],
                "email": "MS132@vm.com",
                "rut": "6710",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d573b7796948ac45cf49d3",
                "name": "AIRA",
                "lastName": "SANHUEZA",
                "age": 9,
                "classroom": [],
                "school": [],
                "email": "AS131@vm.com",
                "rut": "9259",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d57395796948ac45cf47a8",
                "name": "FERNANDO",
                "lastName": "SERRANO",
                "age": 8,
                "classroom": [],
                "school": [],
                "email": "FS20@vm.com",
                "rut": "4924",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d5739a796948ac45cf47f8",
                "name": "GABRIEL",
                "lastName": "SIFUENTES",
                "age": 7,
                "classroom": [],
                "school": [],
                "email": "GS36@vm.com",
                "rut": "7223",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65b90df4cda2702220b00874",
                        "name": "Sub 7"
                    }
                ]
            },
            {
                "_id": "68d57399796948ac45cf47ee",
                "name": "CRISTOBAL",
                "lastName": "SILVA",
                "age": 9,
                "classroom": [],
                "school": [],
                "email": "CS34@vm.com",
                "rut": "9723",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d573a1796948ac45cf4866",
                "name": "SEBASTIAN",
                "lastName": "SOTO",
                "age": 11,
                "classroom": [],
                "school": [],
                "email": "SS58@vm.com",
                "rut": "1778",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "656f70dc77158b0bea26c333",
                        "name": "Sub 11"
                    }
                ]
            },
            {
                "_id": "68d573a8796948ac45cf48e8",
                "name": "VICENTE",
                "lastName": "SOTO",
                "age": 15,
                "classroom": [],
                "school": [],
                "email": "VS84@vm.com",
                "rut": "1227",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc5f13515152263265848",
                        "name": "Sub 15"
                    }
                ]
            },
            {
                "_id": "68d573a4796948ac45cf48a2",
                "name": "FELIPE",
                "lastName": "SOTO",
                "age": 13,
                "classroom": [],
                "school": [],
                "email": "FS70@vm.com",
                "rut": "5314",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    }
                ]
            },
            {
                "_id": "68d573b5796948ac45cf49b5",
                "name": "HILARY",
                "lastName": "SULVARAN",
                "age": 0,
                "classroom": [],
                "school": [],
                "email": "HS125@vm.com",
                "rut": "4104",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc2df35151522632657e0",
                        "name": "Sub 5"
                    }
                ]
            },
            {
                "_id": "68d57395796948ac45cf47a3",
                "name": "CRISTHOPER",
                "lastName": "TAPIA",
                "age": 8,
                "classroom": [],
                "school": [],
                "email": "CT19@vm.com",
                "rut": "9366",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68d573a8796948ac45cf48e3",
                "name": "DANIEL",
                "lastName": "TINJACA",
                "age": 14,
                "classroom": [],
                "school": [],
                "email": "DT83@vm.com",
                "rut": "4278",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc5f13515152263265848",
                        "name": "Sub 15"
                    }
                ]
            },
            {
                "_id": "68d57398796948ac45cf47da",
                "name": "JUAN",
                "lastName": "TINJACA",
                "age": 8,
                "classroom": [],
                "school": [],
                "email": "JT30@vm.com",
                "rut": "1189",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65baa45d06a665fe5d406024",
                        "name": "Sub 9"
                    }
                ]
            },
            {
                "_id": "68c1cfc4a082b68c01b1fc52",
                "name": "Jugador",
                "lastName": "Test",
                "age": 0,
                "weight": 0,
                "size": 0,
                "classroom": [],
                "school": [],
                "email": "jugadortest@vm.cl",
                "phone": "0",
                "rut": "93666666000",
                "gender": "-",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "656f70dc77158b0bea26c333",
                        "name": "Sub 11"
                    }
                ]
            },
            {
                "_id": "68d573a0796948ac45cf4861",
                "name": "BORJA",
                "lastName": "UNZAGA",
                "age": 11,
                "classroom": [],
                "school": [],
                "email": "BU57@vm.com",
                "rut": "9027",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "656f70dc77158b0bea26c333",
                        "name": "Sub 11"
                    }
                ]
            },
            {
                "_id": "68d573a7796948ac45cf48cf",
                "name": "ENRIQUE",
                "lastName": "VALENCIA",
                "age": 13,
                "classroom": [],
                "school": [],
                "email": "EV79@vm.com",
                "rut": "5827",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    }
                ]
            },
            {
                "_id": "68d57392796948ac45cf477b",
                "name": "LUCIANO",
                "lastName": "VALENZUELA",
                "age": 7,
                "classroom": [],
                "school": [],
                "email": "LV11@vm.com",
                "rut": "3632",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65b90df4cda2702220b00874",
                        "name": "Sub 7"
                    }
                ]
            },
            {
                "_id": "68d573a9796948ac45cf48f2",
                "name": "EDGAR",
                "lastName": "VALLETE",
                "age": 15,
                "classroom": [],
                "school": [],
                "email": "EV86@vm.com",
                "rut": "9074",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc5f13515152263265848",
                        "name": "Sub 15"
                    }
                ]
            },
            {
                "_id": "68d573b4796948ac45cf49ab",
                "name": "DOMINGO",
                "lastName": "VARGAS",
                "age": 0,
                "classroom": [],
                "school": [],
                "email": "DV123@vm.com",
                "rut": "9161",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc2df35151522632657e0",
                        "name": "Sub 5"
                    }
                ]
            },
            {
                "_id": "68d573b4796948ac45cf49b0",
                "name": "BALTAZAR",
                "lastName": "VARGAS",
                "age": 0,
                "classroom": [],
                "school": [],
                "email": "BV124@vm.com",
                "rut": "4446",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc2df35151522632657e0",
                        "name": "Sub 5"
                    }
                ]
            },
            {
                "_id": "68d573a4796948ac45cf4898",
                "name": "STEFANO",
                "lastName": "VASQUEZ",
                "age": 13,
                "classroom": [],
                "school": [],
                "email": "SV68@vm.com",
                "rut": "8764",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    }
                ]
            },
            {
                "_id": "68d57390796948ac45cf475d",
                "name": "MILANO",
                "lastName": "VASQUEZ",
                "age": 6,
                "classroom": [],
                "school": [],
                "email": "MV5@vm.com",
                "rut": "4160",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65b90df4cda2702220b00874",
                        "name": "Sub 7"
                    }
                ]
            },
            {
                "_id": "68d573b6796948ac45cf49c9",
                "name": "MATIAS",
                "lastName": "VEAS",
                "age": 18,
                "classroom": [],
                "school": [],
                "email": "MV129@vm.com",
                "rut": "1967",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc6323515152263265855",
                        "name": "Sub 17"
                    }
                ]
            },
            {
                "_id": "68d573aa796948ac45cf48fc",
                "name": "MARTIN",
                "lastName": "VEGA",
                "age": 13,
                "classroom": [],
                "school": [],
                "email": "MV88@vm.com",
                "rut": "5049",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    },
                    {
                        "_id": "65bd70c66811be13e74a8470",
                        "name": "Sub 13"
                    }
                ]
            },
            {
                "_id": "68d573b3796948ac45cf499c",
                "name": "CONSTANZA",
                "lastName": "VELOZO",
                "age": 14,
                "classroom": [],
                "school": [],
                "email": "CV120@vm.com",
                "rut": "7834",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "68d5d1f7ad5e16bc7d332e95",
                        "name": "Femenino"
                    }
                ]
            },
            {
                "_id": "68d5739f796948ac45cf4843",
                "name": "SEBASTIAN",
                "lastName": "VERA",
                "age": 10,
                "classroom": [],
                "school": [],
                "email": "SV51@vm.com",
                "rut": "2422",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "656f70dc77158b0bea26c333",
                        "name": "Sub 11"
                    }
                ]
            },
            {
                "_id": "68d5739b796948ac45cf480c",
                "name": "EMILIANO",
                "lastName": "VIDAL",
                "age": 11,
                "classroom": [],
                "school": [],
                "email": "EV40@vm.com",
                "rut": "3842",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "656f70dc77158b0bea26c333",
                        "name": "Sub 11"
                    }
                ]
            },
            {
                "_id": "68d573ad796948ac45cf492e",
                "name": "PABLO",
                "lastName": "VIGORENA",
                "age": 17,
                "classroom": [],
                "school": [],
                "email": "PV98@vm.com",
                "rut": "1903",
                "role": "ESTU",
                "logged": "false",
                "workshop": [
                    {
                        "_id": "681bc6323515152263265855",
                        "name": "Sub 17"
                    }
                ]
            }
        ],
        "address": "Talinay, La Reina. Region Metropolitana",
        "email": "asociacionfutbolrm@vitalmove.cl",
        "phone": "981534347",
        "rut": "7745240333",
        "createdAt": "2023-12-05T18:47:26.242Z",
        "updatedAt": "2025-09-25T23:38:54.263Z",
        "__v": 230,
        "institution": [
            {
                "_id": "6537fd0302fc9d900a71ab25",
                "name": "Moveplay Escuelas de fútbol",
                "address": "Complejo Deportivo Talinay, Talinay 9105, La Reina",
                "email": "moveplay@vitalmoveglobal.com",
                "phone": "963639696",
                "type": "sport"
            }
        ],
        "devices": [],
        "ageGroups": [],
        "assistantCoaches": [],
        "coach": [],
        "medicalStaff": [],
        "trainingDays": []
    },
    "success": true,
    "message": "Programa encontrado"
}
```


## el controlador debe eliminar los estudiantes y sacarlos de los talleres y luego del programa.

