"use client";

import * as React from "react"
import Tabs from "./Tabs";
import Items from "./Items";
import Data from "../data/projects.json";
import { useState } from "react";
function Gallery(){

    const [data, setData] = useState(Data);
    const allCategories = Data.flatMap((value) => value.category);
    const tabsData = ["all", ...new Set(allCategories)];

    const filterCategory = (category) => {
        if (category === "all") {
            setData(Data);
            return;
        }
        const filteredData = Data.filter((value) => value.category.includes(category));
        setData(filteredData);
    }
    return(
     
        <div className="container">
      <div className="row">
          
            <div className="col-sm-12">
            <Tabs filterCategory={filterCategory} tabsData={tabsData}/>
            <Items data={data} />
            </div>
           
        </div>
           
       </div>
    
    )
}

export default Gallery;