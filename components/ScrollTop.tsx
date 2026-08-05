"use client";

import { FaArrowUp } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function ScrollTop(){

const [show,setShow]=useState(false);

useEffect(()=>{

window.addEventListener("scroll",()=>{

setShow(window.scrollY>300);

});

},[]);

return(

<button

className={show?"top active":"top"}

onClick={()=>window.scrollTo({

top:0,

behavior:"smooth"

})}

>

<FaArrowUp/>

</button>

)

}