require('dotenv').config()
const db = require('./config/database')

const Student = require('./models/student')


Student.create(

    {
        name: "juan ignacio",
        lastName: "fajardo",
        rut: "261231230",
        email: "juanignacio@gmail.com",
        phone: "936253625",
        age: 8,
        weight: 25,
        size: 115,
        classroom: [],
        school: [],
        gender: "male"
    },
    {
        name: "Jose",
        lastName: "Moncada",
        rut: "559863314",
        email: "moncada@gmail.com",
        phone: "985859696",
        age: 7,
        weight: 22,
        size: 110,
        classroom: [],
        school: [],
        gender: "male"
    },
    {
        name: "Raul",
        lastName: "Molina",
        rut: "256325412k",
        email: "molinaR@gmail.com",
        phone: "996633225",
        age: 8,
        weight: 20,
        size: 105,
        classroom: [],
        school: [],
        gender: "male"
    },
    {
        name: "bill",
        lastName: "clinton",
        rut: "125368950",
        email: "clinton@gmail.com",
        phone: "900002563",
        age: 8,
        weight: 23,
        size: 120,
        classroom: [],
        school: [],
        gender: "male"
    },
    {
        name: "emiliano",
        lastName: "ferreira",
        rut: "15797946",
        email: "ferreriaE@gmail.com",
        phone: "665831700",
        age: 9,
        weight: 27,
        size: 110,
        classroom: [],
        school: [],
        gender: "male"
    },
    {
        name: "dorada",
        lastName: "salazar",
        rut: "11326826k",
        email: "salazarD@gmail.com",
        phone: "702058234",
        age: 7,
        weight: 20,
        size: 110,
        classroom: [],
        school: [],
        gender: "female"
    },
    {
        name: "paula",
        lastName: "barreiro",
        rut: "940442401",
        email: "barreiropau@gmail.com",
        phone: "731413908",
        age: 8,
        weight: 23,
        size: 110,
        classroom: [],
        school: [],
        gender: "female"
    },
    {
        name: "itziar",
        lastName: "cuevas",
        rut: "87452119r",
        email: "cuevasitziar@gmail.com",
        phone: "606948877",
        age: 7,
        weight: 24,
        size: 113,
        classroom: [],
        school: [],
        gender: "female"
    },
    {
        name: "tatiana",
        lastName: "solis",
        rut: "29901792k",
        email: "solistatiana@gmail.com",
        phone: "681031988",
        age: 8,
        weight: 20,
        size: 108,
        classroom: [],
        school: [],
        gender: "female"
    },
    {
        name: "luisa",
        lastName: "vera",
        rut: "745543679",
        email: "veraluisa@gmail.com",
        phone: "795668636",
        age: 7,
        weight: 26,
        size: 121,
        classroom: [],
        school: [],
        gender: "female"
    },
    
    {
        name: "candelaria",
        lastName: "benito",
        rut: "690275478",
        email: "benitocande@gmail.com",
        phone: "742733761",
        age: 9,
        weight: 29,
        size: 120,
        classroom: [],
        school: [],
        gender: "female"
    },
    
)