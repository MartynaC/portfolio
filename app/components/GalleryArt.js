"use client";

import * as React from "react"
import Tabs from "./TabsArt";
import Items from "./ItemsArt";
import Data from "../data/art.json";
import { useState } from "react";

function GalleryArt() {
  const [data, setData] = useState(Data);

  // flatten categories from all items
  const allCategories = Data.flatMap((item) => item.category);
  const tabsData = ["all", ...new Set(allCategories)];

  const filterCategory = (category) => {
    if (category === "all") {
      setData(Data);
      return;
    }
    const filteredData = Data.filter((item) =>
      item.category.includes(category)
    );
    setData(filteredData);
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-12">
          <Tabs filterCategory={filterCategory} tabsData={tabsData} />
          <Items data={data} />
        </div>
      </div>
    </div>
  );
}

export default GalleryArt;
