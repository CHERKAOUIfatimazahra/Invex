import React, { createContext, useState } from "react";

export const WarehouseContext = createContext();

export const WarehouseProvider = ({ children }) => {
  const [warehouseId, setWarehouseId] = useState(null);
  const [warehousemanId, setWarehousemanId] = useState(null);

  return (
    <WarehouseContext.Provider
      value={{ warehouseId, setWarehouseId, warehousemanId, setWarehousemanId }}
    >
      {children}
    </WarehouseContext.Provider>
  );
};
