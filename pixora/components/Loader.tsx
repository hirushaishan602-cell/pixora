"use client";

import { useEffect,useState } from "react";

export default function Loader(){

const [loading,setLoading]=useState(true);

useEffect(()=>{

setTimeout(()=>{

setLoading(false)

},1800)

},[])

if(!loading) return null;

return(

<div className="loader">

<h1>PIXORA</h1>

</div>

)

}