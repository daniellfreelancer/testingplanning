//iniciar clase

const parte1 = {
    OBJETIVO_DE_APRENDIZAJE: "Objetivo de aprendizaje",
    OBJETIVOS_DE_LA_CLASE: "Objetivo de la clase",
    INDICADOR_DE_EVALUACION: "Indicador de evaluación",
    ACTIVIDADES: ["Actividades"],
    MATERIALES: "Materiales",
    RELOJ: "Datos reloj",
    TIEMPO_DE_CLASE: Number,
    TIPO_DE_EVALUACION: "comentarios"
}

// continuar

const parte2 = {
    GRADO: "Grado de la clase",
    SECCION: "Sección del grado",
    HORARIO_CLASE: "Horario de clase planificada",
    PROFESOR: "Profesor",
    ASISTENCIA: Boolean,
    MATERIALES_ASEO: Boolean,
    JUSTIFICACION: Boolean,
    ESTUDIANTES: Array,

}

//continuar

/**
 * clase
 */
const parte3 = {
    GRADO: "Grado de la clase",
    SECCION: "Sección del grado",
    ACTIVIDADES : ["Actividades"],
    TIEMPO_RESTANTE: "Cuenta regresiva",
    PROGRESO_RESTANTE : "barra de progreso en funcion del tiempo en %",
    IMG_ACTIVIDADES:  "imagenes de la actividad en curso",
    INGRESO_DE_OBSERVACIONES: "Inputs de observaciones",
    OBSERVACIONES: ["Observaciones de la clase #1", "Observaciones de la clase #2 ", "Observaciones de la clase #3 "],

}

//continuar

const parte4 = {
    GRADO: "Grado de la clase",
    SECCION: "Sección del grado",
    ACTIVIDADES : ["comentarios"],
    TIEMPO_RESTANTE: "Cuenta regresiva finalizada",
    PROGRESO_RESTANTE : "barra de progreso en funcion del tiempo en 100%",
    IMG_ACTIVIDADES:  "imagenes de la actividad en curso",
    OBSERVACIONES: ["Observaciones de la clase #1", "Observaciones de la clase #2 ", "Observaciones de la clase #3 "],
}


//finalizar clase => resumen de la clase + evaluaciones

const resultados = {
    HORARIO_CLASE: "Hora inicio/fin clase",
    ASISTENCIA: "numero de alumnos-asistentes",
    FECHA: "fecha de la clase",
    GRADO: "Grado de la clase",
    SECCION: "Sección del grado",
    OBJETIVO_DE_APRENDIZAJE: "Objetivo de aprendizaje",
    OBJETIVOS_DE_LA_CLASE: "Objetivo de la clase",
    INDICADOR_DE_EVALUACION_1  : {
        destacado       : 4,
        competente      : 3,
        basico          : 2,
        necesita_mejorar: 1
    },
    ACTIVIDADES : ["Actividades"],
    MATERIALES: ["agua", "tenis", "video del entrenamiento"],
    TIEMPO_DE_CLASE: Number,
    TIPO_DE_EVALUACION: "comentarios"
}

//guardar => go to VMClass index view



// Planificaciones


const crearPlanificacion = {
    GRADO: "Grado de la clase",
    SECCION: "Sección del grado",
    MES_ACTUAL: "mes y año",
    SEMANA_DEL_MES: "semana del mes dom../../../sab",
    OBJETIVO_DE_APRENDIZAJE: "Objetivo de aprendizaje",
    OBJETIVOS_DE_LA_CLASE: "Objetivo de la clase",
    INDICADOR_DE_EVALUACION_1  : {
        destacado       : 4,
        competente      : 3,
        basico          : 2,
        necesita_mejorar: 1
    },
    ACTIVIDADES: ["Actividades"],
    MATERIALES: "Materiales",
    TIPO_DE_EVALUACION: "comentarios"
}

// guardar => go to VMClass index view




