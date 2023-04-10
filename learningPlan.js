
const modeloPlanificacion = {

    GRADO: Number,
    NIVEL: String,
    TEMARIO: [
        {
            OBJETIVO_DE_APRENDIZAJE:"",
            OBJETIVOS_DE_LA_CLASE: "",
            INDICADOR_DE_EVALUACION_1  : [{
                destacado       : 4,
                competente      : 3,
                basico          : 2,
                necesita_mejorar: 1
            }],
            ACTIVIDADES: [
                "Actividad #1",
                "Actividad #2",
                "Actividad #3",
                "Actividad #4",
            ],
            MATERIALES: [
                "Material de apoyo #1",
                "Material de apoyo #2",
                "Material de apoyo #3",
                "Material de apoyo #4",
            ],
            TIPO_DE_EVALUACION: [
                "comentario #1",
                "comentario #2",
                "comentario #3",
                "comentario #4",
            ]
        },
        {},
        {},
        {},
    ],
    horas_anuales_jec: Number,
    horas_anuales_no_jec: Number,
    horas_semanales_jec: Number,
    horas_semanales_no_jec: Number,
    recursos: [
        {
            titulo: "recurso #1"
        },
    ]

}