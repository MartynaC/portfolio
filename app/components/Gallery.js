"use client";

import * as React from "react";
import { useState } from "react";
import Tabs from "./Tabs";
import Items from "./Items";
import Data from "../data/projects.json";

function Gallery() {
  const [data, setData] = useState(Data);
  const allCategories = Data.flatMap((value) => value.category);
  const tabsData = ["all", ...new Set(allCategories)];

  const filterCategory = (category) => {
    if (category === "all") {
      setData(Data);
      return;
    }
    setData(Data.filter((value) => value.category.includes(category)));
  };

  return (
    <div className="container" style={{ paddingLeft: 0, paddingRight: 0 }}>
      <div className="row">
        <div className="col-sm-12">
          <Tabs filterCategory={filterCategory} tabsData={tabsData} />
          <Items data={data} />
        </div>
      </div>
    </div>
  );
}

export default Gallery;
