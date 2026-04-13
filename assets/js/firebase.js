"use strict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBEzm3LX42yBosp9Tjv40FGKIP-z-RBs_4",
    authDomain: "enciclopediahyrule.firebaseapp.com",
    projectId: "enciclopediahyrule",
    storageBucket: "enciclopediahyrule.firebasestorage.app",
    messagingSenderId: "434653160272",
    appId: "1:434653160272:web:4a5c039280513a7d0c8255",
    measurementId: "G-KE963HL6DC"
};

const app = initializeApp(firebaseConfig);
const bd = getFirestore(app);

console.log("Firebase conectado", bd);

export const guardarFavoritos = async(id, categoria) => {
    await addDoc(collection(bd, "favoritos"),{
        tarjetaId : id,
        categoria : categoria,
        fecha : new Date()
    })
}

export const obtenerFavoritos = async() =>{
    const favoritos = await getDocs(collection(bd,"favoritos"))
    return favoritos.docs.map(favorito => favorito.data())
}

export const eliminarFavorito = async(id) =>{
    const favoritos = await getDocs(collection(bd,"favoritos"))
    for(const documento of favoritos.docs){
        if(documento.data().tarjetaId === id){
            await deleteDoc(doc(bd,"favoritos",documento.id))
        }
    }
}