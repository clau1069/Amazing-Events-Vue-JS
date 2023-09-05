const app = Vue.

createApp({
  el: '#app',
  data() {
    return {
      value: '',
      eventos:[],
      arrayCategorias:["Show All"],
      categorias:[],
      eventosFiltrados:"",
      fechaBase:[],
      eventosFuturos:[],
      eventosPasados:[],
      categoriaSelected:[],
      eventoid:"",
      id:"",
      idsearch:"",
      eventodetails:"",
      eventoConMayorPorcentajeAsist:"",
      eventoConMenorPorcentajeAsist:"",
      eventoMayorCapacidad:"",
      arrayParaPintarEnStats:[],
      arrayParaPintarEnPast:[],
      categoriasEfuturos:[],
      moneda:""
    }
  },
  created() {
    fetch('https://amazing-events.herokuapp.com/api/events')
      .then((respuesta) => respuesta.json())
      .then((json) => {
        console.log(json)
        this.eventos = json.events
        console.log(this.eventos)
        this.fechaBase= json.currentDate
        this.moneda = new Intl.NumberFormat(`en-US`,{
          style:`currency`,
          currency: `USD`, 
          minimumFractionDigits: 2
      });

        
        //crear array para crear los checkbox de forma dinámica (linea 121 html)
        this.categorias=this.crearArrayDeCategorias(this.eventos)
       
        
        //array de eventos FUTUROS| se pinta en hmtl
        this.eventosFuturos=this.eventos.filter((evento) => (new Date(evento.date).getTime() > new Date(this.fechaBase).getTime()));
        //array de eventos PASADOS| se pinta en hmtl
        this.eventosPasados=this.eventos.filter((evento) => (new Date(evento.date).getTime() < new Date(this.fechaBase).getTime()));

        
        if(document.title=="Upcoming Events"){
          this.eventos=this.eventosFuturos
          console.log("en upcoming")
          console.log(this.eventos)
        } else if(document.title=="Past Events"){
          this.eventos=this.eventosPasados
          console.log("en past")
          console.log(this.eventos)
        } else if((document.title=="Amazing Events")){
          this.eventosFiltrados=this.eventos
          console.log("en home")
        } else if(document.title=="Details"){
          this.pintarDetails()
        } else if(document.title=="Stats"){
          console.log("pint")
          this.pintarStats(this.eventosPasados)
          this.pintarUpStats(this.eventosFuturos, this.arrayParaPintarEnStats)
          this.pintarUpStats(this.eventosPasados, this.arrayParaPintarEnPast)
        }
        
        
      })
      .catch((error) => console.log(error))
  },






  methods: {
    crearArrayDeCategorias(data){
      // buscar una forma de que aparezcan las categorias que existen solo en la data (de past y upcomign events)
      data.map (evento =>{
        this.arrayCategorias.push(evento.category)
      })
      return this.arrayCategorias.filter ((elemento, posicion, array)=>{return posicion === array.indexOf(elemento)});
    },
    submit(e){
      e.preventDefault()
    },

    FiltrarDatos(eventos){
      if (this.value !=""){
        this.eventosFiltrados= this.eventos.filter(evento=>evento.name.toLowerCase().includes(this.value.toLowerCase()))
      }else{
        this.eventosFiltrados=this.eventos
      }
      
      
      if (this.categoriaSelected !=""){
        if(this.categoriaSelected.includes("Show All")){
          eventosFiltrados=this.eventos
        }else{
          this.eventosFiltrados= this.eventosFiltrados.filter(evento=>this.categoriaSelected.includes(evento.category))
        }
      }
      
    },

    pintarDetails(){
      this.id= location.search
      this.idsearch=location.search.split("?id=").join(""); 
      console.log(this.idsearch)
      //filtrar eventos por el id
      this.eventodetails=this.eventos.filter(evento=>evento._id==this.idsearch)[0]
      console.log(this.eventodetails)
    },


    pintarStats(datos){
      //ordenar el array de eventos segun en mayor porcentaje de asistencia
      //colocar en cada evento el orcentaje de asistencia
      eventosConPorcentaje=this.agregarPorcentajeAData(datos)
      //ordenar el array de eventos segun en mayor porcentaje de asistencia
      this.eventoConMayorPorcentajeAsist=datos.sort((a,b)=>b.porcentageAsist-a.porcentageAsist)[0].name
      this.eventoConMenorPorcentajeAsist=datos.sort((a,b)=>a.porcentageAsist-b.porcentageAsist)[0].name
      console.log(this.eventoConMayorPorcentajeAsist)
      this.eventoMayorCapacidad= datos.sort((a,b)=>b.capacity-a.capacity)[0].name
    },
    agregarPorcentajeAData(data){
      for(i=0;i<data.length;i++){
          porcentaje=Math.round((data[i].assistance*100)/data[i].capacity)
          data[i].porcentageAsist= porcentaje
      }
      return data
    },





    pintarUpStats(datos, arrayApintar){
      this.arrayCategorias=[]
      this.arrayCategorias=this.crearArrayDeCategorias(datos)
      
      console.log(this.arrayCategorias)
    /* let arrayGanancias=rellenarRevenuesUpcoming(arraycategorias, datosFuturos) */

    //CAMBIAR this.arrayCategorias POR ARRAYCATEGORIAS
    this.arrayCategorias.forEach((categoria)=>{
        let objeto={}
        objeto.category=categoria
        arrayApintar.push(objeto)
    })
    /* arrayApintar.pop() */ //NO LO NECESITÉ EN VUE
    console.log(this.arrayCategorias)
    /* arrayParaPintarEnStats[0].algo=5 */
    
    for(i=0;i<arrayApintar.length;i++){
        arrayApintar[i].ingresos=0
    }

    //crear array de ganacias
    //por cada categoria, tengo que sumar las ganacias de cada evento
    
    for (i=0;i<this.arrayCategorias.length;i++){
        let gananciaDelEvento=0
        for(j=0;j<datos.length;j++){
            
            if (datos[j].category== this.arrayCategorias[i] && datos.length<25){
                gananciaDelEvento+=datos[j].price*datos[j].estimate
                console.log(arrayApintar)
                arrayApintar[i].ingresos="$"+(gananciaDelEvento)
            } else if(datos[j].category== this.arrayCategorias[i] && datos.length>25){
                gananciaDelEvento+=datos[j].price*datos[j].assistance
                arrayApintar[i].ingresos="$"+(gananciaDelEvento)
            }
        }   
    }


    //crear array de porcentaje de asistencia
    for (i=0;i<this.arrayCategorias.length;i++){
        let PorcentajeAsistencia=0
        let totalEstimado=0
        let totalSumaCapacidad=0
        for(j=0;j<datos.length;j++){
            
            if (datos[j].category== this.arrayCategorias[i] && datos.length<25){
                totalEstimado+=datos[j].estimate
                totalSumaCapacidad+=datos[j].capacity
            } else if(datos[j].category== this.arrayCategorias[i] && datos.length>25){
                totalEstimado+=datos[j].assistance
                totalSumaCapacidad+=datos[j].capacity
            }
        }
        PorcentajeAsistencia=totalEstimado*100/totalSumaCapacidad
        arrayApintar[i].porcentAsist=Math.round(PorcentajeAsistencia)+"%"
    }
    console.log(arrayApintar)
    }
      
    
  },
  

  computed: {
    search(){
      
      if (this.value !="" || this.categoriaSelected !=""){
        this.FiltrarDatos()
      }else if (this.categoriaSelected ==""){
        this.eventosFiltrados=this.eventos
      }
    }


  },
}).mount('#app')