[
    {
    "_id": "64346c113b38906ffec96188",
    "GRADE": 1,
    "LEVEL": "Básico",
    "REGULAR_PROGRAM_UNIT": [
    {
    "TITLE": "Unidad 1: Habilidades motrices básicas de locomoción, manipulación y estabilidad",
    "OBJECTIVES": "Habilidades motrices básicas de locomoción, manipulación y estabilidad en una variedad de juegos y actividades físicas. Hábitos de higiene, prevención y seguridad.",
    "APRENDIZAJES": [
    {
    "MATERIALES": [],
    "_id": "64347b24fc166003a783859e",
    "TIPO_DE_APRENDIZAJE": "Aprendizajes Basales",
    "OBJETIVO_DE_APRENDIZAJE": "EF01 OA 01",
    "OBJETIVOS_DE_LA_CLASE": "Demostrar habilidades motrices básicas de locomoción, manipulación y estabilidad en una variedad de juegos y actividades físicas, como saltar con dos pies consecutivamente en una dirección, lanzar un balón hacia un compañero, caminar y correr consecutivamente, lanzar y recoger un balón, caminar sobre una línea manteniendo el control del cuerpo, realizar suspensiones, giros y rodadas o volteos.",
    "INDICADOR_DE_EVALUACION_1": [
    {
    "destacado": 4,
    "competente": 3,
    "basico": 2,
    "necesita_mejorar": 1
    }
    ],
    "ACTIVIDADES": [
    "Actividad #1",
    "Actividad #2",
    "Actividad #3",
    "Actividad #4"
    ],
    " MATERIALES": [
    "Material de apoyo #1",
    "Material de apoyo #2",
    "Material de apoyo #3",
    "Material de apoyo #4"
    ],
    "TIPO_DE_EVALUACION": [
    "comentario #1",
    "comentario #2",
    "comentario #3",
    "comentario #4"
    ]
    },
    {
    "MATERIALES": [],
    "_id": "64347b24fc166003a783859f",
    "TIPO_DE_APRENDIZAJE": "Aprendizajes Basales",
    "OBJETIVO_DE_APRENDIZAJE": "EF01 OA 06",
    "OBJETIVOS_DE_LA_CLASE": "Ejecutar actividades físicas de intensidad moderada a vigorosa que incrementen la condición física, por medio de juegos y circuitos.",
    "INDICADOR_DE_EVALUACION_1": [
    {
    "destacado": 4,
    "competente": 3,
    "basico": 2,
    "necesita_mejorar": 1
    }
    ],
    "ACTIVIDADES": [
    "Actividad #1",
    "Actividad #2",
    "Actividad #3",
    "Actividad #4"
    ],
    " MATERIALES": [
    "Material de apoyo #1",
    "Material de apoyo #2",
    "Material de apoyo #3",
    "Material de apoyo #4"
    ],
    "TIPO_DE_EVALUACION": [
    "comentario #1",
    "comentario #2",
    "comentario #3",
    "comentario #4"
    ]
    },
    {
    "MATERIALES": [],
    "_id": "64347b24fc166003a78385a0",
    "TIPO_DE_APRENDIZAJE": "Aprendizajes Basales",
    "OBJETIVO_DE_APRENDIZAJE": "EF01 OA 09",
    "OBJETIVOS_DE_LA_CLASE": "Practicar actividades físicas en forma segura, demostrando la adquisición de hábitos de higiene, posturales y de vida saludable, como lavarse las manos y la cara después de la clase, mantener una correcta postura y comer una colación saludable antes y después de practicar actividad física.",
    "INDICADOR_DE_EVALUACION_1": [
    {
    "destacado": 4,
    "competente": 3,
    "basico": 2,
    "necesita_mejorar": 1
    }
    ],
    "ACTIVIDADES": [
    "Actividad #1",
    "Actividad #2",
    "Actividad #3",
    "Actividad #4"
    ],
    " MATERIALES": [
    "Material de apoyo #1",
    "Material de apoyo #2",
    "Material de apoyo #3",
    "Material de apoyo #4"
    ],
    "TIPO_DE_EVALUACION": [
    "comentario #1",
    "comentario #2",
    "comentario #3",
    "comentario #4"
    ]
    },
    {
    "MATERIALES": [],
    "_id": "64347b24fc166003a78385a1",
    "TIPO_DE_APRENDIZAJE": "Aprendizajes Basales",
    "OBJETIVO_DE_APRENDIZAJE": "EF01 OA 11",
    "OBJETIVOS_DE_LA_CLASE": "Practicar actividades físicas, demostrando comportamientos seguros como: realizar un calentamiento mediante un juego; escuchar y seguir instrucciones; utilizar implementos bajo supervisión; mantener su posición dentro de los límites establecidos para la actividad.",
    "INDICADOR_DE_EVALUACION_1": [
    {
    "destacado": 4,
    "competente": 3,
    "basico": 2,
    "necesita_mejorar": 1
    }
    ],
    "ACTIVIDADES": [
    "Actividad #1",
    "Actividad #2",
    "Actividad #3",
    "Actividad #4"
    ],
    " MATERIALES": [
    "Material de apoyo #1",
    "Material de apoyo #2",
    "Material de apoyo #3",
    "Material de apoyo #4"
    ],
    "TIPO_DE_EVALUACION": [
    "comentario #1",
    "comentario #2",
    "comentario #3",
    "comentario #4"
    ]
    }
    ],
    "_id": "64346c113b38906ffec96189"
    },
    {
    "TITLE": "Unidad 2: Acciones motrices en relación a sí mismos, un objeto o un compañero",
    "OBJECTIVES": "Acciones motrices en relación a sí mismos, un objeto o un compañero. Nociones básicas para orientarse en el espacio. Hábitos de higiene, prevención y seguridad.",
    "APRENDIZAJES": [],
    "_id": "64347572fa84f3e92a450d1d"
    },
    {
    "TITLE": "Unidad 3: Movimientos corporales para expresar ideas, estados de ánimo y emociones",
    "OBJECTIVES": "Expresión de ideas, estados de ánimo y emociones, por medio de movimientos corporales. Práctica de juegos tradicionales y diversas actividades lúdicas.",
    "APRENDIZAJES": [],
    "_id": "643475b9fa84f3e92a450d24"
    },
    {
    "TITLE": "Unidad 4: Movimiento en diferentes ambientes, práctica de juegos colectivos e individuales y trabajo en equipo",
    "OBJECTIVES": "Movimiento en diferentes ambientes -patio del colegio, plazas, parques, playas o cerros. Práctica de juegos colectivos e individuales. Trabajo en equipo, roles.",
    "APRENDIZAJES": [],
    "_id": "643475fefa84f3e92a450d2d"
    }
    ],
    "createdAt": "2023-04-10T20:05:37.814Z",
    "__v": 0
    },
    {
    "_id": "6434798e85af3a2b6e021b3c",
    "GRADE": 2,
    "LEVEL": "Básico",
    "REGULAR_PROGRAM_UNIT": [
    {
    "UNIT": 1,
    "TITLE": "Habilidades motrices básicas de locomoción, manipulación y estabilidad",
    "OBJECTIVES": "Habilidades motrices básicas de locomoción, manipulación y estabilidad en una variedad de juegos y actividades físicas. Hábitos de higiene, prevención y seguridad.",
    "APRENDIZAJES": [],
    "_id": "6434799785af3a2b6e021b3e"
    },
    {
    "UNIT": 2,
    "TITLE": "Acciones motrices en relación a sí mismos, un objeto o un compañero",
    "OBJECTIVES": "Acciones motrices en relación a sí mismos, un objeto o un compañero. Nociones básicas para orientarse en el espacio. Hábitos de higiene, prevención y seguridad.",
    "APRENDIZAJES": [],
    "_id": "643479c085af3a2b6e021b41"
    },
    {
    "UNIT": 3,
    "TITLE": "Movimientos corporales para expresar ideas, estados de ánimo y emociones",
    "OBJECTIVES": "Expresión de ideas, estados de ánimo y emociones, por medio de movimientos corporales. Práctica de juegos tradicionales y diversas actividades lúdicas.",
    "APRENDIZAJES": [],
    "_id": "643479fc85af3a2b6e021b45"
    },
    {
    "UNIT": 4,
    "TITLE": "Movimiento en diferentes ambientes, práctica de juegos colectivos e individuales y trabajo en equipo",
    "OBJECTIVES": "Movimiento en diferentes ambientes -patio del colegio, plazas, parques, playas o cerros. Práctica de juegos colectivos e individuales. Trabajo en equipo, roles.",
    "APRENDIZAJES": [],
    "_id": "64347a1585af3a2b6e021b4a"
    }
    ],
    "createdAt": "2023-04-10T21:03:10.296Z",
    "__v": 0
    }
    ]