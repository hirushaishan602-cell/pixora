"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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

<Image src="/images/logo.png" alt="PIXORA" width={170} height={48} priority className="loader-logo" />

</div>

)

}